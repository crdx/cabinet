import Store from './Store'

import { requireEnv } from '../util'

export default class CredsStore extends Store {
    constructor(ns) {
        const { CREDS_STORE } = requireEnv(['CREDS_STORE'])
        super(CREDS_STORE, ns)
    }
}
