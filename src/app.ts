import express from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import session from 'express-session'
import morgan from 'morgan'
import passport from 'passport'
import passportBasic from './passport/passport-basic'
import passportJwt from './passport/passport-jwt'
import cors from 'cors'
import fileUpload from 'express-fileupload'

// Routes
import authRoutes from './routes/auth.routes'
import patientRoutes from './routes/patient.routes'
import turnRoutes from './routes/turn.routes'
import documentRoutes from './routes/document.routes'
import fisicExplorationRoutes from './routes/fisicExploration.routes'

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

    setCors () {
      this.app.use(cors({
        origin: 'http://localhost:3000'
      }))
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
      this.app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: __dirname + './uploads'
      }))
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
      this.app.use('/document/', documentRoutes)
      this.app.use('/fisic/', fisicExplorationRoutes)
    }
}

export default App
