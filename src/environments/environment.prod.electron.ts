export const environment = {
  production: true,
  type: 'electron',
  firebase: {
    apiKey: "AIzaSyBuVlOS05MaREe3cK0eycmd68nYr448Th4",
    authDomain: "wallet-dd9dc.firebaseapp.com",
    databaseURL: "https://wallet-dd9dc.firebaseio.com",
    projectId: "wallet-dd9dc",
    storageBucket: "wallet-dd9dc.appspot.com",
    disableNetwork: true
  },
  trezor: {
    connectSrc: 'http://localhost:5836/',
    frame_src: 'http://localhost:5836/iframe.html',
    popup_src: 'http://localhost:5836/popup.html',
    popup: false,
    trustedHost: true,
    webusb: true,
    debug: true,
    transportReconnect: true // true
  },
  nodes: 'main'
};  