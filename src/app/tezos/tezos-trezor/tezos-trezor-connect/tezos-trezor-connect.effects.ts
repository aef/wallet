
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { of, empty } from 'rxjs';
import { map, withLatestFrom, catchError, flatMap, tap } from 'rxjs/operators';

import TrezorConnect, { DEVICE, TRANSPORT, UI } from 'trezor-connect';
import { environment } from '../../../../environments/environment';


@Injectable()
export class TezosTrezorConnectEffects {

    // connect trezor and and listen to trezor events   
    @Effect()
    TezosTrezorConnect = this.actions$.pipe(
        ofType('TEZOS_TREZOR_CONNECT'),

        // add state to effect
        withLatestFrom(this.store, (action, state) => state),

        // TODO: ! refactor tap to flatMap so we can catch error
        tap((state: any) => {

            // TODO: refactor windows.TrezorConnect 
            if (!(<any>window).TrezorConnect) {
                (<any>window).TrezorConnect = TrezorConnect
            }

            // if iframe exist do no initialize again
            if (!document.getElementById('trezorconnect')) {

                TrezorConnect.on('DEVICE_EVENT', (event) => {
                    console.log('[TrezorConnect][DEVICE_EVENT]', event);
                    switch (event.type) {

                        case DEVICE.CONNECT: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_DEVICE_CONNECT',
                                payload: event,
                            })
                        }
                        case DEVICE.CHANGED: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_DEVICE_CHANGED',
                                payload: event,
                            })
                        }

                        case DEVICE.CONNECT_UNACQUIRED: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_DEVICE_CONNECT_UNACQUIRED',
                                payload: event,
                            })
                        }

                        case DEVICE.DISCONNECT: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_DEVICE_DISCONNECT',
                                payload: event,
                            })
                        }

                        case DEVICE.BUTTON: {

                            console.warn('[DEVICE.BUTTON]', event.payload.code);

                            switch (event.payload.code) {

                                case 'ButtonRequest_Address': {
                                    return this.store.dispatch({
                                        type: 'TEZOS_TREZOR_CONNECT_DEVICE_BUTTON_ADDRESS',
                                        payload: event,
                                    })
                                }

                                case 'ButtonRequest_SignTx': {
                                    return this.store.dispatch({
                                        type: 'TEZOS_TREZOR_CONNECT_DEVICE_BUTTON_SIGNTX',
                                        payload: event,
                                    })
                                }

                                case 'ButtonRequest_PassphraseType': {
                                    return this.store.dispatch({
                                        type: 'TEZOS_TREZOR_CONNECT_DEVICE_BUTTON_PASSPHRASE',
                                        payload: event,
                                    })
                                }

                                default: {
                                    return this.store.dispatch({
                                        type: 'TEZOS_TREZOR_CONNECT_DEVICE_BUTTON',
                                        payload: event,
                                    })
                                }

                            }
                        }

                        default:
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_DEVICE',
                                payload: event,
                            })
                    }

                });

                TrezorConnect.on('TRANSPORT_EVENT', (event) => {
                    console.log('[TrezorConnect][TRANSPORT_EVENT]', event);
                    switch (event.type) {

                        case TRANSPORT.START: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_TRANSPORT_START',
                                payload: event,
                            })
                        }

                        case TRANSPORT.ERROR: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_TRANSPORT_ERROR',
                                payload: event,
                            })
                        }

                        default: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_TRANSPORT',
                                payload: event,
                            })
                        }
                    }

                });

                TrezorConnect.on('UI_EVENT', (event) => {
                    console.log('[TrezorConnect][UI_EVENT]', event);
                    switch (event.type) {

                        // request password  device
                        case 'ui-request_passphrase_on_device': {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_UI_REQUEST_PASSPHRASE_DEVICE',
                                payload: event,
                            })
                        }

                        case 'ui-close_window': {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_UI_CLOSE_WINDOWS',
                                payload: event,
                            })
                        }

                        // request password application
                        case 'ui-request_passphrase': {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_UI_REQUEST_PASSPHRASE_HOST',
                                payload: event,
                            })
                        }

                        default: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_UI',
                                payload: event,
                            })
                        }
                    }
                });

                TrezorConnect.on('RESPONSE_EVENT', (event) => {
                    console.log('[TrezorConnect][RESPONSE_EVENT]', event);
                    switch (event.type) {
                        default: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_RESPONSE',
                                payload: event,
                            })
                        }
                    }
                });

                TrezorConnect.on('CORE_EVENT', (event) => {
                    console.log('[TrezorConnect][CORE_EVENT]', event);
                    switch (event.type) {
                        default: {
                            return this.store.dispatch({
                                type: 'TEZOS_TREZOR_CONNECT_CORE',
                                payload: event,
                            })
                        }
                    }
                });

                // Initialize TrezorConnect 
                TrezorConnect.init({
                    
                    connectSrc: environment.trezor.connectSrc,
                    frame_src: environment.trezor.frame_src,
                    popup_src: environment.trezor.popup_src,

                    popup: environment.trezor.popup,
                    trustedHost: environment.trezor.trustedHost,
                    webusb: environment.trezor.webusb,
                    
                    // try to reconect when bridge is not working
                    transportReconnect: environment.trezor.transportReconnect,
                    debug: environment.trezor.debug,

                }).then(response => console.log('[TrezorConnect][init]', response))
                    .catch(error => {
                        console.error('[ERROR][TrezorConnect][init]', error)
                        this.store.dispatch({
                            type: 'TEZOS_TREZOR_CONNECT_INIT_ERROR',
                            payload: error,
                        })
                    });
            }

        }),
        map(() => ({ type: 'TEZOS_TREZOR_CONNECT_SUCCESS' })),
        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_TREZOR_CONNECT_ERROR',
                payload: error.message,
            });
            return caught;
        }),
    )

    @Effect()
    TezosTrezorConnectClose = this.actions$.pipe(
        ofType('TEZOS_TREZOR_CONNECT_CLOSE'),

        // add state to effect
        withLatestFrom(this.store, (action, state) => state),

        // remove iframe if transport failed
        // TODO: ! refactor tap to flatMap so we can catch error
        tap((state: any) => {
            if (state.tezos.tezosTrezorConnect.status.error === true) {
                // check if iframe exist
                if (document.getElementById('trezorconnect')) {
                    TrezorConnect.dispose()
                }
            }
        }),

        map(() => ({ type: 'TEZOS_TREZOR_CONNECT_CLOSE_SUCCESS' })),
        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_TREZOR_CONNECT_CLOSE_ERROR',
                payload: error.message,
            });
            return caught;
        }),
    )

    // listen to device connection   
    // get all new address from trezor
    @Effect()
    TezosTrezorConnectDeviceConnect = this.actions$.pipe(
        ofType('TEZOS_TREZOR_CONNECT_DEVICE_CONNECT'),

        // add state to effect
        withLatestFrom(this.store, (action, state) => ({ state, action })),

        flatMap(({ state, action }) => {

            console.warn('[TEZOS_TREZOR_CONNECT_DEVICE_CONNECT] connected ',
                state.tezos.tezosTrezorConnect.device.connected,
                state.tezos.tezosTrezorConnect.device.features.passphrase_protection &&
                !state.tezos.tezosTrezorConnect.device.features.passphrase_cached
            )

            // if device is connected with normal state get all address
            return (!state.tezos.tezosTrezorNew.pending && !environment.trezor.popup &&(

                // !TODO check if we already downloaded all new addresses
                // set flag in tezosTrezorNew has already all address download 
                // 2. if we have address in tezosWalletDetail if it match addresses on trezor 
                // if not we have wrong password or wrong device  
                (state.tezos.tezosTrezorConnect.device.connected) ||

                // if we need password and password is not in cache
                (state.tezos.tezosTrezorConnect.device.features.passphrase_protection &&
                    !state.tezos.tezosTrezorConnect.device.features.passphrase_cached)

            )) ?
                of({ type: 'TEZOS_TREZOR_NEW' }) : empty()

        }),

    )

    // listen for device passpharse event    
    @Effect()
    TezosTrezorConnectDevicePasspharse = this.actions$.pipe(
        ofType('TEZOS_TREZOR_CONNECT_DEVICE_PASSHPARSE'),

        map(() => ({ type: 'TEZOS_TREZOR_CONNECT_DEVICE_PASSPHARSE_SUCCESS' })),
        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TEZOS_TREZOR_CONNECT_DEVICE_PASSPHARSE_ERROR',
                payload: error.message,
            });
            return caught;
        }),
    )

    @Effect()
    TezosOperationTransaction$ = this.actions$.pipe(
        ofType('TEZOS_TREZOR_CONNECT_POPUP_OPEN'),
   
        // add state to effect
        withLatestFrom(this.store, (action, state) => ({ state, action })),
        
        // show address on device
        flatMap(({ state, action }) => {

            // console.error('[TEZOS_TREZOR_CONNECT_POPUP_OPEN] url', state.routerReducer.state.url)
            // // only launch on /tezos/wallet/new/trezor
            // return state.routerReducer.state.url === "/tezos/wallet/new/trezor" ?
            //     of({ type: 'TEZOS_TREZOR_NEW' }) : empty()

            return of({ type: 'TEZOS_TREZOR_NEW' })

        }),

 
        catchError((error, caught) => {
            console.error(error.message)
            this.store.dispatch({
                type: 'TTEZOS_TREZOR_CONNECT_POPUP_OPEN_ERROR',
                payload: error.message,
            });
            return caught;
        }),

    )
    

    constructor(
        private actions$: Actions,
        private store: Store<any>,
    ) { }

}
