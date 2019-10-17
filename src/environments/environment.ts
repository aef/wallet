export const environment = {
  production: false,
  type: 'web',
  firebase: {
    apiKey: "AIzaSyBuVlOS05MaREe3cK0eycmd68nYr448Th4",
    authDomain: "wallet-dd9dc.firebaseapp.com",
    databaseURL: "https://wallet-dd9dc.firebaseio.com",
    projectId: "wallet-dd9dc",
    storageBucket: "wallet-dd9dc.appspot.com",
    disableNetwork: true
  },
  trezor: {
    connectSrc: 'http://localhost:8088/',
    popup: true,
    trustedHost: false,
    webusb: false,
    debug: true,
    transportReconnect: false, // true
    manifest: {
      email: 'jurajselep@simplestaking.com',
      appUrl: 'https://wallet.simplestaking.com'
    }
  },
  nodes: 'zero'
};