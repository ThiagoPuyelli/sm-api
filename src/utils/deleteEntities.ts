import { Response } from 'express'
import { Model } from 'mongoose'
import deleteImgObjects from './deleteImgObjects'
import sendResponse from './sendResponse'

export default async (
  res: Response,
  idsString: string,
  arrayObjects: Array<any>,
  schema: Model<any>|undefined,
  propertyObject: string|undefined,
  fire?: string|undefined
) => {
  try {
    let verify: number = 0
    const ids = idsString.split('-')
    const objectsToDelete = []
    const objects = arrayObjects.filter((object) => {
      const verifyID = ids.find(i => String(i) === String(object[propertyObject] || object))
      if (!verifyID) {
        return object
      } else {
        verify += 1
        if (schema) objectsToDelete.push(object)
        return false
      }
    })

    if (verify === 0) {
      return sendResponse(res, 500, 'Nothing exist')
    }

    if (schema) {
      const listIds = []
      for (const i in objectsToDelete) {
        let { _id } = objectsToDelete[i]
        if (!_id) {
          _id = objectsToDelete[i]
        }
        listIds.push({ deleteOne: { filter: { _id } } })
      }
      if (fire) {
        const deleteImg = await deleteImgObjects(objectsToDelete, fire)
        if (!deleteImg) {
          return sendResponse(res, 500, 'Error to delete images')
        }
      }
      const deleteDB = await schema.bulkWrite(listIds)
      if (!deleteDB) {
        return sendResponse(res, 500, 'Error to delete entities')
      }
    }

    return {
      verify,
      objects,
      ids
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
}
