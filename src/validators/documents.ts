import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveAndModifyDocument = (required: boolean) => {
  return joi.object({
    name: genValidator('string', required, { max: 35 }),
    link: genValidator('string', required, undefined),
    date: genValidator('date', false, undefined),
    type: genValidator('string', required, { max: 30 })
  })
}
