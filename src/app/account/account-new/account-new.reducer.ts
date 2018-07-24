import * as bs58check from 'bs58check'
import * as bip39 from 'bip39'
import * as sodium from 'libsodium-wrappers-sumo'
import * as pbkdf2 from 'pbkdf2'
import { Buffer } from 'buffer/'

export const prefix = {
    tz1: new Uint8Array([6, 161, 159]),
    edpk: new Uint8Array([13, 15, 37, 217]),
    edsk: new Uint8Array([43, 246, 78, 7]),
    edsk2: new Uint8Array([13, 15, 58, 7]),
    edsig: new Uint8Array([9, 245, 205, 134, 18]),
    o: new Uint8Array([5, 116]),
}

const initialState: any = {
    form: {},
    keys: {
        secretKey: '',
        publicKey: '',
        publicKeyHash: '',
    }
}

export function reducer(state = initialState, action) {
    switch (action.type) {

        // generate menmonic
        case 'ACCOUNT_NEW_GENERATE_MNEMONIC':
            return Object.assign({}, state, {
                form: {
                    ...state.form,
                    mnemonic: bip39.generateMnemonic(160),
                }
            })

        // generate keyPair
        case 'ACCOUNT_NEW_GENERATE_KEYS':
            let seed = bip39.mnemonicToSeed(state.form.mnemonic, state.form.passpharse).slice(0, 32);
            // keyType ed25519
            let keyPair = sodium.crypto_sign_seed_keypair(seed);
            console.log('[keyPair]', keyPair)
            let privateKeyTemp = keyPair.privateKey.slice(0, 32)

            let passwordHash = sodium.crypto_pwhash_str(state.form.passpharse, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE)

            return Object.assign({}, state, {
                keys: {
                    secretKey: o(privateKeyTemp, prefix.edsk2),
                    publicKey: o(keyPair.publicKey, prefix.edpk),
                    publicKeyHash: o(sodium.crypto_generichash(20, keyPair.publicKey), prefix.tz1),
                    passwordHash: passwordHash
                }
            })

        // update state with form data
        case 'ACCOUNT_NEW_FORM_CHANGE': {
            return Object.assign({}, state, {
                form: action.payload,
            })
        }

        default:
            return state;
    }
}

// helper function for bs58 encode 
export function o(payload, prefix) {
    let n = new Uint8Array(prefix.length + payload.length);
    n.set(prefix);
    n.set(payload, prefix.length);
    return bs58check.encode(new Buffer(n, 'hex'));
}

// function base58CheckEncode(payload, prefix) {
//     const prefixBytes = getBase58BytesForPrefix(prefix);
//     const prefixedPayload = Buffer.concat([prefixBytes, payload]);
//     return base58Check.encode(prefixedPayload);
// }
// function base58CheckDecode(s, prefix) {
//     const prefixBytes = getBase58BytesForPrefix(prefix);
//     prefixBytes = new Buffer([6, 161, 159]);
//     const charsToSlice = prefixBytes.length;
//     const decoded = base58Check.decode(s);
//     return decoded.slice(charsToSlice);
// }