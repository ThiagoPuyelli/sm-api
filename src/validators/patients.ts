import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveOrModifyPatient = (required: boolean) => {
  const patientObject = joi.object({
    name: genValidator('string', required, undefined),
    lastname: genValidator('string', required, undefined),
    email: genValidator('string', false, undefined).email(),
    birth: joi.date(),
    DNI: genValidator('string', required, undefined),
    gender: genValidator('string', false, undefined),
    phone: genValidator('string', false, undefined),
    mobile: genValidator('string', false, undefined),
    address: genValidator('string', false, undefined),
    postalCode: genValidator('string', false, undefined),
    street: genValidator('string', false, undefined),
    province: genValidator('string', false, undefined)
  })

  return patientObject
}
