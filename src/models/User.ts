import { Schema, model, Document } from 'mongoose'
import UserInterface from '../interfaces/UserInterface'
import bcrypt from 'bcryptjs'
import { NextFunction } from 'express'

const userSchema = new Schema<UserInterface & Document>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 4
  },
  patients: {
    type: [{
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
      adress: {
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
      documents: []
    }],
    default: []
  },
  schedule: []
})

userSchema.pre('save', async function (next: NextFunction) {
  if (!this.isModified('password')) return next()

  try {
    const passwordHased = await bcrypt.hash(this.password, 10)
    this.password = passwordHased
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePasswords = async function (password: string) {
  try {
    const comparePassword = await bcrypt.compare(password, this.password)
    return comparePassword
  } catch (err) {
    return false
  }
}

export default model<UserInterface & Document>('User', userSchema)
