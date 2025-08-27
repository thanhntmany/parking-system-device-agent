import { resolve, join, relative } from 'node:path'
import { readFileSync, statSync } from 'node:fs'


const readFileContent = file => {
    try {
        return readFileSync(file, 'utf8')
    } catch (err) {
        console.error(err);
    }
    return ""
}

const CACHE = {}

function loadAndCache(path) {
    return CACHE[path] = readFileContent(path)
}

// #TODO: in dev mode, check and reload file if needed

export default function get() {
    const path = resolve(join.apply(null, arguments))
    return CACHE[path] || loadAndCache(path)
}