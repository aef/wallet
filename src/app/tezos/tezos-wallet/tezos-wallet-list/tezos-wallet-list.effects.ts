
import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of, from } from 'rxjs';
import { map, withLatestFrom, flatMap, catchError, filter, tap, mergeAll } from 'rxjs/operators';
import { ofRoute, enterZone } from './../../../shared/utils/rxjs/operators';

import { initializeWallet, getWallet } from 'tezos-wallet'

import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { FirebaseOperation } from '../../tezos-operation/tezos-operation-history/tezos-operation-history.operation';

export interface FirebaseWalletBalance{
    name: number
    value: number
    balance: number
}

export interface FirebaseWalletHistoryDoc {
    dailyBalances: Record<string, FirebaseWalletBalance>
    publicKeyHash: string
    operations: Record<string, FirebaseOperation>
}


@Injectable()
export class TezosWalletListEffects {

    public accountDoc: AngularFirestoreDocument<any>;

    // trigger data load based on navigation change  
    @Effect()
    TezosWalletList$ = this.actions$.pipe(
        ofRoute('/tezos/wallet'),
        map(() => ({ type: 'TEZOS_WALLET_LIST_LOAD' })),
        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_WALLET_LIST_LOAD_ERROR',
                payload: error.message,
            });
            return caught;
        }),
    )

    // load wallet data 
    @Effect()
    TezosWalletListLoad$ = this.actions$.pipe(
        ofType('TEZOS_WALLET_LIST_LOAD'),
        // get state from store
        withLatestFrom(this.store, (action, state: any) => state),

        // get data from firebase 
        // TODO: move to custom rxjs operator
        flatMap(state =>
            this.db.collection(
                'tezos_' + state.tezos.tezosNode.api.name + '_wallet',
                // why we are filtering for null uid? Useless and lead to composit index without reason!
                query => query.orderBy('name', 'asc')
            ).valueChanges().pipe(

                // show only valid trezor addresses or dektop with private key 
                map(addresses => addresses
                    .filter((address: any) =>
                        // show all, we have no Trezor addresses 
                        state.tezos.tezosTrezorNew.ids.length === 0 ||
                        // show only valid Trezor address    
                        state.tezos.tezosTrezorNew.ids.includes(address.manager) ||
                        // show only valid Desktop address
                        (!address.type && address.secretKey)
                    )
                )
            )
        ),
        tap(data => console.log('^^^^^^', data)),
        map(response => ({ type: 'TEZOS_WALLET_LIST_LOAD_SUCCESS', payload: response })),
        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_WALLET_LIST_LOAD_ERROR',
                payload: error.message,
            });
            return caught;
        }),
    )

    // get wallet balance 
    @Effect()
    TezosWalletListBalanceUpdate$ = this.actions$.pipe(
        ofType('TEZOS_WALLET_LIST_LOAD_SUCCESS'),

        // get state from store
        withLatestFrom(this.store, (action, state: any) => state),

        // get all accounts address
        flatMap((state: any) => state.tezos.tezosWalletList.ids
            // TODO: temp comment to see changes fast
            // .filter(id =>
            //     // get balance only if last download is older than 3 mins
            //     (new Date().getTime() - state.tezos.tezosWalletList.entities[id].timestamp) < (5 * 60 * 1000) ? false : true
            // )
            .map(id => ({
                node: state.tezos.tezosNode.api,
                detail: state.tezos.tezosWalletList.entities[id],
            }))
        ),

        flatMap((state: any) => of([]).pipe(

            // initialie 
            initializeWallet(stateWallet => ({
                publicKeyHash: state.detail.publicKeyHash,
                node: state.node,
                detail: state.detail,
            })),

            // get wallet info
            getWallet(),

            // enter back into zone.js so change detection works
            enterZone(this.zone),

        )),


        flatMap((state: any) => {

            // save only if balance changed 
            if (state.wallet.detail.balance !== state.getWallet.balance) {

                // TODO: move to custom rxjs operator
                // update balance on firebase
                this.accountDoc = this.db.doc('tezos_' + state.wallet.node.name + '_wallet/' + state.wallet.publicKeyHash);
                return of([]).pipe(
                    flatMap(() =>
                        this.accountDoc
                            .update({ balance: state.getWallet.balance })
                            .catch(err => {
                                console.error('[firebase] tezos_' + state.wallet.node.name + '_wallet/' + state.wallet.publicKeyHash, err);
                            })
                    ),
                    map(() => state),
                )
            }

            return of(state)
        }),

        map(action => ({ type: 'TEZOS_WALLET_LIST_NODE_DETAIL_SUCCESS', payload: action })),

        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_WALLET_LIST_NODE_DETAIL_ERROR',
                payload: error.message,
            });
            return caught;
        })

    )

    @Effect()
    TezosWalletOperationHistoryBalancesUpdate$ = this.actions$.pipe(
        ofType('TEZOS_WALLET_LIST_LOAD_SUCCESS'),

        withLatestFrom(
            this.store,
            (action, state) => ({ action, state })
        ),

        // get selected docs together
        flatMap(({ action, state }) => {

            const addresses: string[] = state.tezos.tezosWalletList.ids;
            const promises = addresses.map(address => {

                return this.db.collection(
                    `tezos_${state.tezos.tezosNode.api.name}_history`
                )
                    .doc(address)
                    .get().toPromise().then(doc => doc.data())

            });

            return Promise.all(promises).then(response => response)
        }),     

        map(data => ({ type: 'TEZOS_WALLET_LIST_BALANCES_LOAD_SUCCESS', payload: data })),

        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_WALLET_LIST_BALANCES_LOAD_ERROR',
                payload: error.message,
            });
            return caught;
        })
    )

    constructor(
        private actions$: Actions,
        private store: Store<any>,
        private db: AngularFirestore,
        private zone: NgZone
    ) { }

}
