import { Schema, Document, model } from 'mongoose'
import PatientInterface from '../interfaces/PatientInterface'

const patientSchema = new Schema<PatientInterface & Document>({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  birth: {
    type: Date,
    required: false
  },
  DNI: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  mobile: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  postalCode: {
    type: String,
    required: false
  },
  street: {
    type: String,
    required: false
  },
  province: {
    type: String,
    required: false
  },
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documents: {
    type: [{
      name: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: new Date()
      },
      link: {
        type: String,
        required: true
      }
    }]
  }
})

export default model<PatientInterface & Document>('Patient', patientSchema)
