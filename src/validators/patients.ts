import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveOrModifyPatient = (required: boolean) => {
  const patientObject = joi.object({
    name: genValidator('string', required, { max: 30 }),
    lastname: genValidator('string', required, { max: 30 }),
    email: genValidator('string', false, undefined).email(),
    birth: joi.date(),
    DNI: genValidator('string', required, { max: 20 }),
    gender: genValidator('string', false, { max: 15 }),
    phone: genValidator('string', false, { max: 25 }),
    mobile: genValidator('string', false, { max: 25 }),
    address: genValidator('string', false, { max: 25 }),
    postalCode: genValidator('string', false, { max: 8 }),
    street: genValidator('string', false, { max: 20 }),
    province: genValidator('string', false, { max: 25 })
  })

  return patientObject
}
