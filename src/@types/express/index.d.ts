import UserInterface from '../interfaces/UserInterface'
import PatientInterface from '../interfaces/PatientInterface'
import { File } from 'multer'

declare module 'express-serve-static-core' {
  export interface Request {
    user?: UserInterface,
    file?: File,
    patient?: PatientInterface
  }
}
