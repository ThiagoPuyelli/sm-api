import { ObjectSchema } from 'joi'
import sendResponse from '../utils/sendResponse'

export default (schema: ObjectSchema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body)
      next()
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
}