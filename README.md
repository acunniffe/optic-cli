@useoptic/cli
=============

API automation for the modern team

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@useoptic/cli.svg)](https://npmjs.org/package/@useoptic/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@useoptic/cli.svg)](https://npmjs.org/package/@useoptic/cli)
[![License](https://img.shields.io/npm/l/@useoptic/cli.svg)](https://github.com/opticdev/optic/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @useoptic/cli
$ optic COMMAND
running command...
$ optic (-v|--version|version)
@useoptic/cli/2.0.3 darwin-x64 node-v8.12.0
$ optic --help [COMMAND]
USAGE
  $ optic COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`optic api:document`](#optic-apidocument)
* [`optic api:publish`](#optic-apipublish)
* [`optic config:check`](#optic-configcheck)
* [`optic credentials:add-token`](#optic-credentialsadd-token)
* [`optic help [COMMAND]`](#optic-help-command)

## `optic api:document`

document your API contract

```
USAGE
  $ optic api:document
```

_See code: [src/commands/api/document.ts](https://github.com/opticdev/optic-cli/blob/v2.0.3/src/commands/api/document.ts)_

## `optic api:publish`

publish your API contract to Optic

```
USAGE
  $ optic api:publish

OPTIONS
  -d, --draft
```

_See code: [src/commands/api/publish.ts](https://github.com/opticdev/optic-cli/blob/v2.0.3/src/commands/api/publish.ts)_

## `optic config:check`

validate your optic.yml

```
USAGE
  $ optic config:check
```

_See code: [src/commands/config/check.ts](https://github.com/opticdev/optic-cli/blob/v2.0.3/src/commands/config/check.ts)_

## `optic credentials:add-token`

authenticate the CLI

```
USAGE
  $ optic credentials:add-token
```

_See code: [src/commands/credentials/add-token.ts](https://github.com/opticdev/optic-cli/blob/v2.0.3/src/commands/credentials/add-token.ts)_

## `optic help [COMMAND]`

display help for optic

```
USAGE
  $ optic help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_
<!-- commandsstop -->
