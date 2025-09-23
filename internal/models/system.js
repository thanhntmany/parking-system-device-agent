import { randomBytes, scryptSync } from 'node:crypto'

const saltLen = 255
const hashLen = 255
const computeHash = (code, salt) => scryptSync(code, salt, hashLen)
const compareCodes = (codeA, codeBSalt, codeBHash) => Buffer.compare(computeHash(codeA, codeBSalt), codeBHash) === 0
const passwordEncode = 'hex'


export default async app => {
    const config = await app.import('config')
    config.merge({
        system: {
            master: {
                password: {
                }
            }
        }
    })

    return {
        getCurPassword(ctx) {
            // #TODO: validate rights from ctx
            return config.system.master.password
        },

        // Note: undefined salt means there is no oldPassword
        hasMasterPassword(ctx) {
            return (this.getCurPassword()?.salt || '').length > 0
        },

        validateMasterPassword(ctx, password) {
            if (!this.hasMasterPassword()) return true
            const curPassword = this.getCurPassword(ctx)
            var salt = Buffer.from(curPassword.salt || "", passwordEncode)
            var hash = Buffer.from(curPassword.hash || "", passwordEncode)
            return compareCodes(password, salt, hash)
        },

        async setMasterPassword(ctx, password, oldPassword) {
            if (!this.validateMasterPassword(ctx, String(oldPassword))) throw Error("Password is Incorrect.")

            // set new master password
            const salt = randomBytes(saltLen)
            const hash = computeHash(String(password), salt)

            const curPassword = this.getCurPassword(ctx)
            curPassword.salt = salt.toString(passwordEncode)
            curPassword.hash = hash.toString(passwordEncode)
            await config.save()

            return true
        },

    }
}
