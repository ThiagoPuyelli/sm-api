import multer from 'multer'
import path from 'path'
import randomstring from 'randomstring'
import fs from 'fs'

const generatedStorage = () => {
  return multer.diskStorage({
    destination (req, file, cb) {
      cb(null, path.join(__dirname, '/../uploads/'))
    },
    async filename (req, file, cb) {
      const { originalname } = file

      const originalSplit = originalname.split('.')
      const fileExt = originalSplit[originalSplit.length - 1]

      const filename = randomstring.generate(10) + '.' + fileExt
      const verifyImage = await fs.existsSync(path.join(__dirname, '../uploads/' + filename))
      if (verifyImage) {
        return generatedStorage()
      }

      cb(null, filename)
    }
  })
}

const storage = generatedStorage()

export default multer({
  storage,
  fileFilter (req, file, next) {
    const image = file.mimetype.startsWith('image/')

    if (image) {
      next(null, true)
    } else {
      next(null, false)
    }
  }
})
