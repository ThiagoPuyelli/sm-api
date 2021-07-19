import sendResponse from './sendResponse'
import randomstring from 'randomstring'
import path from 'path'

export default async (req, res, next) => {
  try {
    if (req.files && req.files.image) {
      const { image } = req.files
      const fileNameSplit = image.name.split('.')
      const fileExt = fileNameSplit[fileNameSplit.length - 1]
      const fileName = randomstring.generate(10) + '.' + fileExt
      const uploadPath = path.join(__dirname, '/../uploads/' + fileName)

      await image.mv(uploadPath, (err) => {
        if (err) {
          return sendResponse(res, 500, 'Image invalid')
        }
      })

      req.body.uploadPath = uploadPath
      req.body.fileName = fileName
      next()
    } else {
      next()
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
}
