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

  return parsed
}

export function readOpticYaml() {
  return fs.readFileSync(opticYamlFileName, 'utf8')
}

export const outputFolder = path.join(process.cwd(), './.optic')

export function writeOutput(outputFileName: string, contents: string) {
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }
  fs.writeFileSync(path.join(outputFolder, outputFileName), contents)
}

export function readOutput(outputFileName: string) {
  const outputFilePath = path.join(outputFolder, outputFileName)
  if (!fs.existsSync(outputFilePath)) {
    throw new Error(`Could not find the output file ${outputFileName}  in ${outputFolder}`)
  }
  return fs.readFileSync(outputFilePath)
}
