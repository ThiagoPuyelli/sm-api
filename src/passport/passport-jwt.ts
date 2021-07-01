import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import User from '../models/User'

export default () => {
    passport.use('token', new Strategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_PASSWORD
      }, async (payload, done) => {
        try {
          const user = await User.findById(payload.userID)
    
          done(null, user)
        } catch (err) {
          done(false)
        }
      }
      ))
}