'use strict'

const crypto = require('node:crypto')
const os = require('node:os')
const fs = require('node:fs')
const path = require('node:path')
const {execa, execaNode} = require('execa')
const {test, threw} = require('tap')
const ROOT = path.join(__dirname, '..', '..')
const BIN = path.join(ROOT, 'bin')
const usage = fs.readFileSync(path.join(BIN, 'usage.txt'), 'utf8')
const cli = path.join(BIN, 'cli.js')

const {mkdtemp} = fs.promises

const COMMIT_ERROR = `
feat: This commit is Invalid

It has a body, but no reference
This should fail.


`.trim()

const COMMIT_PASS = `
feat: This commit is valid

It has a body, and a reference

Ref: LOG-0001
`.trim()

function mktmp() {
  return mkdtemp(path.join(os.tmpdir(), 'commitlint-'))
}

async function init(cwd) {
  await execa('git', ['init', '--initial-branch=main'], {cwd})
  await execa('touch', ['README.md'], {cwd})
  await execa('git', ['add', 'README.md'], {cwd})
  await execa('git', ['commit', '-m', 'initial commit'], {cwd})
}

async function commit(file, content, msg, cwd) {
  await fs.promises.appendFile(path.join(cwd, file), content)
  await execa('git', ['add', file], {cwd})
  await execa('git', ['commit', '-m', msg], {cwd})
}

async function branch(cwd, error = true) {
  const branch_name = crypto.randomBytes(5).toString('hex')
  const commit = error ? COMMIT_ERROR : COMMIT_PASS
  await execa('git', ['checkout', '-b', branch_name], {cwd})
  await execa('touch', [branch_name], {cwd})
  await execa('git', ['add', branch_name], {cwd})
  await execa('git', ['commit', '-m', commit], {cwd})
  return branch_name
}

test('cli', async (t) => {
  t.test('exports', async (t) => {
    const exported = require(cli)
    t.type(exported, 'function', 'main function exported')
  })
  t.test('--help', async (t) => {
    const {stdout} = await execa(cli, ['--help'])
    t.equal(stdout, usage.trim(), 'output from --help')
  })

  t.test('--version', async (t) => {
    const {stdout} = await execa(cli, ['--version'])
    const {version} = require(path.join(ROOT, 'package.json'))
    t.equal(stdout, version, 'output from --version')
  })

  t.test('invalid format', async (t) => {
    const {stderr, exitCode} = await execaNode(cli, [
      '--format'
    , 'fake'
    ]).catch((out) => {
      return out
    })

    t.equal(exitCode, 1, 'exit code')
    t.match(stderr, /Unknown format: fake/i, 'error message mentions unknown format')
    t.match(
      stderr
    , /Valid formats: pretty, checkstyle/i
    , 'error message lists valid formats'
    )
  })

  t.test('failed lint', async (t) => {
    const cwd = await mktmp()
    t.teardown(async () => {
      await fs.promises.rm(cwd, {recursive: true, force: true})
    })

    await init(cwd)
    await branch(cwd, true)

    const {stderr, exitCode} = await execaNode(cli, [
      '-f'
    , 'main'
    , '--format'
    , 'pretty'
    , '--format'
    , 'checkstyle'
    ], {
      cwd
    }).catch((out) => {
      return out
    })

    t.equal(exitCode, 1, 'exit code')
    t.match(stderr, /footer must not be empty/gi)
  })

  t.test('failed lint - arbitrary location', async (t) => {
    const cwd = await mktmp()
    t.teardown(async () => {
      await fs.promises.rm(cwd, {recursive: true, force: true})
    })

    await init(cwd)
    await branch(cwd, true)
    await commit('README.md', '## Test', COMMIT_PASS, cwd)

    const {stderr, exitCode} = await execaNode(cli, [
      '-f', 'main', '--pwd', cwd
    ]).catch((out) => {
      return out
    })
    t.equal(exitCode, 1, 'exit code')
    t.match(stderr, /footer must not be empty/gi)
  })

  t.test('default parameters', async (t) => {
    const cwd = await mktmp()
    t.teardown(async () => {
      await fs.promises.rm(cwd, {recursive: true, force: true})
    })

    await init(cwd)
    await branch(cwd, false)

    const {exitCode} = await execaNode(cli, [
      '-f'
    , 'main'
    ], {cwd}).catch((out) => {
      return out
    })

    t.equal(exitCode, 0, 'exit code')
  })

  t.test('successful lint', async (t) => {
    const cwd = await mktmp()
    t.teardown(async () => {
      await fs.promises.rm(cwd, {recursive: true, force: true})
    })

    await init(cwd)
    await branch(cwd, false)

    const {exitCode} = await execaNode(cli, [
      '-f'
    , 'main'
    , '--format'
    , 'pretty'
    , '--format'
    , 'checkstyle'
    ], {cwd})
    t.equal(exitCode, 0, 'exit code')
    t.resolves(
      fs.promises.stat(
        path.join(cwd, '.commitlint', 'report', 'checkstyle.json')
      )
    , 'checkstyle.json found'
    )
  })
}).catch(threw)
