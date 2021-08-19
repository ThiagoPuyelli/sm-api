import admin from 'firebase-admin'

const serviceAccount = require('../../sm-app-1a1ee-firebase-adminsdk-pu4f3-24cdcc79e1.json')

export default () => {
  const fireConfig = {
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'sm-app-1a1ee.appspot.com'
  }

  return admin.initializeApp(fireConfig)
}
