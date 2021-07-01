import { Router } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import sendResponse from '../utils/sendResponse'
const router = Router()

router.post('/sign-in', passport.authenticate('login'), (req, res) => {
  try {
    const token = jwt.sign({ userID: req.user._id }, process.env.JWT_PASSWORD, {
      expiresIn: 24 * 24 * 60
    })

    return sendResponse(res, 200, { token })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  } 
})

export default router