// import Patient from '../models/Patient'
import admin from 'firebase-admin'

export default async (patients) => {
  try {
    const pepe = []
    await patients.forEach(async (patient, i) => {
      const linksParts = patients[i].image.split('/')
      const url = linksParts[3] + '/' + linksParts[4]
      console.log(url)
      const storageRef = await admin.storage().bucket().file(url).delete()
      pepe.push(storageRef)
    })
    return pepe
  } catch (err) {
    return undefined
  }
}
