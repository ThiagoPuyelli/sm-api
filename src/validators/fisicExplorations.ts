import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveExploration = joi.object({
  info: joi.array().required().min(1).max(20).items(joi.object().keys({
    title: genValidator('string', true, { max: 40 }),
    data: genValidator('string', true, { max: 400 })
  }))
})

export const updateExploration = joi.object({
  title: genValidator('string', false, { max: 40 }),
  data: genValidator('string', false, { max: 400 })
})
