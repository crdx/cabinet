const PORT = 5432
const REDIRECT_URI = 'http://localhost:' + PORT

import { spawn } from 'child_process'
import express from 'express'

import CredsStore from '../store/CredsStore'

import { log, epoch, secs2human } from '../util'

export default class OAuthSession {
    constructor(client, clientId, clientSecret, scopes, ns) {
        client.setCredentials({
            redirectUri:  REDIRECT_URI,
            clientSecret: clientSecret,
            clientId:     clientId,
        })

        this.scopes = scopes
        this.client = client
        this.credsStore = new CredsStore(ns)
    }

    hasExpired() {
        return this.expiryTimeSeconds() <= 0
    }

    expiryTimeSeconds() {
        return Math.floor(this.tokens.expiresAt - epoch())
    }

    fromResponse({ body }) {
        return {
            refreshToken: body.refresh_token,
            accessToken:  body.access_token,
            expiresIn:    body.expires_in,
            expiresAt:    Math.floor(epoch() + body.expires_in),
            tokenType:    body.token_type,
            scope:        body.scope,
        }
    }

    expiredAgo() {
        return secs2human(-this.expiryTimeSeconds())
    }

    expiresIn() {
        return secs2human(this.expiryTimeSeconds())
    }

    updateTokens(newTolkiens, { saveToStore = false } = {}) {
        const oldTolkiens = this.tokens
        this.tokens = { ...oldTolkiens, ...newTolkiens }

        this.client.setAccessToken(this.tokens.accessToken)
        this.client.setRefreshToken(this.tokens.refreshToken)

        saveToStore && this.saveToStore(this.tokens)

        this.showStatus()
    }

    showStatus() {
        if (this.hasExpired()) {
            log(`Current access token expired ${this.expiredAgo()} ago`)
        } else {
            log(`Current access token expires in ${this.expiresIn()}`)
        }
    }

    saveToStore(tokens) {
        this.credsStore.setJSON('tokens', tokens)
    }

    async checkExpired() {
        if (this.hasExpired()) {
            return this.refreshAccessToken()
        }
    }

    async refreshAccessToken() {
        log('Refreshing access token')

        const response = await this.client.refreshAccessToken()
        const tokens = this.fromResponse(response)

        // The merge will overwrite the refreshToken even if this is undefined.
        // Remove it completely so we don't lose our refreshToken.
        if (!tokens.refreshToken) {
            delete tokens.refreshToken
        }

        this.updateTokens(tokens, { saveToStore: true })
    }

    async getNewTokens() {
        const code = await this.getAuthorisationCode()
        const response = await this.client.authorizationCodeGrant(code)

        return this.fromResponse(response)
    }

    async loadFromStore() {
        const tokens = this.credsStore.getJSON('tokens')

        if (tokens) {
            this.updateTokens(tokens)
            await this.checkExpired()
            return true
        }

        return false
    }

    async loadNew() {
        log('Getting new tokens')
        const tokens = await this.getNewTokens()
        this.updateTokens(tokens, { saveToStore: true })
        return true
    }

    async getAuthorisationCode() {
        return new Promise((resolve, reject) => {
            const app = express()

            const server = app.listen(PORT, () => {
                log('Server listening on port ' + PORT)

                app.get('/', (req, res) => {
                    resolve(req.query.code)
                    res.send('Thanks. You can now close this tab.')
                    server.close()
                })

                const url = this.client.createAuthorizeURL(this.scopes, '')
                log('Opening authorisation page')
                spawn('xdg-open', [url])
            })
        })
    }

    async init() {
        const r = await this.loadFromStore() || await this.loadNew()
        if (!r) {
            throw Error('Unable to get tokens')
        }
    }
}
