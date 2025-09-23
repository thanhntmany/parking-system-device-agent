export const deepAssign = (target, source) => {
    for (const [key, value] of Object.entries(source))
        if (Object.prototype.toString.call(value) === '[object Object]' && key in target) {
            deepAssign(Object.hasOwn(target, key) ? target[key] : (target[key] = Object.create(target[key])), value)
        }
        else target[key] = value
}

export const flattenObject = obj => {
    const out = {}
    for (var key in obj) out[key] = obj[key]
    return out
}
