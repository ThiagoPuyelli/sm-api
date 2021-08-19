import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveAndModifyOperation = (required: boolean) => {
  return joi.object({
    title: genValidator('string', required, { max: 40 }),
    time: genValidator('string', required, { min: 5, max: 15 }),
    date: genValidator('date', required, undefined)
  })
}
