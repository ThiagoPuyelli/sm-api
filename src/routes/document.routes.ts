import { Router } from 'express'
import passport from 'passport'
import validatorReq from '../middlewares/validatorReq'
import sendResponse from '../utils/sendResponse'
import { saveAndModifyDocument } from '../validators/documents'
import findPatient from '../middlewares/findPatient'
import pagination from '../utils/pagination'
import deleteEntities from '../utils/deleteEntities'
const router = Router()

router.get('/find/:id/:amount/:page?',
  passport.authenticate('token'),
  findPatient('id'),
  async (req, res) => {
    try {
      const { documents } = req.patient

      if (!documents || documents.length === 0) {
        return sendResponse(res, 200, {
          documents: [],
          numberPages: 0
        })
      }
      let { page, amount } = req.params

      if (!page) {
        page = '1'
      }

      if (documents.length < parseInt(amount)) {
        return sendResponse(res, 200, {
          documents,
          numberPages: 1
        })
      } else {
        const { data, pages } = pagination(documents, parseInt(page), parseInt(amount))

        return sendResponse(res, 200, {
          documents: data,
          numberPages: pages
        })
      }
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.get('/type/:id/:type/:amount/:page?',
  passport.authenticate('token'),
  findPatient('id'),
  async (req, res) => {
    try {
      let { documents } = req.patient
      let { amount, page, type } = req.params
      const types = type.split('-')
      if (!page) {
        page = '1'
      }
      page = parseInt(page)
      amount = parseInt(amount)

      documents = documents.filter(doc => {
        for (const i in types) {
          if (String(types[i]) === String(doc.type)) {
            return doc
          }
        }

        return false
      })

      if (!documents || documents.length <= 0) {
        return sendResponse(res, 200, {
          documents: [],
          numberPages: 0
        })
      }

      if (amount < documents.length) {
        const { data, pages } = pagination(documents, page, amount)
        return sendResponse(res, 200, {
          documents: data,
          numberPages: pages
        })
      } else {
        return sendResponse(res, 200, {
          documents,
          numberPages: 1
        })
      }
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.get('/:patientID/:documentID',
  passport.authenticate('token'),
  findPatient('patientID'),
  async (req, res) => {
    try {
      const { documents } = req.patient
      if (!documents || documents.length === 0) {
        return sendResponse(res, 404, 'The patient don\'t have documents')
      }

      const document = documents.find(document => String(document._id) === String(req.params.documentID))

      if (!document) {
        return sendResponse(res, 404, 'The document, doesn\'t exist')
      }

      return sendResponse(res, 200, { document })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.get('/get/types/:id',
  passport.authenticate('token'),
  findPatient('id'),
  async (req, res) => {
    try {
      const { documents } = req.patient

      const types = {}
      for (const i in documents) {
        if (!types[documents[i].type]) {
          types[documents[i].type] = 'pepe'
        }
      }

      return sendResponse(res, 200, { types: Object.keys(types) })
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.post('/:id',
  passport.authenticate('token'),
  validatorReq(saveAndModifyDocument(true)),
  findPatient('id'),
  async (req, res) => {
    try {
      const patient = req.patient
      let { documents } = patient

      if (!documents) {
        documents = []
      }

      documents.push({ ...req.body })

      const patientSave = await patient.save()

      if (!patientSave) {
        return sendResponse(res, 500, 'Error to save document')
      }

      return sendResponse(res, 200, 'Document saved')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  }
)

router.put('/:patientID/:documentID',
  passport.authenticate('token'),
  findPatient('patientID'),
  validatorReq(saveAndModifyDocument(false)),
  async (req, res) => {
    try {
      const patient = req.patient
      const { documents } = patient

      if (!documents || documents.length === 0) {
        return sendResponse(res, 500, 'Your patient don\'t have documents')
      }

      const document = documents.find(document => String(document._id) === String(req.params.documentID))

      if (!document) {
        return sendResponse(res, 500, 'The document doesn\'t exist')
      }

      for (const i in req.body) {
        document[i] = req.body[i]
      }

      const newPatient = patient.save()

      if (!newPatient) {
        return sendResponse(res, 500, 'Error to save patient')
      }

      return sendResponse(res, 200, 'Document updated')
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

router.delete('/:patientID/:documentID',
  passport.authenticate('token'),
  findPatient('patientID'),
  async (req, res) => {
    try {
      const patient = req.patient
      let { documents } = patient

      if (!documents || documents.length === 0) {
        return sendResponse(res, 500, 'Your patient don\'t have documents')
      }

      const { documentID } = req.params

      if (documentID === 'all') {
        documents = []

        const newPatient = await patient.save()

        if (!newPatient) {
          return sendResponse(res, 500, 'Error to delete all documents')
        }

        return sendResponse(res, 200, { documents })
      }

      const data = await deleteEntities(res, documentID, documents, undefined, '_id')

      if (data) {
        const { objects, verify, ids } = data

        patient.documents = objects

        const newPatient = await patient.save()

        if (!newPatient) {
          return sendResponse(res, 500, 'Error to delete document')
        }

        if (verify < ids.length) {
          return sendResponse(res, 404, (ids.length - verify) + ' document doesn\'t exist')
        }

        return sendResponse(res, 200, { documents: patient.documents })
      }
    } catch (err) {
      return sendResponse(res, 500, err.message || 'Server error')
    }
  })

export default router
