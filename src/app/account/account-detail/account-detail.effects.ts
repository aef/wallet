import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, tap, withLatestFrom, flatMap, catchError, defaultIfEmpty } from 'rxjs/operators';

import { initialize, transfer } from '../../../../tezos-wallet'

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

@Injectable()
export class AccountDetailEffects {

    @Effect()
    AccountTransaction$ = this.actions$.pipe(
        ofType('ACCOUNT_TRANSACTION'),
        // add state to effect
        withLatestFrom(this.store, (action, state) => state.accountDetail),
        // map(state => {
        //     return {
        //         secretKey: state.form.secretKey,
        //         publicKey: state.form.publicKey,
        //         publicKeyHash: state.form.from,
        //         to: state.form.to,
        //         amount: state.form.amount,
        //     }
        // }),
        // wait until sodium is ready
        initialize(),
        // transfer tokens
        transfer(state => ({
            secretKey: state.form.secretKey,
            publicKey: state.form.publicKey,
            publicKeyHash: state.form.from,
            to: state.form.to,
            amount: state.form.amount,
        })),

        // dispatch action based on result
        map(response => ({
            type: 'ACCOUNT_TRANSACTION_SUCCESS',
            payload: response
        })),
        catchError(error => of({
            type: 'ACCOUNT_TRANSACTION_ERROR',
            payload: error
        })),

        // redirect back to accounts list
        tap(() => this.router.navigate(['/accounts']))
    )

    @Effect()
    AccountTransactionTrezor$ = this.actions$.pipe(
        ofType('ACCOUNT_TRANSACTION_TREZOR'),
        // add state to effect
        withLatestFrom(this.store, (action, state) => state.accountDetail),
        // wait until sodium is ready
        initialize(),
        // transfer tokens
        transfer(state => ({
            publicKey: state.form.publicKey,
            publicKeyHash: state.form.from,
            to: state.form.to,
            amount: state.form.amount,
            fee: 0,
            walletType: 'TREZOR_T',
        })),

        // dispatch action based on result
        map(response => ({
            type: 'ACCOUNT_TRANSACTION_TREZOR_SUCCESS',
            payload: response
        })),
        catchError(error => of({
            type: 'ACCOUNT_TRANSACTION_TREZOR_ERROR',
            payload: error
        })),

        // redirect back to accounts list
        tap(() => this.router.navigate(['/accounts']))
    )

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<any>,
        private router: Router,
        private db: AngularFirestore,
    ) { }

}
