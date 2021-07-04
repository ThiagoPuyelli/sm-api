import express from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import session from 'express-session'
import morgan from 'morgan'
import passport from 'passport'
import passportBasic from './passport/passport-basic'
import passportJwt from './passport/passport-jwt'
import cors from 'cors'

// Routes
import authRoutes from './routes/auth.routes'
import patientRoutes from './routes/patient.routes'
import turnRoutes from './routes/turn.routes'

class App {
    public app: express.Application

    constructor () {
      this.app = express()

      this.app.set('port', process.env.PORT || 3500)

      config()
      passportBasic()
      passportJwt()
      this.setCors()
      this.connectDatabase()
      this.setMiddlewares()
      this.setRoutes()
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

    setRoutes () {
      this.app.use('/auth/', authRoutes)
      this.app.use('/patient/', patientRoutes)
      this.app.use('/turn/', turnRoutes)
    }

    setCors () {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://qfqfeqef.com')
        res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, x-access-token')
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
        next()
      })
      /* this.app.use(cors({
        origin: function (origin, callback) {
          console.log(origin)
          if (origin === 'http://localhost:3500') {
            return callback(null, true)
          } else {
            return callback(new Error('Not allowed by CORS'))
          }
        }
      })) */
    }
}

export default App
