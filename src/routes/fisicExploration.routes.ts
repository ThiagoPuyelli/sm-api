import { Router } from 'express'
import passport from 'passport'
import validatorReq from '../middlewares/validatorReq'
import { saveExploration, updateExploration } from '../validators/fisicExplorations'
import findPatient from '../middlewares/findPatient'
import sendResponse from '../utils/sendResponse'
const router = Router()

router.get('/:id',
  passport.authenticate('token'),
  findPatient('id'),
  async (req, res) => {
    try {
      const { fisicExploration } = req.patient

      if (!fisicExploration || fisicExploration.length <= 0) {
        return sendResponse(res, 404, 'The patient don\'t have fisic exploration')
      }

      return sendResponse(res, 200, { fisicExploration })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.get('/:id/:fisic',
  passport.authenticate('token'),
  findPatient('id'),
  async (req, res) => {
    try {
      const { patient } = req
      const { fisic } = req.params
      const fisicData = patient.fisicExploration.find(fis => String(fis.title) === String(fisic))

      if (!fisicData) {
        return sendResponse(res, 404, 'The data doesn\'t exist')
      }

      return sendResponse(res, 200, { fisicData })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.post('/:id',
  passport.authenticate('token'),
  validatorReq(saveExploration),
  findPatient('id'),
  async (req, res) => {
    try {
      const patient = req.patient
      if (!patient.fisicExploration) {
        patient.fisicExploration = []
      }
      const { info } = req.body

      for (const i in info) {
        const fisicVerify = patient.fisicExploration.find(fisic => fisic.title === info[i].title)

        if (fisicVerify) {
          return sendResponse(res, 500, 'The data is repeated')
        }
        patient.fisicExploration.push(info[i])
      }

      const newPatient = await patient.save()

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to save data in the fisic exploration')
      }

      const { fisicExploration } = patient

      return sendResponse(res, 200, { fisicExploration })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.put('/:id/:fisic',
  passport.authenticate('token'),
  validatorReq(updateExploration),
  findPatient('id'),
  async (req, res) => {
    try {
      const { patient } = req
      const fisicExploration = patient.fisicExploration.find(fis => String(req.params.fisic) === String(fis.title))
      for (const i in req.body) {
        fisicExploration[i] = req.body[i]
      }

      const newPatient = await patient.save()

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to update fisic exploration')
      }

      return sendResponse(res, 200, { fisicExploration })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.delete('/:id/:fisic',
  passport.authenticate('token'),
  findPatient('id'),
  async (req, res) => {
    try {
      const { patient } = req
      let verify: boolean = false
      patient.fisicExploration = patient.fisicExploration.filter(fisic => {
        if (String(fisic.title) !== String(req.params.fisic)) {
          return fisic
        } else {
          verify = true
          return false
        }
      })

      if (!verify) {
        return sendResponse(res, 500, 'The data doesn\'t exist')
      }

      const newPatient = await patient.save()

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to delete fisic exploration')
      }

      return sendResponse(res, 200, 'Fisic exploration deleted')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

export default router
