import { Command, flags } from '@oclif/command'
import { IOpticYamlConfig } from '@useoptic/core/build/src/optic-config'
import { cli } from 'cli-ux'

import { apiIdToName, generateArtifactService } from '../../common/api'
import { parseOpticYaml, readOpticYaml } from '../../common/config'
import { Credentials } from '../../common/credentials'
import { OpticService } from '../../services/optic'

export default class ApiInstall extends Command {
  static description = 'Generates artifacts defined in your optic.yml file'

  static args = []

  async run() {

    const config: IOpticYamlConfig = parseOpticYaml(readOpticYaml())
    const token = await new Credentials().get()
    if (token === null) {
      return this.error('Please login to optic using \'optic auth:login\'')
    }
    cli.action.start('Generating artifacts')

    const generateDependency = generateArtifactService(this, token)

    const finalResults = []

    for (let dependency of config.dependencies) {
      const result: any = await generateDependency(dependency)
      if (result && result.error) {
        finalResults.push({dependency, success: false, error: result.error})
      } else {
        finalResults.push({dependency, success: true})
      }
    }

    const successes = finalResults.filter(i => i.success)
    const failures = finalResults.filter(i => !i.success)

    this.log('\n\nDone!')
    successes.forEach(i => this.log(`[Success] Generated ${i.dependency.cogentId} for ${apiIdToName(i.dependency.api)}@${i.dependency.version}`))
    failures.forEach(i => this.error(`Failed to generate ${i.dependency.cogentId} for ${apiIdToName(i.dependency.api)}@${i.dependency.version}. Reason: ${i.error}`))

    process.exit(0)

  }

}
