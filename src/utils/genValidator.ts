import joi from 'joi'

interface MinMax {
  min?: number;
  max?: number;
}

export default (type: string, required: boolean, minmax: MinMax|undefined) => {
  let validator = joi[type]()

  if (required) {
    validator = validator.required()
  }

  if (minmax) {
    const { min, max } = minmax
    if (min) {
      validator = validator.min(min)
    }

    if (max) {
      validator = validator.max(max)
    }
  }

  return validator
}
