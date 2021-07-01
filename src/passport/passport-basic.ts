import User from '../models/User'
import passport from 'passport'
import { BasicStrategy } from 'passport-http'

export default () => {
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
  })

  passport.use('login', new BasicStrategy(
    async (email, password, done) => {
      try {
        let user: any = await User.findOne({ email })

        if (!user) {
          done(false)
        }

        const verifyPassword = await user.comparePasswords(password)

        if (!verifyPassword) {
          done(false)
        }

        if (user.toObject) {
          user = user.toObject()
        }

        done(null, user)
      } catch (err) {
        return done(false)
      }
    }
  ))
}
