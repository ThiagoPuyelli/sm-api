import { Router } from 'express'
import validatorReq from '../middlewares/validatorReq'
import { saveAndModifyOperation } from '../validators/operations'
import passport from 'passport'
import sendResponse from '../utils/sendResponse'
import findPatient from '../middlewares/findPatient'
import Patient from '../models/Patient'
import deleteEntities from '../utils/deleteEntities'
const router = Router()

router.get('/:id', passport.authenticate('token'), findPatient('id'), async (req, res) => {
  try {
    const { operations } = req.patient

    if (!operations || operations.length === 0) {
      return sendResponse(res, 200, {
        operations: []
      })
    }

    return sendResponse(res, 200, { operations })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.post('/:id',
  passport.authenticate('token'),
  validatorReq(saveAndModifyOperation(true)),
  findPatient('id'),
  async (req, res) => {
    try {
      let { operations } = req.patient
      if (!operations) {
        operations = []
      }

      operations.push(req.body)
      const saveOperation = await Patient.findByIdAndUpdate(req.patient._id, { operations })
      if (!saveOperation) {
        return sendResponse(res, 500, 'Error to add operation')
      }

      return sendResponse(res, 200, 'Operations saved')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.put('/:patientID/:operationID',
  passport.authenticate('token'),
  validatorReq(saveAndModifyOperation(false)),
  findPatient('patientID'),
  async (req, res) => {
    try {
      const { patient } = req
      const { operations } = patient

      const operationIndex = operations.findIndex(op => String(op._id) === String(req.params.operationID))

      if (operationIndex === -1) {
        return sendResponse(res, 404, 'Operation doesn\'t exist')
      }

      for (const i in req.body) {
        patient.operations[operationIndex][i] = req.body[i]
      }

      const updateOperation = await patient.save()
      if (!updateOperation) {
        return sendResponse(res, 500, 'Error to update operation')
      }
      return sendResponse(res, 200, 'Operation updated')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.delete('/:patientID/:operationID',
  passport.authenticate('token'),
  findPatient('patientID'),
  async (req, res) => {
    try {
      const { patient } = req

      if (!patient.operations || patient.operations === 0) {
        return sendResponse(res, 500, 'You don\'t have operations')
      }
      const ids = req.params.operationID

      if (ids === 'all') {
        patient.operations = []
        const newPatient = await patient.save()

        if (!newPatient) {
          return sendResponse(res, 500, 'Error to delete operations')
        }

        return sendResponse(res, 200, { operations: newPatient.operations })
      }
      const data = await deleteEntities(res, ids, patient.operations, undefined, '_id')

      if (data) {
        const { objects, verify, ids } = data

        patient.operations = objects

        const newPatient = await patient.save()

        if (!newPatient) {
          return sendResponse(res, 500, 'Error to delete operations')
        }

        if (verify < ids.length) {
          return sendResponse(res, 404, (ids.length - verify) + ' document doesn\'t exist')
        }

        return sendResponse(res, 200, { operations: newPatient.operations })
      }
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

export default router
