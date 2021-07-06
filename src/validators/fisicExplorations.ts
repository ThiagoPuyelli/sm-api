import joi from 'joi'
import genValidator from '../utils/genValidator'

export const saveExploration = joi.object({
  info: joi.array().required().min(1).max(20).items(joi.object().keys({
    title: genValidator('string', true, undefined),
    data: genValidator('string', true, undefined)
  }))
})

export const updateExploration = joi.object({
  title: genValidator('string', false, undefined),
  data: genValidator('string', false, undefined)
})
