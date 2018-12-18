export default class OAuthClient {
    constructor(client) {
        this.client = client
    }

    setCredentials({ redirectUri, clientId, clientSecret }) {
        throw Error('Not implemented')
    }

    setAccessToken(str) {
        throw Error('Not implemented')
    }
    
    setRefreshToken(str) {
        throw Error('Not implemented')
    }
    
    refreshAccessToken() {
        throw Error('Not implemented')
    }
    
    authorizationCodeGrant(code) {
        throw Error('Not implemented')
    }
    
    createAuthorizeURL(scopes, state) {
        throw Error('Not implemented')
    }
}
