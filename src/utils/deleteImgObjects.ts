// import Patient from '../models/Patient'
import admin from 'firebase-admin'

export default async (objects, property?: string|undefined) => {
  try {
    const listImageDelete = []
    await objects.forEach(async (object, i) => {
      try {
        if (object[property || 'image']) {
          const url = object[property || 'image']
          const storageRef = await admin.storage().bucket().file(url).delete()
          listImageDelete.push(storageRef)
        }
      } catch (err) {
        return undefined
      }
    })
    return listImageDelete
  } catch (err) {
    return undefined
  }
}
