import { Command } from '@oclif/command'
import { CogentEngine, FileSystemReconciler } from '@useoptic/core/build/src'
import { IFileSystemRendererFolder } from '@useoptic/core/build/src/cogent-core/react/file-system-renderer'
import { ICogentArtifactIdentifier, ICogentEngineConfig } from '@useoptic/core/build/src/cogent-engines/cogent-engine'
import { IOpticYamlConfig } from '@useoptic/core/build/src/optic-config'
import { IApiDependencyConfig } from '@useoptic/core/build/src/optic-config/consume-config'
import { IApiId } from '@useoptic/core/build/src/optic-config/regexes'
import * as archy from 'archy'
import * as fs from 'fs-extra'
import * as path from 'path'

import { Callback } from '../commands/api/publish'

import { apiIdToTeamSlugAndApiSlug } from './api-id'
import base = Mocha.reporters.base

export async function getApiVersion(opticService: any, apiId: IApiId, apiVersion: string) {
  const { org, id } = apiId
  let snapshotResponse
  if (org) {
    snapshotResponse = await opticService.getTeamApiVersionByTeamSlugAndApiSlugAndVersion(org, id, apiVersion)
  } else {
    snapshotResponse = await opticService.getSelfApiVersionByApiSlugAndVersion(id, apiVersion)
  }

  return snapshotResponse
}

type ArchyNode = string | IArchy

interface IArchy {
  label: string
  nodes: ArchyNode[]
}

export function toArchy(folder: IFileSystemRendererFolder) {
  const root: IArchy = {
    label: folder.name,
    nodes: [
      ...Object.keys(folder.files),
      ...Object.keys(folder.folders)
        .map(folderName => toArchy(folder.folders[folderName])),
    ],
  }
  return root
}

export const apiIdToName = (api: IApiId): string => ((api.org) ? api.org + '/' : '') + api.id

export const generateArtifactService = (opticService: any, command: Command) => async (dependency: IApiDependencyConfig) => {

  const makeError = (error: string) => ({error})

  const baseOutputDirectory = path.resolve(process.cwd(), dependency.outputDirectory)
  fs.ensureDirSync(baseOutputDirectory)
  fs.emptyDirSync(baseOutputDirectory)

  let snapshotAtVersion

  try {
    snapshotAtVersion = await getApiVersion(opticService, dependency.api, dependency.version)
    if (snapshotAtVersion.statusCode !== 200) {
      return makeError(`Please ensure API "${apiIdToName(dependency.api)}" version "${dependency.version}" has been published.`)
    }
  } catch (e) {
    return makeError(e.message)
  }

  const callback: Callback<IFileSystemRendererFolder> = (error, result) => {
    if (error) {
      return makeError(error.message)
    }
    if (result) {
      const reconciler = new FileSystemReconciler()
      reconciler.emit(result, cogentConfig.options)
      command.log(`\nGenerating ${artifact.id} in ${baseOutputDirectory}:`)
      command.log(archy(toArchy(result)))
      return {
        fileTree: archy(toArchy(result)),
        name: `\nGenerated ${artifact.id} in ${baseOutputDirectory}:`,
      }
    }
  }

  const artifact: ICogentArtifactIdentifier = {
    id: dependency.cogentId,
    version: dependency.version, // temp, eventually will be real version
  }
  const cogentConfig: ICogentEngineConfig = {
    data: {
      apiSnapshot: snapshotAtVersion.body.gqlResponse.snapshot,
    },
    options: {
      outputDirectory: baseOutputDirectory,
      api: {
        id: (dependency.api.org) ? `${dependency.api.org}/${dependency.api.id}` : dependency.api.id,
        version: dependency.version,
      },
      artifact,
    },
    callback,
  }

  const engine = new CogentEngine()
  engine.run(cogentConfig)
}
