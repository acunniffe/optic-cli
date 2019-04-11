import {IOpticYamlConfig, parseOpticYaml as internalParse} from '@useoptic/core/build/src/optic-config'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

const opticYamlFileName = 'optic.yml'

export function parseOpticYaml(fileContents: string): IOpticYamlConfig {
  const parsed = yaml.safeLoad(fileContents) as IOpticYamlConfig

  const parseTry = internalParse(parsed)

  if (!parseTry.isSuccess) {
    throw new Error(parseTry.error)
  }

  return parseTry.config as IOpticYamlConfig
}

export function parseOpticYamlWithOriginal(fileContents: string): { parsed: any, validated: IOpticYamlConfig } {
  const parsed = yaml.safeLoad(fileContents) as any

  const parseTry = internalParse(parsed)

  if (!parseTry.isSuccess) {
    throw new Error(parseTry.error)
  }

  const validated = parseTry.config as IOpticYamlConfig
  return {
    parsed,
    validated,
  }
}

export function readOpticYaml() {
  return fs.readFileSync(opticYamlFileName, 'utf8')
}

export function writeOpticYaml(config: any) {
  return fs.writeFileSync(opticYamlFileName, yaml.dump(config))
}

export function writeOutput(outputFileName: string, contents: string) {
  const outputFolder = './.optic'
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }
  fs.writeFileSync(path.join(outputFolder, outputFileName), contents)
}
