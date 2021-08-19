import { Router } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import sendResponse from '../utils/sendResponse'
const router = Router()

router.get('/me', passport.authenticate('token'), (req, res) => {
  try {
    const { name, lastname } = req.user

    return sendResponse(res, 200, { name, lastname })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.post('/sign-in', passport.authenticate('login'), (req, res) => {
  try {
    const token = jwt.sign({ userID: req.user._id }, process.env.JWT_PASSWORD, {
      expiresIn: '1d'
    })

    return sendResponse(res, 200, { token })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

export default router
