import sendResponse from './sendResponse'
import randomstring from 'randomstring'
import path from 'path'

export default async (req, res, next) => {
  try {
    if (req.files.image) {
      const { image } = req.files
      const fileNameSplit = image.name.split('.')
      const fileExt = fileNameSplit[fileNameSplit.length - 1]
      const uploadPath = path.join(__dirname, '/../uploads/' + randomstring.generate(10) + '.' + fileExt)

      await image.mv(uploadPath, (err) => {
        if (err) {
          return sendResponse(res, 500, 'Image invalid')
        }
      })

      req.body.uploadPath = uploadPath
      next()
    } else {
      return sendResponse(res, 500, 'Image invalid')
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Server error')
  }
}
