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
@useoptic/cli/3.2.0 darwin-x64 node-v10.15.3
$ optic --help [COMMAND]
USAGE
  $ optic COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`optic api:add API-ID`](#optic-apiadd-api-id)
* [`optic api:document`](#optic-apidocument)
* [`optic api:install`](#optic-apiinstall)
* [`optic api:publish`](#optic-apipublish)
* [`optic api:publishLocal`](#optic-apipublishlocal)
* [`optic api:update`](#optic-apiupdate)
* [`optic auth:login`](#optic-authlogin)
* [`optic auth:logout`](#optic-authlogout)
* [`optic config:check`](#optic-configcheck)
* [`optic help [COMMAND]`](#optic-help-command)
* [`optic setup:init`](#optic-setupinit)
* [`optic setup:paths [TESTCMD]`](#optic-setuppaths-testcmd)
* [`optic setup:tests [TESTCMD]`](#optic-setuptests-testcmd)

## `optic api:add API-ID`

Add API dependencies to your project

```
USAGE
  $ optic api:add API-ID

ARGUMENTS
  API-ID  "org/api" or "api"

OPTIONS
  -g, --generate=generate  artifacts to generate
  -v, --version=version    [default: latest] API version to consume, defaults to "latest"
```

_See code: [src/commands/api/add.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/api/add.ts)_

## `optic api:document`

document your API contract

```
USAGE
  $ optic api:document

OPTIONS
  --generate=generate
```

_See code: [src/commands/api/document.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/api/document.ts)_

## `optic api:install`

Generates artifacts defined in your optic.yml file

```
USAGE
  $ optic api:install
```

_See code: [src/commands/api/install.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/api/install.ts)_

## `optic api:publish`

publish your API contract to Optic

```
USAGE
  $ optic api:publish

OPTIONS
  -d, --draft
```

_See code: [src/commands/api/publish.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/api/publish.ts)_

## `optic api:publishLocal`

publish your API contract locally

```
USAGE
  $ optic api:publishLocal
```

_See code: [src/commands/api/publishLocal.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/api/publishLocal.ts)_

## `optic api:update`

Checks if any API dependencies need updates

```
USAGE
  $ optic api:update
```

_See code: [src/commands/api/update.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/api/update.ts)_

## `optic auth:login`

login to your account from the CLI

```
USAGE
  $ optic auth:login

OPTIONS
  --host=host
```

_See code: [src/commands/auth/login.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/auth/login.ts)_

## `optic auth:logout`

logout from the CLI

```
USAGE
  $ optic auth:logout

OPTIONS
  --host=host
```

_See code: [src/commands/auth/logout.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/auth/logout.ts)_

## `optic config:check`

validate your optic.yml

```
USAGE
  $ optic config:check
```

_See code: [src/commands/config/check.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/config/check.ts)_

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

## `optic setup:init`

setup an optic project

```
USAGE
  $ optic setup:init

OPTIONS
  --id=id
  --verify-tests
```

_See code: [src/commands/setup/init.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/setup/init.ts)_

## `optic setup:paths [TESTCMD]`

detect API paths by running tests

```
USAGE
  $ optic setup:paths [TESTCMD]

ARGUMENTS
  TESTCMD  the command that runs your tests
```

_See code: [src/commands/setup/paths.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/setup/paths.ts)_

## `optic setup:tests [TESTCMD]`

validate that your tests log data to Optic

```
USAGE
  $ optic setup:tests [TESTCMD]

ARGUMENTS
  TESTCMD  the command that runs your tests
```

_See code: [src/commands/setup/tests.ts](https://github.com/opticdev/optic-cli/blob/v3.2.0/src/commands/setup/tests.ts)_
<!-- commandsstop -->
