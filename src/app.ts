import express from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import session from 'express-session'
import morgan from 'morgan'
import passport from 'passport'

class App {

    public app: express.Application

    constructor () {
      this.app = express()

      this.app.set('port', process.env.PORT || 3500)

      config()
      this.connectDatabase()
      this.setMiddlewares()
    }

    connectDatabase () {
      const { MONGODB_URI } = process.env

      connect(MONGODB_URI, {
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
      }, (err: Error) => {
        if (!err) {
          console.log('Database is connected')
        } else {
          console.log('Error to database error:', err)
        }
      })
    } 

    setMiddlewares () {
      this.app.use(morgan('dev'))
      this.app.use(express.urlencoded({ extended: false }))
      this.app.use(express.json())
      this.app.use(session({
        secret: process.env.SECRET_SESSION,
        resave: false,
        saveUninitialized: false
      }))
      this.app.use(passport.initialize())
      this.app.use(passport.session())
    }
}

export default App
