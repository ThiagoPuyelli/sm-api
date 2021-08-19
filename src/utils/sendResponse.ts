import { Response } from 'express'

export default (res: Response, code: number, message: any) => {
  if (code > 299) {
    res.status(code).json({
      message,
      code
    })
  } else {
    res.status(code).json({
      message
    })
  }
}
