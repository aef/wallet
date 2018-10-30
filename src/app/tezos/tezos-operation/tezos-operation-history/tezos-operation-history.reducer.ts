import * as moment from 'moment/moment';

const initialState: any = {
    ids: [],
    entities: {},
    page: 0,
    itemsPerPage: 10,
    itemsTotalCount: 0,
}

export function reducer(state = initialState, action) {
    switch (action.type) {

        case 'TEZOS_OPERATION_HISTORY_LOAD_SUCCESS': {

            return {
                ...state,
                ids: [
                    ...state.ids,
                    ...action.payload.operations.map(operation => operation.hash).reverse()
                ],
                entities: {
                    ...state.entities,
                    ...action.payload.operations.reduce((accumulator, operation) => {

                        let operationTransformed
                        if (operation.type.operations[0].kind === 'transaction' &&
                            operation.type.source.tz === action.payload.publicKeyHash) {

                            // console.log('[debit]', operation.type.operations[0], action.payload.publicKeyHash);

                            operationTransformed = {
                                operation: 'debit',
                                address: operation.type.operations[0].destination.tz,
                                amount: operation.type.operations[0].amount * -1,
                                fee: operation.type.operations[0].fee,
                            }
                        }

                        if (operation.type.operations[0].kind === 'transaction' &&
                            operation.type.source.tz !== action.payload.publicKeyHash) {

                            // console.log('[credit]', operation.type.operations[0], action.payload.publicKeyHash);

                            operationTransformed = {
                                operation: 'credit',
                                address: operation.type.operations[0].src.tz,
                                amount: operation.type.operations[0].amount * +1,
                                fee: operation.type.operations[0].fee,
                            }
                        }

                        if (operation.type.operations[0].kind === 'origination' &&
                            operation.type.source.tz === action.payload.publicKeyHash) {

                            // console.log('[origination] -', operation.type.operations[0], action.payload.publicKeyHash);

                            operationTransformed = {
                                operation: 'origination',
                                address: operation.type.operations[0].tz1.tz,
                                amount: operation.type.operations[0].balance * -1,
                                fee: operation.type.operations[0].fee,
                            }
                        }

                        if (operation.type.operations[0].kind === 'origination' &&
                            operation.type.source.tz !== action.payload.publicKeyHash) {

                            // console.log('[origination] +', operation.type.operations[0], action.payload.publicKeyHash);

                            operationTransformed = {
                                operation: 'origination',
                                address: operation.type.operations[0].src.tz,
                                amount: operation.type.operations[0].balance * +1,
                                fee: operation.type.operations[0].fee,
                            }
                        }

                        if (operation.type.operations[0].kind === 'delegation' &&
                            operation.type.source.tz === action.payload.publicKeyHash) {

                            // console.log('[delegation]', operation.type.operations[0], action.payload.publicKeyHash);

                            operationTransformed = {
                                operation: 'delegation',
                                address: operation.type.operations[0].delegate.tz,
                                fee: operation.type.operations[0].fee,
                            }
                        }


                        return {
                            ...accumulator,
                            [operation.hash]: {
                                hash: operation.hash,
                                ...operationTransformed,
                            }
                        }
                    }, {})
                },
            }
        }

        case 'TEZOS_OPERATION_HISTORY_BlOCK_TIMESTAMP_LOAD_SUCCESS': {

            // add timestamp to state
            let stateExtended = {
                ...state,
                entities: {
                    ...state.entities,
                    [action.payload.hash]: {
                        ...state.entities[action.payload.hash],
                        timestamp: action.payload.timestamp,
                        datetime:
                            // us timestamp
                            // moment(action.payload.timestamp).format('MMM DD YYYY, h:mm:ss a'),
                            // eu timestamp
                            moment(action.payload.timestamp).format('DD MMM YYYY, HH:mm:ss'),
                    }
                }
            }

            // sort state according to time stamp 
            return {
                ...stateExtended,
                ids: stateExtended.ids.slice().sort((a: any, b: any) =>
                    new Date(stateExtended.entities[b].timestamp).getTime() - new Date(stateExtended.entities[a].timestamp).getTime()
                )
            }
        }

        case 'TEZOS_OPERATION_HISTORY_DESTROY': {
            return {
                ...initialState,
            }
        }

        case 'TEZOS_NODE_HISTORICAL_PRICE_UPDATE_SUCCESS': {

            return {
                ...state,
                historicalPrice: {
                    ids: [
                        ...action.payload.Data.map(price => price.time)
                    ],
                    entities: action.payload.Data.reduce((accumulator, price) => ({
                        ...accumulator,
                        [price.time]: {
                            ...price,
                        }
                    }), {})

                }
            }
        }

        default:
            return state;
    }
}