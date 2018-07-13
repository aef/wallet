import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import {
    map,
    switchMap,
    catchError,
    withLatestFrom,
    flatMap,
    tap,
    concatMap,
    mergeMap,
    concatMapTo,
    reduce,
    mergeAll, scan
} from 'rxjs/operators';
import * as TransactionActions from './transaction.actions';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { TransactionService } from "../service/transaction/transaction.service";
import {Store} from "@ngrx/store";
import {Transaction} from "../model/transaction.model";
import {forkJoin, concat, merge} from "rxjs";

@Injectable()
export class TransactionEffects {
    private accountId: string
    private maxPage: number
    private transactions: any[] = []

    private externalTransactions: any[] = [];

    constructor(private  actions$: Actions,
                private store: Store<any>,
                private db: AngularFirestore,
                private service: TransactionService) { }

    @Effect()
    GetExternTransactions$ = this.actions$.pipe(
        ofType(TransactionActions.EXTERN_TRANSACTIONS_GET),
        withLatestFrom(this.store, (action: TransactionActions.GetExternTransactions, state) => { return { accountId: action.payload, state: state.transaction } } ),
        flatMap((action) => {
            this.accountId = action.accountId;
            return this.service.getNumberTransactions(action.accountId)
        }),
        map(count => {
            this.maxPage = Math.ceil(count/20);
            return Array.from(Array(this.maxPage).keys());
        }),
        concatMap(pages => {
            const observables = pages.map(p => this.service.getTransactions(this.accountId, p))

            return forkJoin(observables)
        }),
        concatMap(transactionsArr => {
            const observables = [];
            transactionsArr.map(transactions => transactions.map(transaction =>
                 observables.push(this.service.getBlock(transaction.block_hash).pipe(
                     map(block => {
                         transaction['block'] = block;

                         this.transactions.push(transaction);
                         return transaction as Transaction
                     })
                 ))
            ))

            return forkJoin(observables);
        }),
        map(transactions => {
            console.log('response', transactions)
            return new TransactionActions.GetExternTransactionsSuccess(transactions)
        }),
        catchError((error) => of (new TransactionActions.TransactionErrorAction(error.message)))
    );

    @Effect()
    GetTransactions$ = this.actions$.pipe(
        ofType(TransactionActions.TRANSACTIONS_GET),
        map((action: TransactionActions.GetTransactions) => action.payload),
        switchMap(action => {
            const collection = this.db.collection<any>('transactions', ref => ref.where('acc','==', action).orderBy('timestamp', 'desc'));

            return collection.snapshotChanges().pipe(
                map(arr => arr.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data };
                }))
            );
        }),
        map((arr: any[]) => new TransactionActions.GetTransactionsSuccess(arr) )
    );

    @Effect()
    createTransaction$ = this.actions$.pipe(
        ofType(TransactionActions.TRANSACTION_CREATE),
        map((action: TransactionActions.CreateTransaction) => action.payload),
        switchMap(action  => {
            const collection = this.db.collection<any>('transactions');
            return collection.add(action);
        }),
        map((response) => new TransactionActions.CreateTransactionSuccess()),
        catchError((error) => of (new TransactionActions.TransactionErrorAction(error.message)))
    );
}
