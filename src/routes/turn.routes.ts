import { Router } from 'express'
import { saveAndModifyTurn } from '../validators/turns'
import validatorReq from '../middlewares/validatorReq'
import passport from 'passport'
import sendResponse from '../utils/sendResponse'
import User from '../models/User'
import Patient from '../models/Patient'
import pagination from '../utils/pagination'
import deleteEntities from '../utils/deleteEntities'
const router = Router()

router.get('/find/:amount/:page?', passport.authenticate('token'), async (req, res) => {
  try {
    let { page, amount } = req.params

    if (!page) {
      page = '1'
    }

    let { schedule } = req.user
    let pages: number = 1

    if (!schedule || schedule.length === 0) {
      return sendResponse(res, 200, {
        schedule: [],
        numberPages: 0
      })
    }

    if (schedule.length >= parseInt(amount)) {
      const info = pagination(schedule, parseInt(page), parseInt(amount))
      schedule = info.data
      pages = info.pages
    }

    for (const i in schedule) {
      schedule[i].description = undefined
    }

    await Patient.populate(schedule, { path: 'patient', select: 'name lastname DNI' })

    return sendResponse(res, 200, {
      schedule,
      numberPages: pages
    })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.get('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    const turn = req.user.schedule.find(turn => String(turn._id) === String(req.params.id))

    if (!turn) {
      return sendResponse(res, 500, 'Your turn, doesn\'t exist')
    }

    await Patient.populate(turn, { path: 'patient', select: 'name lastname DNI' })

    return sendResponse(res, 200, { turn })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.post('/',
  passport.authenticate('token'),
  validatorReq(saveAndModifyTurn(true)),
  async (req, res) => {
    try {
      const { date, patient } = req.body
      const findPatient = await Patient.findById(patient)

      if (!findPatient || String(findPatient.userID) !== String(req.user._id)) {
        return sendResponse(res, 404, 'Your patient is doesn\'t exist')
      }

      req.body.date = new Date(date)

      const { user } = req
      if (!user.schedule) {
        user.schedule = []
      }

      user.schedule.push({ ...req.body })
      const { schedule } = user

      const newUser = await User.findByIdAndUpdate(user._id, { schedule })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to save new turn')
      }

      return sendResponse(res, 200, { turn: { ...req.body } })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.put('/:id',
  passport.authenticate('token'),
  validatorReq(saveAndModifyTurn(false)),
  async (req, res) => {
    try {
      const { date, patient } = req.body
      if (patient) {
        const findPatient = req.user.patients.find(pat => String(pat) === String(patient))
        if (!findPatient) {
          return sendResponse(res, 404, 'The patient doesn\'t exist')
        }
        const patientVerify = await Patient.populate({ patient: findPatient }, { path: 'findPatient' })

        if (!patientVerify) {
          return sendResponse(res, 500, 'The patient is invalid')
        }
      }

      if (date) {
        req.body.date = new Date(date)
      }

      let verify: boolean = false
      let turnModify
      const schedule = req.user.schedule.map(turn => {
        if (String(turn._id) === String(req.params.id)) {
          for (const i in req.body) {
            turn[i] = req.body[i]
            turnModify = turn
          }
          verify = true
          return turn
        } else {
          return turn
        }
      })

      if (!verify && !turnModify) {
        return sendResponse(res, 404, 'The turn doesn\'t exist')
      }

      const newUser = await User.findByIdAndUpdate(req.user._id, { schedule })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to update turn')
      }

      return sendResponse(res, 200, { turn: turnModify })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.delete('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    const { id } = req.params
    let { schedule } = req.user

    if (id === 'all') {
      schedule = []

      const newUser = await User.findByIdAndUpdate(req.user._id, { schedule })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to delete any turns')
      }

      return sendResponse(res, 200, { schedule })
    }
    /* const ids = id.split('-')
    let verify: number = 0

    schedule = schedule.filter(turn => {
      const verifyID = ids.find(i => i === String(turn._id))
      if (!verifyID) {
        return turn
      } else {
        verify += 1
        return false
      }
    })

    if (verify === 0) {
      return sendResponse(res, 404, 'Nothing exists')
    } */

    const data = await deleteEntities(res, id, schedule, undefined, '_id')

    if (data) {
      const { objects, verify, ids } = data
      schedule = objects

      const newUser = await User.findByIdAndUpdate(req.user._id, { schedule })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to delete turn')
      }

      if (verify < ids.length) {
        return sendResponse(res, 200, (ids.length - verify) + ' turns doesn\'t exist')
      }

      return sendResponse(res, 200, { schedule })
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

export default router
