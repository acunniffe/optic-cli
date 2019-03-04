import {IOpticYamlConfig, opticYamlFileName, validate} from '@useoptic/core/build/src/optic-config'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

export function parseOpticYaml(fileContents: string): IOpticYamlConfig {
  const parsed = yaml.safeLoad(fileContents) as IOpticYamlConfig
  const validationResult = validate(parsed)
  if (validationResult.error) {
    throw new Error(validationResult.error.message)
  }

  return validationResult.value as IOpticYamlConfig
}

export function readOpticYaml() {
  return fs.readFileSync(opticYamlFileName, 'utf8')
}

export function writeOpticYaml(config: IOpticYamlConfig) {
  return fs.writeFileSync(opticYamlFileName, yaml.dump(config))
}

export function writeOutput(outputFileName: string, contents: string) {
  const outputFolder = './.optic'
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }
  fs.writeFileSync(path.join(outputFolder, outputFileName), contents)
}
