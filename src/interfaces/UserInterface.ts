import { Document } from 'mongoose'
import PatientInterface from './PatientInterface'
import TurnInterface from './TurnInterface'

export default interface UserInterface extends Document {
  name: string;
  lastname: string;
  email: string;
  password: string;
  patients: PatientInterface[];
  schedule: TurnInterface[];
  comparePasswords?: Function;
}
