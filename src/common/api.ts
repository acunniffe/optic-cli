import {Command} from '@oclif/command'
import {CogentEngine, FileSystemReconciler} from '@useoptic/core/build/src'
import {IFileSystemRendererFolder} from '@useoptic/core/build/src/cogent-core/react/file-system-renderer'
import {ICogentArtifactIdentifier, ICogentEngineConfig} from '@useoptic/core/build/src/cogent-engines/cogent-engine'
import {IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'
import * as archy from 'archy'
import * as fs from 'fs-extra'
import * as path from 'path'

import {Callback} from '../commands/api/publish'

import {apiIdToTeamSlugAndApiSlug} from './api-id'

export async function getApiVersion(opticService: any, apiId: string, apiVersion: string) {
  const {teamSlug, apiSlug} = apiIdToTeamSlugAndApiSlug(apiId)
  let snapshotResponse
  if (teamSlug) {
    snapshotResponse = await opticService.getTeamApiVersionByTeamSlugAndApiSlugAndVersion(teamSlug, apiSlug, apiVersion)
  } else {
    snapshotResponse = await opticService.getSelfApiVersionByApiSlugAndVersion(apiSlug, apiVersion)
  }
  if (snapshotResponse.statusCode !== 200) {
    throw new Error(`Please ensure api "${apiId}" version "${apiVersion}" has been published.`)
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
        .map(folderName => toArchy(folder.folders[folderName]))
    ]
  }
  return root
}

export async function generateArtifact(
  outputDirectory: string, opticService: any, opticConfig: IOpticYamlConfig, command: Command
) {
  const baseOutputDirectory = path.resolve(process.cwd(), outputDirectory)
  fs.ensureDirSync(baseOutputDirectory)
  return Promise.all(
    opticConfig.dependencies
      .map(async dependency => {
        const {id, version} = dependency

        const snapshotAtVersion = await getApiVersion(opticService, id, version)

        const callback: Callback<IFileSystemRendererFolder> = (error, result) => {
          if (error) {
            return command.error(error)
          }
          if (result) {
            const reconciler = new FileSystemReconciler()
            reconciler.emit(result, cogentConfig.options)
            command.log(`\nGenerating ${artifact.id}@${artifact.version} in ${outputDirectory}:`)
            command.log(archy(toArchy(result)))
          }
        }
        const artifact: ICogentArtifactIdentifier = {
          id: 'js-api-client',
          version
        }

        const outputDirectory = path.join(baseOutputDirectory, artifact.id)
        fs.ensureDirSync(outputDirectory)
        fs.emptyDirSync(outputDirectory)

        const cogentConfig: ICogentEngineConfig = {
          data: {
            apiSnapshot: snapshotAtVersion.body.snapshot
          },
          options: {
            outputDirectory,
            api: {
              id,
              version,
            },
            artifact
          },
          callback
        }

        const engine = new CogentEngine()
        engine.run(cogentConfig)
      })
  )
}
