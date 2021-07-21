// import Patient from '../models/Patient'
import admin from 'firebase-admin'

export default async (objects) => {
  try {
    const listImageDelete = []
    await objects.forEach(async (object, i) => {
      if (object.image) {
        const linksParts = object.image.split('/')
        const url = linksParts[3] + '/' + linksParts[4]
        const storageRef = await admin.storage().bucket().file(url).delete()
        listImageDelete.push(storageRef)
      }
    })
    return listImageDelete
  } catch (err) {
    return undefined
  }
}
