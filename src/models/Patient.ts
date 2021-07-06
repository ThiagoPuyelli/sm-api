import { Schema, Document, model } from 'mongoose'
import PatientInterface from '../interfaces/PatientInterface'

const patientSchema = new Schema<PatientInterface & Document>({
  name: {
    type: String,
    required: true,
    maxLength: 30
  },
  lastname: {
    type: String,
    required: true,
    maxLength: 30
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
    required: true,
    maxLength: 20
  },
  gender: {
    type: String,
    required: false,
    maxLength: 15
  },
  phone: {
    type: String,
    required: false,
    maxLength: 25
  },
  mobile: {
    type: String,
    required: false,
    maxLength: 25
  },
  address: {
    type: String,
    required: false,
    maxLength: 25
  },
  postalCode: {
    type: String,
    required: false,
    maxLength: 5
  },
  street: {
    type: String,
    required: false,
    maxLength: 20
  },
  province: {
    type: String,
    required: false,
    maxLength: 25
  },
  image: String,
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documents: {
    type: [{
      name: {
        type: String,
        required: true,
        maxLength: 35
      },
      date: {
        type: Date,
        default: new Date()
      },
      link: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true,
        maxLength: 30
      }
    }]
  },
  fisicExploration: {
    type: [{
      title: {
        type: String,
        required: true,
        maxLength: 40,
        unique: true
      },
      data: {
        type: String,
        required: true,
        maxLength: 400
      },
      _id: false
    }],
    default: []
  }
})

export default model<PatientInterface & Document>('Patient', patientSchema)
