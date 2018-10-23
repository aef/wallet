import { ActionReducerMap, ActionReducer } from '@ngrx/store';

import * as fromTezosNode from './tezos-node/tezos-node.reducer';
import * as fromTezosWalletList from './tezos-wallet/tezos-wallet-list/tezos-wallet-list.reducer';
import * as fromTezosWalletDetail from './tezos-wallet/tezos-wallet-detail/tezos-wallet-detail.reducer';
import * as fromTezosWalletReceive from './tezos-wallet/tezos-wallet-receive/tezos-wallet-receive.reducer';
import * as fromTezosWalletSend from './tezos-wallet/tezos-wallet-send/tezos-wallet-send.reducer';
import * as fromTezosWalletDelegate from './tezos-wallet/tezos-wallet-delegate/tezos-wallet-delegate.reducer';

import * as fromTezosOperationTransaction from './tezos-operation/tezos-operation-transaction/tezos-operation-transaction.reducer';
import * as fromTezosOperationOrigination from './tezos-operation/tezos-operation-origination/tezos-operation-origination.reducer';
import * as fromTezosOperationDelegation from './tezos-operation/tezos-operation-delegation/tezos-operation-delegation.reducer';
import * as fromTezosOperationHistory from './tezos-operation/tezos-operation-history/tezos-operation-history.reducer';

import * as fromTezosTrezorConnect from './tezos-trezor/tezos-trezor-connect/tezos-trezor-connect.reducer';
import * as fromTezosTrezorNew from './tezos-trezor/tezos-trezor-new/tezos-trezor-new.reducer';

export interface State {
    tezosNode: any;
    tezosWalletList: any;
    tezosWalletDetail: any;
    tezosWalletReceive: any;
    tezosWalletSend: any;
    tezosWalletDelegate: any;
    tezosOperationTransaction: any;
    tezosOperationOrigination: any;
    tezosOperationDelegation: any;
    tezosOperationHistory: any;
    tezosTrezorConnect: any;
    tezosTrezorNew: any;
}

export const reducers: ActionReducerMap<State> = {
    tezosNode: fromTezosNode.reducer,
    tezosWalletList: fromTezosWalletList.reducer,
    tezosWalletDetail: fromTezosWalletDetail.reducer,
    tezosWalletReceive: fromTezosWalletReceive.reducer,
    tezosWalletSend: fromTezosWalletSend.reducer,
    tezosWalletDelegate: fromTezosWalletDelegate.reducer,
    tezosOperationTransaction: fromTezosOperationTransaction.reducer,
    tezosOperationOrigination: fromTezosOperationOrigination.reducer,
    tezosOperationDelegation: fromTezosOperationDelegation.reducer,
    tezosOperationHistory: fromTezosOperationHistory.reducer,
    tezosTrezorConnect: fromTezosTrezorConnect.reducer,
    tezosTrezorNew: fromTezosTrezorNew.reducer,
};
