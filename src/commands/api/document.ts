process.env.DEBUG = process.env.DEBUG ? `${process.env.DEBUG},optic:*` : 'optic:*'

import {Command, flags} from '@oclif/command'
import {SessionManager, CogentEngine, FileSystemReconciler, ObservationsToGraphBuilder} from '@useoptic/core'
import {IFileSystemRendererFolder} from '@useoptic/core/build/src/cogent-core/react/file-system-renderer'
import {ICogentArtifactIdentifier, ICogentEngineConfig} from '@useoptic/core/build/src/cogent-engines/cogent-engine'
import {Observation} from '@useoptic/core/build/src/interactions-to-observations'
import {IOpticYamlConfig, toSessionConfig} from '@useoptic/core/build/src/optic-config'
import {IDocumentConfig} from '@useoptic/core/build/src/optic-config/document-config'
import {ReportBuilder} from '@useoptic/core/build/src/report-builder'
import {ISessionManagerOptions} from '@useoptic/core/build/src/session-manager'
import {cli} from 'cli-ux'
import * as fs from 'fs-extra'
import * as path from 'path'
import {defaultAPM} from '../../api-packages/api-package-manager'
import {LocalResolver} from '../../api-packages/resolvers/local-resolver'

import {parseOpticYaml, readOpticYaml, writeOutput} from '../../common/config'
import {harToObservations} from '../../common/har-utilities'
import analytics from '../../services/analytics/segment'
import {Callback} from './publish'

interface IDocumentConfigWithHar extends IDocumentConfig {
  har: string
}

function usesHar(documentConfig: IDocumentConfig): documentConfig is IDocumentConfigWithHar {
  return !!documentConfig.har
}

export default class ApiDocument extends Command {
  static description = 'document your API contract'

  static flags = {
    generate: flags.string({required: false})
  }

  static args = []

  async run() {
    const {flags} = this.parse(ApiDocument)
    const config: IOpticYamlConfig = parseOpticYaml(readOpticYaml())
    if (!config.document) {
      return this.error('You must have a document field in your optic.yml to document an API https://docs.useoptic.com')
    }

    const usesRest = !!config.document.run_tests
    const configUsesHar = usesHar(config.document)

    analytics.track('Api Document', {usesRest, usesHar: configUsesHar})

    let allObservations: Observation[] = []

    if (usesHar(config.document)) {
      cli.action.start(`Learning from HAR file ${config.document.har}`)
      allObservations.push(...harToObservations(config.document.har, config.document))
    }

    if (usesRest) {
      cli.action.start('Observing API Behavior')
      const sessionConfig: ISessionManagerOptions = toSessionConfig(config)
      const sessionManager = new SessionManager(sessionConfig)
      const successful = await sessionManager.run()
      cli.action.start('Analyzing')
      let shouldBuildReport = true
      if (!successful) {
        if (sessionManager.samples.length === 0) {
          return this.error('No API Interactions Observed. Make sure that you have added Optic middleware to your test fixtures https://docs.useoptic.com')
        }
        cli.log('The test command had a non-zero exit. Some tests may have failed.')
        shouldBuildReport = await cli.confirm('Continue anyway? (y/n)')
      }

      if (!shouldBuildReport) {
        this.log('ok! exiting…')
        return
      }
      cli.action.start('Generating reports')
      const report = new ReportBuilder().buildReport(sessionConfig, sessionManager.samples)

      const {messages, observations} = report
      allObservations.push(...observations)
      messages.forEach(message => this.log(message))
    }

    writeOutput('observations.json', JSON.stringify(allObservations, null, 2))

    const observationsToGraph = ObservationsToGraphBuilder.fromEmptyGraph()
    observationsToGraph.interpretObservations(allObservations)

    // writeOutput('graphviz.txt', observationsToGraph.graph.toGraphViz())

    cli.action.stop()

    //enforce oas only for now
    if (flags.generate === 'oas') {
      const localResolver = (defaultAPM.localResolver() as LocalResolver)
      const {snapshot} = await localResolver.observationsToGraph(allObservations)
      this.generateOas(snapshot, config.document)
    }
    cli.log('Your API has now been documented! Next you might want to run optic api:publish')
  }

  generateOas(snapshot: any, config: IDocumentConfig) {
    analytics.track('Generated Swagger')
    cli.action.start('Generating OAS Spec')
    const baseOutputDirectory = path.resolve('./.optic/oas')
    fs.ensureDirSync(baseOutputDirectory)
    fs.emptyDirSync(baseOutputDirectory)
    const callback: Callback<IFileSystemRendererFolder> = (error, result) => {
      if (error) {
        return this.error(error.message)
      }
      if (result) {
        const reconciler = new FileSystemReconciler()
        reconciler.emit(result, cogentConfig.options)
        cli.action.stop('Done! OAS Spec written to .optic/oas')
      }
    }
    const api = config.api
    const artifact: ICogentArtifactIdentifier = {
      id: 'oas',
      version: ''
    }
    const cogentConfig: ICogentEngineConfig = {
      data: {
        apiSnapshot: snapshot,
      },
      options: {
        outputDirectory: baseOutputDirectory,
        api: {
          id: (api.org) ? `${api.org}/${api.id}` : api.id,
          version: config.version || '',
        },
        artifact,
      },
      callback,
    }

    const engine = new CogentEngine()
    engine.run(cogentConfig)
  }
}
