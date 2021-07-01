import { Router } from 'express'
import passport from 'passport'
import { saveOrModifyPatient } from '../validators/patients'
import validatorReq from '../middlewares/validatorReq'
import sendResponse from '../utils/sendResponse'
import User from '../models/User'
import pagination from '../utils/pagination'
const router = Router()

router.get('/find/:amount/:page?', passport.authenticate('token'), async (req, res) => {
  try {
    let { page, amount } = req.params

    if (!page) {
      page = '1'
    }

    const { patients } = req.user

    if (!patients || patients.length === 0) {
      return sendResponse(res, 404, 'You don\'t have a patients')
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
    const patient = req.user.patients.find(patient => String(patient._id) === String(req.params.id))

    if (!patient) {
      return sendResponse(res, 500, 'Your patient, doesn\'t exist')
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

      req.user.patients.push({ ...req.body })

      const { patients } = req.user
      const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to save patient')
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
      if (Object.keys(req.body)) {
        return sendResponse(res, 404, 'Information invalid')
      }
      const { birth } = req.body
      if (birth) {
        req.body.birth = new Date(birth)
      }

      const patients = req.user.patients.map(patient => {
        if (String(patient._id) === String(req.params.id)) {
          for (const i in req.body) {
            patient[i] = req.body[i]
          }
        }

        return patient
      })

      const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

      if (!newUser) {
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
      if (String(patient._id) !== String(req.params.id)) {
        return patient
      } else {
        verify = true
        return false
      }
    })

    if (!verify) {
      return sendResponse(res, 500, 'Patient doesn\'t exist')
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
