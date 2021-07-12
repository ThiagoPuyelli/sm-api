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
        console.log(verifyID)
        if (schema) objectsToDelete[verifyID] = verifyID
        return false
      }
    })

    if (verify === 0) {
      return sendResponse(res, 500, 'Nothing exist')
    }

    if (schema) {
      for (const i in objectsToDelete) {
        const objectDelete = await schema.findByIdAndRemove(objectsToDelete[i])
        if (!objectDelete) {
          return sendResponse(res, 500, 'Error to delete patients')
        }
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
