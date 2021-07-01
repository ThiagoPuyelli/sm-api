import { Router } from 'express'
import { saveAndModifyTurn } from '../validators/turns'
import validatorReq from '../middlewares/validatorReq'
import passport from 'passport'
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

    const { schedule } = req.user

    if (!schedule || schedule.length === 0) {
      return sendResponse(res, 404, 'You don\'t have a turns')
    }

    if (schedule.length <= parseInt(amount)) {
      return sendResponse(res, 200, {
        schedule,
        numberPages: 1
      })
    } else {
      const { data, pages } = pagination(schedule, parseInt(page), parseInt(amount))

      return sendResponse(res, 200, {
        schedule: data,
        numberPages: pages
      })
    }
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
      const { date } = req.body
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

      return sendResponse(res, 200, 'Turn saved')
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
      const { date } = req.body
      if (date) {
        req.body.date = new Date(date)
      }

      let verify: boolean = false
      const schedule = req.user.schedule.map(turn => {
        if (String(turn._id) === String(req.params.id)) {
          for (const i in req.body) {
            turn[i] = req.body[i]
          }
          verify = true
          return turn
        } else {
          return turn
        }
      })

      if (!verify) {
        return sendResponse(res, 404, 'The turn doesn\'t exist')
      }

      const newUser = await User.findByIdAndUpdate(req.user._id, { schedule })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to update turn')
      }

      return sendResponse(res, 200, 'Turn updated')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.delete('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    let verify: boolean = false
    const schedule = req.user.schedule.filter(turn => {
      if (String(turn._id) !== String(req.params.id)) {
        return turn
      } else {
        verify = true
        return false
      }
    })

    if (!verify) {
      return sendResponse(res, 500, 'Turn doesn\'t exist')
    }

    const newUser = await User.findByIdAndUpdate(req.user._id, { schedule })

    if (!newUser) {
      return sendResponse(res, 500, 'Error to delete turn')
    }

    return sendResponse(res, 200, 'Turn deleted')
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

export default router
