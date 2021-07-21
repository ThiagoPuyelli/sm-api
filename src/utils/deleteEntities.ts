import { Response } from 'express'
import { Model } from 'mongoose'
import sendResponse from './sendResponse'

export default async (
  res: Response,
  idsSting: string,
  arrayObjects: Array<any>,
  schema: Model<any>|undefined,
  propertyObject: string|undefined
) => {
  try {
    let verify: number = 0
    const ids = idsSting.split('-')
    const objectsToDelete = {}
    const objects = arrayObjects.filter((object) => {
      const verifyID = ids.find(i => String(i) === String(object[propertyObject] || object))
      if (!verifyID) {
        return object
      } else {
        verify += 1
        if (schema) objectsToDelete[verifyID] = verifyID
        return false
      }
    })

    if (verify === 0) {
      return sendResponse(res, 500, 'Nothing exist')
    }

    if (schema) {
      const listIds = []
      for (const i in objectsToDelete) {
        listIds.push({ deleteOne: { filter: { _id: objectsToDelete[i] } } })
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
