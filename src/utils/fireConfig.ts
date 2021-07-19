import firebase from 'firebase-admin'

export default () => {
  const fireConfig = {
    apiKey: 'AIzaSyD1cQnbeZSZxobRyWh8er6ScgwhrFM3ghc',
    authDomain: 'sm-app-1a1ee.firebaseapp.com',
    projectId: 'sm-app-1a1ee',
    storageBucket: 'sm-app-1a1ee.appspot.com',
    messagingSenderId: '214829409214',
    appId: '1:214829409214:web:a1ef61aa705c4332a98fef',
    measurementId: 'G-NX1PY56T2B'
  }

  return firebase.initializeApp(fireConfig)
}
