import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { withLatestFrom, flatMap, filter, map, tap, reduce, catchError } from 'rxjs/operators';

import { ofRoute } from './../../../shared/utils/rxjs/operators';

@Injectable()
export class TezosOperationHistoryEffects {

    @Effect()
    TezosWalletOperationHistory$ = this.actions$.pipe(
        ofRoute('/tezos/wallet/detail/:address'),
        map(() => ({ type: 'TEZOS_OPERATION_HISTORY_LOAD' }))
    )

    // get historical operation data  
    @Effect()
    TezosWalletOperationHistoryLoad$ = this.actions$.pipe(
        ofType('TEZOS_OPERATION_HISTORY_LOAD'),

        // get state from store
        withLatestFrom(this.store, (action, state: any) => ({ action, state })),

        flatMap(({ action, state }) => of([]).pipe(

            // // get number of  operation transactions
            // flatMap(() =>
            //     this.http.get('https://api3.tzscan.io/v2/number_operations/' + publicKeyHash + '?type=Transaction')
            // ),

            // get operation transactions
            flatMap(() =>
                this.http.get(
                    // get api url
                    state.tezos.tezosNode.nodes[state.tezos.tezosNode.api.name].tzscan.operations +
                    // get public key hash from url 
                    state.routerReducer.state.root.children[0].firstChild.params.address +
                    '?type=Transaction&p=0&number=50')
            ),

            // add publicKeyHash
            map(operations => ({
                publicKeyHash: state.routerReducer.state.root.children[0].firstChild.params.address,
                operations: operations,
            }))

        )
        ),
        // tap((response) => console.log('[TEZOS_OPERATION_HISTORY_LOAD_SUCCESS]', response)),
        map((response) => ({ type: 'TEZOS_OPERATION_HISTORY_LOAD_SUCCESS', payload: response })),
    )

    // get historical operation data  
    @Effect()
    TezosWalletOperationHistoryTimpeLoad$ = this.actions$.pipe(
        ofType('TEZOS_OPERATION_HISTORY_LOAD_SUCCESS'),

        // get state from store
        withLatestFrom(this.store, (action: any, state: any) => ({ action, state })),

        // create observable for each operation
        flatMap(({ action, state }) => action.payload.operations
            .map(operation => ({
                operation: operation,
                url: state.tezos.tezosNode.nodes[state.tezos.tezosNode.api.name].tzscan.block_timestamp
            }))
        ),

        // get block timestamp
        flatMap((state: any) =>
            of([]).pipe(
                flatMap(() =>
                    this.http.get(state.url + state.operation.block_hash)
                ),
                map(response => ({
                    timestamp: response[0],
                    hash: state.operation.hash,
                    block_hash: state.operation.block_hash,
                }))
            )
        ),
        // tap((response) => console.log('[operations] response', response)),
        map((response) => ({ type: 'TEZOS_OPERATION_HISTORY_BlOCK_TIMESTAMP_LOAD_SUCCESS', payload: response })),

    )

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<any>,
        private router: Router
    ) { }

}
