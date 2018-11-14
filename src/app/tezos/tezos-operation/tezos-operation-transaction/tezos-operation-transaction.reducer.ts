
const initialState: any = {
    form: {
        to: '',//'tz1L6fGALjHqQkLkwMUQD94SXM5fViSkhEb6',
        amount: '', //'0',
        fee: 0,
    },
}

export function reducer(state = initialState, action) {
    switch (action.type) {

        // case 'TEZOS_OPERATION_TRANSACTION_DESTROY': {
        //     return {
        //         ...state,
        //         form: {
        //             ...initialState.form,
        //         },
        //     }
        // }

        // set form from router action
        case 'TEZOS_WALLET_SEND_SHOW': {
            return {
                ...state,
                form: {
                    ...state.form,
                    from: action.payload.routerState.root.children[0].firstChild.params.address ?
                        action.payload.routerState.root.children[0].firstChild.params.address : ''
                }
            }
        }

        case 'TEZOS_OPERATION_TRANSACTION_SUCCESS': {
            return {
                ...state,
                ...action.payload,
            }
        }
        
        default:
            return state;
    }
}