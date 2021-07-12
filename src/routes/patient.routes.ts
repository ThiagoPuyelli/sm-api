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
      return sendResponse(res, 200, { patient: newPatient })
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

      const newPatient = await Patient.findByIdAndUpdate(patient._id, { ...req.body }, { new: true })

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to update patient')
      }

      return sendResponse(res, 200, { patient: newPatient })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.delete('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') {
      const deletePatients = await Patient.remove()

      if (!deletePatients) {
        return sendResponse(res, 500, 'Error to delete patients')
      }

      let { patients } = req.user
      patients = []
      const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to save delete patients')
      }

      return sendResponse(res, 200, 'Patients deleted')
    }

    let verify: number = 0
    const ids = id.split('-')
    const patients = req.user.patients.filter(async (patient) => {
      const verifyID = ids.find(i => String(i) === String(patient))
      if (!verifyID) {
        return patient
      } else {
        verify += 1
        await Patient.findByIdAndRemove(verifyID)
        return false
      }
    })
    console.log(patients)

    console.log(verify)
    if (!verify || ids.length > verify) {
      return sendResponse(res, 500, (ids.length - verify) + ' patients doesn\'t exist')
    }

    const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

    if (!newUser) {
      return sendResponse(res, 500, 'Error to delete patient')
    }

    return sendResponse(res, 200, 'Patients deleteded')
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

export default router
