import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TezosWalletDialogComponent } from '../../tezos-wallet/tezos-wallet-dialog/tezos-wallet-dialog.component'
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';


import { of, empty } from 'rxjs';
import { map, withLatestFrom, catchError, flatMap, tap } from 'rxjs/operators';

import { initializeWallet, activateWallet, transaction, confirmOperation } from '../../../../../tezos-wallet'
import { Config } from '../../../../../tezos-wallet/types'

import TrezorConnect from 'trezor-connect';

@Component({
  selector: 'app-tezor-trezor-debug',
  templateUrl: './tezor-trezor-debug.component.html',
  styleUrls: ['./tezor-trezor-debug.component.scss']
})
export class TezorTrezorDebugComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    public store: Store<any>,
    private http: HttpClient,
  ) { }

  ngOnInit() {

    // TODO: refactor windows.TrezorConnect 
    if (!(<any>window).TrezorConnect) {
      (<any>window).TrezorConnect = TrezorConnect
    }

  }

  initTrezor() {
    console.log('[initTrezor]');

    // check if iframe exist
    let tezosTrezorConnectInitialized = document.getElementById('trezorconnect')

    if (!tezosTrezorConnectInitialized) {

      TrezorConnect.on('UI_EVENT', (event) => {
        console.log('[debug][TrezorConnect][UI_EVENT]', event);

        if (event.type === 'ui-request_passphrase') {

          TrezorConnect.setPassphrase({
            'passphrase': "test",
          })

        }

      });

      // initialize TrezorConnect 
      TrezorConnect.init({

        // connectSrc: 'http://localhost:5836/',
        // frame_src: 'http://localhost:5836/iframe.html',
        // popup_src: 'http://localhost:5836/popup.html',

        connectSrc: 'http://localhost:5500/build/',
        frame_src: 'http://localhost:5500/build/iframe.html',
        popup_src: 'http://localhost:5500/build/popup.html',

        popup: false,
        webusb: false,
        // try to reconect when bridge is not working
        transportReconnect: true,
        debug: true,


      }).then(response => console.log('[TrezorConnect][init]', response))
        .catch(error => console.error('[ERROR][TrezorConnect][init]', error));

    } else {

      // remove iframe 
      // document.getElementById('trezorconnect').remove();

      TrezorConnect.uiResponse({
        type: 'iframe-handshake',
        payload: {}
      })

    }

  }

  removeTrezor() {

    // check if iframe exist
    if (document.getElementById('trezorconnect')) {
      TrezorConnect.dispose()
    }

  }


  getTezosAddress() {

    console.log('[getTezosAddress]');

    TrezorConnect.tezosGetAddress({
      'path': "m/44'/1729'/0'",
      'showOnTrezor': true,
    }).then(response => { console.warn('[tezosGetAddress]', response) })
      .catch(error => { console.error('[ERROR][tezosGetAddress]', error) });


  }

  getTezosAddressBundle() {

    TrezorConnect.tezosGetAddress({
      bundle: [
        { path: "m/44'/1729'/0'", showOnTrezor: false }, // account 1
        { path: "m/44'/1729'/1'", showOnTrezor: false }, // account 2
        { path: "m/44'/1729'/2'", showOnTrezor: false },  // account 3
        { path: "m/44'/1729'/3'", showOnTrezor: false },  // account 3
        { path: "m/44'/1729'/4'", showOnTrezor: false },  // account 3
      ]
    }).then(response => { console.warn('[tezosGetAddress][bundle]', response) })
      .catch(error => { console.error('[ERROR][tezosGetAddress]', error) });

  }

  getErrorDialog() {
    console.log('[getErrorDialog]')

    // const dialogConfig = new MatDialogConfig();

    // // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;

    // this.dialog.open(TezosWalletDialogComponent, dialogConfig);

    
    this.store.dispatch({
      type: 'TEZOS_WALLET_DIALOG_SHOW',
    })


  }

  activateWallet() {

    const wallet: Config = {
      secretKey: 'edsk3xJsET6qbtPFzejqdRQTwScNdLHoYskcjDcVyg5pboXZB6RivT',
      publicKey: 'edpkuTckfBdV8Rb5t4tScDj7u5hE22YVtT85PeKbShGv61KPnELWdK',
      publicKeyHash: 'tz1d4ZRi6abW6E2ACFznKxeDkjwgG4dpgx54',
      node: {
        name: 'zeronet',
        display: 'Zeronet',
        url: 'https://zeronet.simplestaking.com:3000',
        tzscan: {
          url: 'http://zeronet.tzscan.io/',
        }
      },
      type: 'web',
    }


    of([]).pipe(

      // wait for sodium to initialize
      initializeWallet(stateWallet => ({
        secretKey: wallet.secretKey,
        publicKey: wallet.publicKey,
        publicKeyHash: wallet.publicKeyHash,
        // set Tezos node
        node: wallet.node,
        // set wallet type: WEB, TREZOR_ONE, TREZOR_T
        type: wallet.type,
      })),

      // activate wallet
      activateWallet(() => ({
        secret: 'a2676de2c4c5e83d1dfc6d08b145f98e8fc3d02e'
      })),

    )

      .subscribe(data => {
        console.log('[activateWallet]', data)
      })

  }

  sendTransactionToSmartContract() {

    // https://insurance-api.smartcontractlabs.ee/quote?lat=12.345&lon=56.789&time=1543558400&payout=123510010

    const config:any = {
      transaction: {
        // to: 'KT1XTXVNN3DwoK19CR55tprTvnK4UJr3CwQj',
        // amount: '1.2345',
        // fee: '1',
        // parameters:{"parameters":{"prim":"Right","args":[{"prim":"Pair","args":[{"string":"edsigtzxjqtrALAFpNfBYYji24hzsih2zH5zsvtge2oMrd3UxLLvKqUFbyqgdXt7KKFLafAucopnk3CRKH1z4Rq2Edatnmsqmy8"},{"prim":"Pair","args":[{"string":"2018-11-27T01:28:13Z"},{"prim":"Pair","args":[{"bytes":"64566075b832cf9e7bcc0d63d3a9c71c3f03efc1"},{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"123510010"},{"int":"3890566"}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"123450"},{"int":"567890"}]},{"string":"2018-11-30T06:13:20Z"}]}]}]}]}]}]}},        
        // parameters_raw: '0000000d05050807070a00000040cf8f652b910019f0c1e07aeffe2491913efa4640ea247c940bf84229ae8aadb5b88fca98957d94f448320a078b7f165c4009dbfa773132fd9e761d9bdaa67501070700adf6e4bf0b07070a0000001464566075b832cf9e7bcc0d63d3a9c71c3f03efc10707070700baf3e4750086f6da030707070700ba880f0092a9450080d486c00b',
      },
      node: {
        name: 'alphanet',
        display: 'Alphanet',
        url: 'https://alphanet.smartcontractlabs.ee',
        tzscan: {
          url: 'http://alphanet.tzscan.io/',
        }
      },
    }
    const wallet = {
      publicKey: "edpktxkZTBo3yUibULEuzLAdqDRaMZ5YJUHnJPnb49E4SuRyPoKAr6",
      publicKeyHash: "tz1Wkx2hQL2N4JiLarC6k9sAXj8Czu7igzwp",
      type: 'TREZOR_T',
      path: "m/44'/1729'/0'"
    }


    of([]).pipe(

      flatMap(()=>
       this.http.get('https://insurance-api.smartcontractlabs.ee/quote?lat=12.345&lon=56.789&time=1543558400&payout=123510010')),
      

      // wait for sodium to initialize
      initializeWallet(stateWallet => ({
        publicKey: wallet.publicKey,
        publicKeyHash: wallet.publicKeyHash,
        // set Tezos node
        node: config.node,
        // set wallet type: WEB, TREZOR_ONE, TREZOR_T
        type: wallet.type,
        path: wallet.path,
        // add smart contract params
        contractParameters: stateWallet,
      })),

      tap(stateWallet => console.log('[stateWallet][contractParameters]',stateWallet , stateWallet.wallet.contractParameters.payreq.parameters, '0000000d'+ stateWallet.wallet.contractParameters.trezorParams )),

      // send xtz
      transaction(stateWallet => ({
        to: stateWallet.wallet.contractParameters.payreq.destination,
        amount: stateWallet.wallet.contractParameters.payreq.amount*0.000001,
        fee: '0.01',
        parameters: stateWallet.wallet.contractParameters.payreq.parameters,
      })),

      // wait for transacation to be confirmed
      confirmOperation(stateWallet => ({
        injectionOperation: stateWallet.injectionOperation,
      })),


    ).subscribe(data => {
      //console.log(data)
    })

  }



}
