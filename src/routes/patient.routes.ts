import { Router } from 'express'
import passport from 'passport'
import { saveOrModifyPatient } from '../validators/patients'
import validatorReq from '../middlewares/validatorReq'
import sendResponse from '../utils/sendResponse'
import User from '../models/User'
import Patient from '../models/Patient'
import pagination from '../utils/pagination'
const router = Router()

router.get('/find/:amount/:page?', passport.authenticate('token'), async (req, res) => {
  try {
    let { page, amount } = req.params

    if (!page) {
      page = '1'
    }

    const { patients }: any = await Patient.populate(req.user, { path: 'patients' })

    if (!patients || patients.length === 0) {
      return sendResponse(res, 200, {
        patients: [],
        numberPages: 0
      })
    }

    if (patients.length <= parseInt(amount)) {
      return sendResponse(res, 200, {
        patients,
        numberPages: 1
      })
    } else {
      const { data, pages } = pagination(patients, parseInt(page), parseInt(amount))

      return sendResponse(res, 200, {
        patients: data,
        numberPages: pages
      })
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.get('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    if (!req.user.patients || req.user.patients.length <= 0) {
      return sendResponse(res, 404, 'You don\'t have patients')
    }

    const patientID = req.user.patients.find(patient => String(patient) === String(req.params.id))

    if (!patientID) {
      return sendResponse(res, 500, 'Your patient, doesn\'t exist')
    }

    const patient = await Patient.populate({ patientID }, { path: 'patientID' })

    if (!patient) {
      return sendResponse(res, 500, 'Error to find patient')
    }

    return sendResponse(res, 200, { patient })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.post('/',
  passport.authenticate('token'),
  validatorReq(saveOrModifyPatient(true)),
  async (req, res) => {
    try {
      const { birth } = req.body
      if (birth) {
        req.body.birth = new Date(birth)
      }

      if (!req.user.patients) {
        req.user.patients = []
      }

      const newPatient = await Patient.create({ ...req.body, userID: req.user._id })

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to save patient')
      }
      req.user.patients.push(newPatient._id)
      const { patients } = req.user

      const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to add patient in the user')
      }
      return sendResponse(res, 200, 'Patient added')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.put('/:id',
  passport.authenticate('token'),
  validatorReq(saveOrModifyPatient(false)),
  async (req, res) => {
    try {
      if (Object.keys(req.body).length === 0) {
        return sendResponse(res, 404, 'Information invalid')
      }
      const { birth } = req.body
      if (birth) {
        req.body.birth = new Date(birth)
      }

      const id = req.user.patients.find(patient => String(patient) === String(req.params.id))

      if (!id) {
        return sendResponse(res, 404, 'Your patient is doesn\'t exist')
      }
      const { patient }: any = await Patient.populate({ patient: id }, { path: 'patient' })

      if (!patient) {
        return sendResponse(res, 404, 'Your patient is invalid')
      }
      console.log(patient, { ...req.body })

      const newPatient = await Patient.findByIdAndUpdate(patient._id, { ...req.body })

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to update patient')
      }

      return sendResponse(res, 200, 'Patient updated')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.delete('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    let verify: boolean = false
    const patients = req.user.patients.filter(patient => {
      if (String(patient) !== String(req.params.id)) {
        return patient
      } else {
        verify = true
        return false
      }
    })

    if (!verify) {
      return sendResponse(res, 500, 'Patient doesn\'t exist')
    }

    const deletePatient = await Patient.findByIdAndRemove(req.params.id)

    if (!deletePatient) {
      return sendResponse(res, 500, 'Error to delete patient')
    }

    const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

    if (!newUser) {
      return sendResponse(res, 500, 'Error to delete patient')
    }

    return sendResponse(res, 200, 'Patient deleted')
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

export default router
