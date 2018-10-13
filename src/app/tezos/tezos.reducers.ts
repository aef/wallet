import { ActionReducerMap, ActionReducer } from '@ngrx/store';

import * as fromTezosNode from './tezos-node/tezos-node.reducer';
import * as fromTezosWalletList from './tezos-wallet/tezos-wallet-list/tezos-wallet-list.reducer';
import * as fromTezosWalletDetail from './tezos-wallet/tezos-wallet-detail/tezos-wallet-detail.reducer';
import * as fromTezosWalletSend from './tezos-wallet/tezos-wallet-send/tezos-wallet-send.reducer';

import * as fromTezosOperationTransaction from './tezos-operation/tezos-operation-transaction/tezos-operation-transaction.reducer';
import * as fromTezosOperationOrigination from './tezos-operation/tezos-operation-origination/tezos-operation-origination.reducer';
import * as fromTezosOperationDelegation from './tezos-operation/tezos-operation-delegation/tezos-operation-delegation.reducer';
import * as fromTezosOperationHistory from './tezos-operation/tezos-operation-history/tezos-operation-history.reducer';


export interface State {
    tezosNode: any;
    tezosWalletList: any;
    tezosWalletDetail: any;
    tezosWalletSend: any;
    tezosOperationTransaction: any;
    tezosOperationOrigination: any;
    tezosOperationDelegation: any;
    tezosOperationHistory: any;
}

export const reducers: ActionReducerMap<State> = {
    tezosNode: fromTezosNode.reducer,
    tezosWalletList: fromTezosWalletList.reducer,
    tezosWalletDetail: fromTezosWalletDetail.reducer,
    tezosWalletSend: fromTezosWalletSend.reducer,
    tezosOperationTransaction: fromTezosOperationTransaction.reducer,
    tezosOperationOrigination: fromTezosOperationOrigination.reducer,
    tezosOperationDelegation: fromTezosOperationDelegation.reducer,
    tezosOperationHistory: fromTezosOperationHistory.reducer
};
