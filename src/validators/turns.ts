import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveAndModifyTurn = (required: boolean) => {
  return joi.object({
    patient: genValidator('string', required, undefined),
    date: genValidator('date', required, undefined),
    description: genValidator('string', false, { max: 400 })
  })
}
