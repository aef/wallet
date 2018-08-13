
const initialState: any = {
    api: {
        name: 'Zero',
        url: 'https://zeronet.simplestaking.com:3000'
    },
    nodes: [{
        name: 'Zero',
        url: 'https://zeronet.simplestaking.com:3000'
    }, {
        name: 'Beta',
        url: 'https://node2.simplestaking.com:3000'
    }],
    form: {},
}

export function reducer(state = initialState, action) {
    switch (action.type) {

        // update state with form data
        case 'TEZOS_NODE_INIT_SUCCESS': {
            console.warn('[TEZOS_NODE_INIT_SUCCESS] ', action.payload, state.form)
            return Object.assign({}, state, {
                form: {
                    ...state.form,
                    ...action.payload
                },
            })
        }

        // change tezos node 
        case 'TEZOS_NODE_CHANGE': {
            return {
                ...state,
                api: action.payload
            }
        }

        default:
            return state;
    }
}