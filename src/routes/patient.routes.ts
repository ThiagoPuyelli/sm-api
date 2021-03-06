import { Router } from 'express'
import passport from 'passport'
import { saveOrModifyPatient } from '../validators/patients'
import validatorReq from '../middlewares/validatorReq'
import sendResponse from '../utils/sendResponse'
import User from '../models/User'
import Patient from '../models/Patient'
import pagination from '../utils/pagination'
import deleteEntities from '../utils/deleteEntities'
import firebase from 'firebase-admin'
import multer from '../middlewares/multer'
import path from 'path'
import fs from 'fs'
import deleteImgObjects from '../utils/deleteImgObjects'
const router = Router()

router.get('/find/:amount/:page?', passport.authenticate('token'), async (req, res) => {
  try {
    let { page, amount } = req.params

    if (!page) {
      page = '1'
    }

    const { patients }: any = await Patient.populate(req.user, { path: 'patients' })

    if (!patients || patients.length === 0) {
      return sendResponse(res, 200, {
        patients: [],
        numberPages: 0
      })
    }

    if (patients.length <= parseInt(amount)) {
      return sendResponse(res, 200, {
        patients,
        numberPages: 1
      })
    } else {
      const { data, pages } = pagination(patients, parseInt(page), parseInt(amount))

      return sendResponse(res, 200, {
        patients: data,
        numberPages: pages
      })
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.get('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    if (!req.user.patients || req.user.patients.length <= 0) {
      return sendResponse(res, 404, 'You don\'t have patients')
    }

    const patientID = req.user.patients.find(patient => String(patient) === String(req.params.id))

    if (!patientID) {
      return sendResponse(res, 500, 'Your patient, doesn\'t exist')
    }

    let patient: any = await Patient.populate({ patientID }, { path: 'patientID' })

    if (!patient) {
      return sendResponse(res, 500, 'Error to find patient')
    }
    patient = patient.patientID

    if (patient.image) {
      const metadata = await firebase.storage().bucket().file(patient.image).getMetadata()
      patient.image = metadata[0].mediaLink
    }

    return sendResponse(res, 200, { patient })
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

router.post('/',
  passport.authenticate('token'),
  multer.single('image'),
  validatorReq(saveOrModifyPatient(true)),
  async (req, res) => {
    try {
      const { birth } = req.body
      if (birth) {
        req.body.birth = new Date(birth)
      }

      if (!req.user.patients) {
        req.user.patients = []
      }

      if (req.file) {
        const storage = firebase.storage()
        const { filename } = req.file
        const uploadPath = path.join(__dirname, '/../uploads/' + filename)
        const imageSend = await storage.bucket().upload(uploadPath, {
          destination: 'patients/' + filename
        })

        if (!imageSend) {
          return sendResponse(res, 500, 'Error to send image')
        }
        req.body.image = 'patients/' + filename
        fs.unlinkSync(uploadPath)
      }

      const newPatient = await Patient.create({ ...req.body, userID: req.user._id })

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to save patient')
      }
      req.user.patients.push(newPatient._id)
      const { patients } = req.user

      const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to add patient in the user')
      }
      return sendResponse(res, 200, { patient: newPatient })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.put('/:id',
  passport.authenticate('token'),
  validatorReq(saveOrModifyPatient(false)),
  multer.single('image'),
  async (req, res) => {
    try {
      const { birth } = req.body
      if (birth) {
        req.body.birth = new Date(birth)
      }

      const id = req.user.patients.find(patient => String(patient) === String(req.params.id))

      if (!id) {
        return sendResponse(res, 404, 'Your patient is doesn\'t exist')
      }
      const { patient }: any = await Patient.populate({ patient: id }, { path: 'patient' })

      if (!patient) {
        return sendResponse(res, 404, 'Your patient is invalid')
      }

      if (req.file) {
        const storage = await firebase.storage().bucket()
        if (patient.image) {
          const deleteImage = await storage.file(patient.image).delete()
          if (!deleteImage) {
            return sendResponse(res, 500, 'Error to delete post image')
          }
        }
        const { filename } = req.file
        const uploadPath = path.join(__dirname, '/../uploads/' + filename)
        await storage.upload(uploadPath, { destination: 'patients/' + filename })
        req.body.image = 'patients/' + filename
        fs.unlinkSync(uploadPath)
      }

      const newPatient = await Patient.findByIdAndUpdate(patient._id, { ...req.body }, { new: true })

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to update patient')
      }

      return sendResponse(res, 200, { patient: newPatient })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.delete('/:id', passport.authenticate('token'), async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') {
      const allPatients: any = await Patient.populate(req.user, { path: 'patients' })
      if (!allPatients) {
        return sendResponse(res, 500, 'Error to find patients')
      }
      const deleteImage = await deleteImgObjects(allPatients.patients)
      if (!deleteImage) {
        return sendResponse(res, 500, 'Error to delete images to patients')
      }

      const patientsToDelete = req.user.patients.map(patient => {
        return { deleteOne: { filter: { _id: patient._id } } }
      })

      const deletePatients = await Patient.bulkWrite(patientsToDelete)

      if (!deletePatients) {
        return sendResponse(res, 500, 'Error to delete patients')
      }

      let { patients } = req.user
      patients = []
      const newUser = await User.findByIdAndUpdate(req.user._id, { patients })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to save delete patients')
      }

      return sendResponse(res, 200, { patients })
    }

    const patients: any = await Patient.populate(req.user, { path: 'patients' })
    if (!patients) {
      return sendResponse(res, 500, 'Your patients doesn\'t exist')
    }

    const data = await deleteEntities(res, id, patients.patients, Patient, '_id', 'patients')

    if (data) {
      const { objects, verify, ids } = data

      const newUser = await User.findByIdAndUpdate(req.user._id, { patients: objects })

      if (!newUser) {
        return sendResponse(res, 500, 'Error to delete patients')
      }

      if (ids.length > verify) {
        return sendResponse(res, 500, {
          error: (ids.length - verify) + ' patients doesn\'t exist',
          patients: newUser.patients
        })
      }

      return sendResponse(res, 200, 'Patients removed')
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
})

export default router
