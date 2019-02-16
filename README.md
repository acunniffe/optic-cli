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
@useoptic/cli/0.1.4 darwin-x64 node-v8.12.0
$ optic --help [COMMAND]
USAGE
  $ optic COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`optic hello [FILE]`](#optic-hello-file)
* [`optic help [COMMAND]`](#optic-help-command)

## `optic hello [FILE]`

describe the command here

```
USAGE
  $ optic hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ optic hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/opticdev/optic/blob/v0.1.4/src/commands/hello.ts)_

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
