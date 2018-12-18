export const log    = (...args) => console.log('>', ...args)
export const logArg = (arg)     => console.log(arg)

export const bytes2human = (b) => Math.round(b / 1024) + 'K'

export const epoch  = ()     => new Date().getTime() / 1000
export const plural = (w, n) => n == 1 ? w : w + 's'
export const sum    = (a, b) => a + b

export const toListItem = (s) => '  - ' + s

export function requireEnv(keys) {
    let env = {}

    for (const key of keys) {
        if (typeof process.env[key] == 'undefined') {
            console.error(`Error: environment variable ${k} not defined.`)
            process.exit(1)
        }
        env[key] = process.env[key]
    }

    return env
}

export function secs2human(n) {
    const m = [
        { w: 'week', v: 60 * 60 * 24 * 7 },
        { w: 'day',  v: 60 * 60 * 24 },
        { w: 'hour', v: 60 * 60 },
        { w: 'min',  v: 60 },
        { w: 'sec',  v: 0 },
    ]

    const a = [], s = ' '

    for (const { w, v } of m) {
        if (n < v) continue
        const x = v ? Math.floor(n / v) : n
        a.push([x, plural(w, x)])
        n = n % v
    }

    return a.map(e => e.join(s)).join(s)
}

export async function concatPages(offset, limit, getPage) {
    let all = []

    while (true) {
        const current = await getPage(offset, limit)
        all = all.concat(current)

        if (current.length != limit) {
            break
        }

        offset += limit
    }

    return all
}
