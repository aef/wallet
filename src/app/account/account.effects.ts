import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/timer';
import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { Effect, Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { async } from 'rxjs/scheduler/async';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { defer } from 'rxjs/observable/defer';
import { Buffer } from 'buffer/'
import sodium from 'libsodium-wrappers'
import bs58check from 'bs58check'
import bip39 from 'bip39'

@Injectable()
export class AccountEffects {

    public api = 'http://46.101.236.136:3000/'

    public prefix = {
        tz1: new Uint8Array([6, 161, 159]),
        edpk: new Uint8Array([13, 15, 37, 217]),
        edsk: new Uint8Array([43, 246, 78, 7]),
        edsig: new Uint8Array([9, 245, 205, 134, 18]),
        o: new Uint8Array([5, 116]),
    }

    // mnemonic
    // soap voice defense run leg bamboo remind dawn gravity start pony develop squeeze october blue
    
    @Effect()
    AccountCreate$: Observable<Action> = this.actions$
        .ofType('ACCOUNT_CREATE')
        // add state to effect
        .withLatestFrom(this.store, (action, state) => state.account)

        // get head from node
        .flatMap(state =>
            this.http.post(this.api + '/blocks/head', {})
                .map(response => response.json())

                // get counter from node
                .flatMap(head =>
                    this.http.post(this.api +
                        '/blocks/prevalidation/proto/context/contracts/' + state.keys.publicKeyHash + '/counter', {})
                        .map(response => response.json().ok)

                        // get predecessor from node
                        .flatMap(counter =>
                            this.http.post(this.api + '/blocks/prevalidation/predecessor', {})
                                .map(response => response.json().predecessor)

                                // forge operation
                                .flatMap(predecessorBlock => {
                                    console.log(head.timestamp, counter, predecessorBlock)
                                    return this.http.post(this.api + '/blocks/prevalidation/proto/helpers/forge/operations', {
                                        "net_id": head.net_id,
                                        "branch": predecessorBlock,
                                        "source": state.keys.publicKeyHash,
                                        "public_key": state.keys.publicKey,
                                        "fee": 0,
                                        "counter": counter + 1 ,
                                        "operations": [{
                                            "kind": "transaction",
                                            "amount": 100, // This is in centiles, i.e. 100 = 1.00 tez
                                            "destination": "tz1R2MbSrN3L5D8pkDfcxUCsAjn7PsxCH1Sb"
                                        }]
                                    })
                                        .map(response => response.json().ok.operation)

                                        // forge operation
                                        .flatMap(operationBytes => {

                                            let ok = sodium.crypto_sign_detached(
                                                hex2buf(operationBytes),
                                                p(state.keys.secretKey, this.prefix.edsk),
                                                'uint8array'
                                            );
                                            let ok58 = o(ok, this.prefix.edsig);
                                            let secretOperationBytes = operationBytes + buf2hex(ok);
                                            let operationHash = o(
                                                sodium.crypto_generichash(
                                                    32,
                                                    hex2buf(secretOperationBytes),
                                                    'uint8array'
                                                ),
                                                this.prefix.o
                                            );

                                            return this.http.post(this.api + '/blocks/prevalidation/proto/helpers/apply_operation', {
                                                "pred_block": predecessorBlock,
                                                "operation_hash": operationHash,
                                                "forged_operation": operationBytes,
                                                "signature": ok58
                                            })
                                                .map(response => response.json())

                                                // inject operation
                                                .flatMap(response =>
                                                    this.http.post(this.api + '/inject_operation', {
                                                        "signedOperationContents": secretOperationBytes,
                                                    })
                                                        .map(response => response.json())
                                                )
                                        })
                                })
                        )
                )

        )
        // dispatch action based on result
        .map(response => ({
            type: 'ACCOUNT_CREATE_SUCCESS',
            payload: response
        }))
        .catch(error => of({
            type: 'ACCOUNT_CREATE_ERROR',
            payload: error
        }))

    constructor(
        private actions$: Actions,
        private http: Http,
        private store: Store<any>
    ) { }

}

function o(payload, prefix) {
    var n = new Uint8Array(prefix.length + payload.length);
    n.set(prefix);
    n.set(payload, prefix.length);
    return bs58check.encode(new Buffer(n, 'hex'));
}

function p(enc, prefix) {
    var n = bs58check.decode(enc);
    n = n.slice(prefix.length);
    return n;
}

function buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function hex2buf(hex) {
    return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    }));
}