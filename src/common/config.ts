import {ISessionManagerOptions} from '@useoptic/core/build/src/session-manager'
import * as fs from 'fs'
import * as Joi from 'joi'
import * as yaml from 'js-yaml'
import * as path from 'path'

export const opticYamlFileName = 'optic.yml'

export const documentationStrategyConfigType = Joi.alternatives(
  Joi.object().keys({type: Joi.string().valid('logging').required()}),
  Joi.object().keys({
    type: Joi.string().valid('proxy'),
    targetHost: Joi.string().required(),
    targetPort: Joi.number().required()
  })
)

export const securityConfigType = Joi.array()
  .items(
    Joi.object().keys({
      type: Joi.string().valid('basic', 'bearer').required()
    }),
    Joi.object().keys({
      type: Joi.string().valid('apiKey').required(),
      in: Joi.string().valid('cookie', 'query', 'header').required(),
      name: Joi.string().required().min(1)
    })
  )

export const opticConfigType = Joi.object()
  .keys({
    commandToRun: Joi.string().required(),
    documentationStrategy: documentationStrategyConfigType,
    api: Joi.object().keys({
      security: securityConfigType,
      paths: Joi.array().items(Joi.string()).required()
    })
  })

export function parseOpticYaml(fileContents: string) {
  try {
    const doc = yaml.safeLoad(fileContents) as ISessionManagerOptions
    const result = Joi.validate(doc, opticConfigType)
    if (result.error) {
      return {config: null, error: result.error.message}
    } else {
      return {config: doc, error: null}
    }
  } catch (e) {
    return {config: null, error: 'Could not parse optic.yml file: ' + e}
  }
}

export function readOpticYaml() {
  return fs.readFileSync(opticYamlFileName, 'utf8')
}

export function writeOutput(outputFileName: string, contents: string) {
  const outputFolder = './.optic'
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }
  fs.writeFileSync(path.join(outputFolder, outputFileName), contents)
}
