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
                    // mnemonic: bip39.generateMnemonic(160),
                }
            })

        // generate keyPair
        case 'ACCOUNT_NEW_GENERATE_KEYS':
            // let seed = bip39.mnemonicToSeed(state.form.mnemonic, state.form.passpharse).slice(0, 32);
            // // keyType ed25519
            // let keyPair = sodium.crypto_sign_seed_keypair(seed);
            // console.log('[keyPair]', keyPair)
            // let privateKeyTemp = keyPair.privateKey.slice(0, 32)
            // debugger
            return Object.assign({}, state, {
                keys: {
                    // secretKey: o(privateKeyTemp, prefix.edsk2),
                    // publicKey: o(keyPair.publicKey, prefix.edpk),
                    // publicKeyHash: o(sodium.crypto_generichash(20, keyPair.publicKey), prefix.tz1),
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

