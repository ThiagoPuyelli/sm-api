import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveAndModifyTurn = (required: boolean) => {
  return joi.object({
    name: genValidator('string', required, undefined),
    lastname: genValidator('string', required, undefined),
    email: genValidator('string', required, undefined).email(),
    phone: genValidator('string', required, undefined),
    date: genValidator('date', required, undefined),
    description: genValidator('string', false, undefined)
  })
}
