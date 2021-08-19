import Patient from '../models/Patient'
import sendResponse from '../utils/sendResponse'
import { Request, Response, NextFunction } from 'express'

export default (param: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await Patient.findById(req.params[param])

      if (!patient) {
        return sendResponse(res, 500, 'The patient is undefined')
      }

      if (String(req.user._id) !== String(patient.userID)) {
        return sendResponse(res, 401, 'this is not yours patient')
      }

      req.patient = patient
      next()
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
}
