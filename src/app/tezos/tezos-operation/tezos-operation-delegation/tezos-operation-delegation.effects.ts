import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { withLatestFrom, flatMap, map, tap, delay, catchError } from 'rxjs/operators';

import { initializeWallet, setDelegation, originateContract, confirmOperation } from '../../../../../tezos-wallet'

@Injectable()
export class TezosOperationDelegationEffects {

    @Effect()
    TezosOperationDelegation$ = this.actions$.pipe(
        ofType('TEZOS_OPERATION_DELEGATION'),

        // add state to effect
        withLatestFrom(this.store, (action: any, state) => ({ action, state })),

        flatMap(({ action, state }) => of([]).pipe(

            // wait until sodium is ready
            initializeWallet(stateWallet => ({
                secretKey: state.tezos.tezosWalletDetail.secretKey,
                publicKey: state.tezos.tezosWalletDetail.publicKey,
                publicKeyHash: state.tezos.tezosWalletDetail.publicKeyHash,
                // set tezos node
                node: state.tezos.tezosNode.api,
                // set wallet type: WEB, TREZOR_ONE, TREZOR_T
                type: action.payload.walletType,
                // set HD path for HW wallet
                path: state.tezos.tezosWalletDetail.path ? state.tezos.tezosWalletDetail.path : undefined
            })),

            // if we have implicit contract originate new contract 
            flatMap(stateWallet => state.tezos.tezosWalletDetail.delegate.setable === true ?

                // delegate funds
                of(stateWallet).pipe(
                    setDelegation(stateWallet => ({
                        to: state.tezos.tezosOperationDelegation.form.to,
                    }))
                ) :

                // originate contract with delegation 
                of(stateWallet).pipe(
                    originateContract(stateWallet => ({
                        to: state.tezos.tezosOperationDelegation.form.to,
                        amount: state.tezos.tezosOperationDelegation.form.amount,
                    }))
                )

            ),

        )),
        tap(response => console.log('[TEZOS_OPERATION_DELEGATION_SUCCESS]', response)),
        // dispatch action based on result
        map((data: any) => ({
            type: 'TEZOS_OPERATION_DELEGATION_SUCCESS',
            payload: { injectionOperation: data.injectionOperation }
        })),
        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_OPERATION_DELEGATION_ERROR',
                payload: error.message,
            });
            return caught;
        }),

    )

    // check mempool for operation
    @Effect()
    TezosOperationDelegationPending$ = this.actions$.pipe(
        ofType('TEZOS_OPERATION_DELEGATION_SUCCESS'),

        // add state to effect
        withLatestFrom(this.store, (action: any, state: any) => ({ action, state })),

        flatMap(({ action, state }) => of([]).pipe(

            // wait until sodium is ready
            initializeWallet(stateWallet => ({
                // set tezos node
                node: state.tezos.tezosNode.api,
            })),

            // wait until operation is confirmed & moved from mempool to head
            confirmOperation(stateWallet => ({
                injectionOperation: action.payload.injectionOperation,
            })),

            map(() => ({ action, state }))
        )),

        map(({ action, state }) => ({
            type: 'TEZOS_OPERATION_DELEGATION_PENDING_SUCCESS',
            payload: {
                wallet: {
                    publicKeyHash: state.tezos.tezosWalletDetail.publicKeyHash
                },
            },
        })),

        // wait for tzscan to process tranzaction
        delay(3000),

        // redirect to wallet detail
        tap((action) => {
            this.router.navigate(['/tezos/wallet/detail/' + action.payload.wallet.publicKeyHash])
        }),
    )

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<any>,
        private router: Router
    ) { }

}
