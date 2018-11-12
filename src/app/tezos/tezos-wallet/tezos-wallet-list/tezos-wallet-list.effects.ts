
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { map, withLatestFrom, flatMap, catchError, filter, tap } from 'rxjs/operators';

import { ofRoute } from 'app/shared/utils/rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { initializeWallet, getWallet } from '../../../../../tezos-wallet'

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
            of([]).pipe(
                // get data from firebase 
                flatMap(() => this.db.collection('tezos_' + state.tezos.tezosNode.api.name + '_wallet',
                    query => query.where('uid', '==', null)
                        .orderBy('name', 'asc')
                ).valueChanges()),
                // show only valid trezor addresses or dektop with private key 
                map(addresses => addresses
                    .filter((address:any) =>
                        state.tezos.tezosTrezorNew.ids.includes(address.manager) || 
                        (!address.type && address.secretKey) 
                    )
                )
            )
        ),
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
            //     // get balnce only if last downlaod is older than 3 mins
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
        }),

    )

    constructor(
        private actions$: Actions,
        private store: Store<any>,
        private db: AngularFirestore,
    ) { }

}
