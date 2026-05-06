#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const util = require('node:util')
const {default: gitlog} = require('gitlog')
const {MarkdownDocument, md} = require('build-md')
const {default: lint} = require('@commitlint/lint')
const {default: load} = require('@commitlint/load')
const {version} = require('../package.json')
const {ERROR_MESSAGES} = require('../lib/constants.js')
const usage = fs.readFileSync(path.join(__dirname, './usage.txt'), 'utf8')

const log = util.debuglog('lint')
const HELP_URL = 'https://github.com/mezmo/commitlint-config'
const SPEC_URL = 'https://www.conventionalcommits.org/en/v1.0.0/#summary'
const ROOT = path.join(__dirname, '..')
const CONFIG_PATH = path.join(ROOT, 'index.js')

const COLOR = {
  GREEN: '\x1b[32m'
, CYAN: '\x1b[36m'
, RED: '\x1b[31m'
, BLUE: '\x1b[94m'
, YELLOW: '\x1b[33m'
, RESET: '\x1b[0m'
, DIM: '\x1b[90m'
, UNDER: '\x1b[4:5m'
, UNDER_BLUE: '\x1b[4:5m\x1b[94m'
}
// ✅ Unicode symbols (standard in commitlint CLI)
// Note: \u2491 is the circled 'q' (not used); we use:
const SYMBOLS = {
  ERROR: '\u2717' // (ballot X) — strong, unambiguous
, WARN: '\u2206' // (warning sign)
, OK: '\u2713' // check mark
, INFO: `${colorize('\u026A', 'BLUE')}` // (information source — safer than ? in circle)
, HEADER: `${colorize('commit', 'CYAN')}`
}

const LEVEL = {
  WARNING: 1
, ERROR: 2
, IGNORE: 0
}

const FORMATS = {
  pretty: toPretty
, checkstyle: toCheckStyle
}
module.exports = main

function colorize(txt, color) {
  /* c8 ignore next */
  if (!COLOR[color]) return txt
  if (!process.stdout.isTTY) return txt
  /* c8 ignore next: CI doesn't run with a TTY */
  return `${COLOR[color]}${txt}${COLOR.RESET}`
}

if (module === require.main) {
  const parsed = util.parseArgs({
    args: process.argv.slice(2)
  , options: {
      help: {
        'short': 'h'
      , 'type': 'boolean'
      , 'description': 'Show help message'
      }
    , version: {
        'short': 'v'
      , 'type': 'boolean'
      , 'description': 'Show version'
      }
    , pwd: {
        'short': 'p'
      , 'type': 'string'
      , 'description': 'Working directory'
      , 'default': process.cwd()
      }
    , config: {
        'short': 'c'
      , 'type': 'string'
      , 'description': 'Config file path'
      , 'default': CONFIG_PATH
      }
    , to: {
        'short': 't'
      , 'type': 'string'
      , 'description': 'End commit'
      , 'default': 'HEAD'
      }
    , from: {
        'short': 'f'
      , 'type': 'string'
      , 'description': 'Start commit'
      , 'default': 'origin/main'
      }
    , format: {
        'type': 'string'
      , 'description': 'output format (can be specified multiple times)'
      , 'multiple': true
      , 'default': ['pretty']
      }
    }
  })
  const {values: flags} = parsed

  if (flags.help) return console.log(usage.trim())
  if (flags.version) return console.log(version.trim())

  const formats = flags.format && flags.format.length > 0
    ? flags.format
    /* c8 ignore next */
    : ['pretty']

  main(flags)
    .then((result) => {
      process.exitCode = result.valid ? 0 : 1

      // Run each formatter
      for (const format of formats) {
        const formatter = FORMATS[format]

        if (typeof formatter !== 'function') {
          const error = new Error(`Unknown format: ${format}. Valid formats: ${Object.keys(FORMATS).join(', ')}`)
          throw error
        }
        formatter(result, flags)
      }
    }).catch(handleCatch)
}

function toPretty(results) {
  // 2. Custom summary line
  const total = results.total
  const failed = results.failed
  const warnings = results.warnings
  const passed = results.passed

  // Build summary string
  const passed_msg = `${passed} passed`
  const fail_msg = `${failed} failed`
  const warn_msg = `${warnings} with warnings`

  const lines = []
  for (const {input, errors, warnings: commitWarnings, _, sha} of results.results) {
    const result = errors.concat(commitWarnings)
    const subject = input.split('\n')[0]
    const commit_sha = sha.substring(0, 7)
    lines.push(
      ''
    , `${SYMBOLS.HEADER} (${colorize(commit_sha, 'UNDER_BLUE')}) ${subject}`
    )

    if (!errors.length && !commitWarnings.length) {
      lines.push(`  ${colorize(SYMBOLS.OK, 'GREEN')}  valid`)
      continue
    }

    // Sort by type (errors first), then by name
    const sorted = result.sort((a, b) => {
      return a.level - b.level
    })

    for (const issue of sorted) {
      /* c8 ignore next */
      if (issue.valid) continue

      const custom_message = ERROR_MESSAGES[issue.name]
      const display_message = custom_message
        ? custom_message.message
      /* c8 ignore next */
        : issue.message
      const explanation = custom_message?.explanation
      const symbol = issue.level === LEVEL.ERROR

        ? colorize(SYMBOLS.ERROR, 'RED')
      /* c8 ignore next */
        : colorize(SYMBOLS.WARN, 'YELLOW')

      lines.push(
        `  ${symbol}  ${display_message} [${colorize(issue.name, 'DIM')}]`
      )

      if (explanation) {
        lines.push(
          `       ${SYMBOLS.INFO} ${colorize(explanation, 'DIM')}`
        )
      }
    }
  }

  let summary = `${total} commit(s) checked:`
  if (passed) summary += ` ${SYMBOLS.OK} ${colorize(passed_msg, 'GREEN')}`
  if (failed) summary += ` | ${SYMBOLS.ERROR} ${colorize(fail_msg, 'RED')}`
  /* c8 ignore next: we don't have any default rules at this level */
  if (warnings) summary += ` | ${SYMBOLS.WARN} ${colorize(warn_msg, 'YELLOW')}`

  lines.push(summary)

  if (failed || warnings) {
    lines.push(
      `# Get help: ${HELP_URL}`
    , `# Conventional Commit Specificaiton: ${SPEC_URL}`
    )
  }

  if (failed) {
    const example = fs.readFileSync(path.join(__dirname, 'commit.txt'), 'utf8')
    lines.push(
      ''
    , 'A Conventional Commit'
    , ''
    , `${colorize(example, 'DIM')}`
    )
  }

  console.error(lines.join('\n'))
}
function toCheckStyle(results, flags) {
  const issues = []
  for (const issue of results.results) {
    const sha = issue.sha.substring(0, 7)

    const lines = issue.errors.concat(issue.warnings)

    for (const issue of lines) {
      issues.push({
        fileName: 'COMMIT_MSG'
      , lineStart: 0
      , lineEnd: 0
      , columnStart: 0
      , columnEnd: 0
      , message: issue.message
      , description: issue.name
      , severity: issue.level === LEVEL.ERROR ? 'ERROR' /* c8 ignore next */ : 'WARNING'
      , type: issue.name
      , fingerprint: sha
      })
    }
  }
  const symbol = results.errors
    ? '\u274C' // red x
    : '\uD83D\uDFE2' // green dot

  const summary = results.errors
    ? 'Commit style errors encountered. '
      + 'Please rebase and amend commits to fix messages, then push the updated commits.'
    : 'All commits follow the conventional commit style. Great work!'

  const output = JSON.stringify({
    issues: issues
  , name: 'Commitlint'
  , text: buildReport(results)
  , summary: util.format('%s %s', symbol, summary)
  , title: 'Commitlint'
  , conclusion: results.errors ? 'FAILURE' : 'SUCCESS'
  })

  // Output to file if specified, otherwise default to commitlint/report/checkstyle.json
  const pwd = flags.pwd /* c8 ignore next */ || process.cwd()
  const report_dir = flags['report-dir'] || path.join(pwd, '.commitlint', 'report')
  const out_file = path.join(report_dir, 'checkstyle.json')

  // Ensure directory exists
  fs.mkdirSync(report_dir, {recursive: true})

  fs.writeFileSync(out_file, output, 'utf8')
}

async function main(flags) {
  const pwd = path.resolve(process.cwd(), flags.pwd)
  log('reading commits from %s', pwd)
  const {rules, ...opts} = toConfig(await load({'extends': flags.config}))

  // Using glitlog instead of @commitlint/read
  // because commitlint doesn't return metadata, like that hash
  const commits = await gitlog({
    repo: pwd
  , number: 1000
  , fields: ['hash', 'rawBody']
  , branch: `${flags.from}..${flags.to}`
  , execOptions: {cwd: pwd, maxBuffer: 1000 * 1024}
  })

  log('linting %d commits', commits.length)
  const results = await Promise.all(
    commits.map(async (commit) => {
      const msg = commit.rawBody
      const result = await lint(msg.trim(), rules, opts)
      result.sha = commit.hash
      return result
    })
  )

  return results.reduce((acc, linted) => {
    acc.valid = acc.valid && linted.valid
    acc.total++
    if (linted.valid) acc.passed++
    acc.errors += linted.errors.length
    acc.warnings += linted.warnings.length
    if (linted.errors.length) acc.failed += 1
    acc.results.push(linted)
    return acc
  }, {
    valid: true
  , errors: 0
  , warnings: 0
  , failed: 0
  , total: 0
  , passed: 0
  , results: []
  })
}

// This readjusts the config options for passing directly to
// lint() so the commit parser is configured correctly
function toConfig(loaded) {
  const {rules, ...opts} = loaded
  return {
    parserOpts: opts.parserPreset.parserOpts
  , rules
  , ...opts
  }
}

function buildReport(results) {
  const has_failures = results.errors > 0 || results.warnings > 0

  let report = new MarkdownDocument()
    .$foreach(results.results, (doc, {input, errors, warnings, sha}) => {
      const subject = input.split('\n')[0]
      const commit_sha = sha.substring(0, 7)
      const has_errors = errors.length > 0

      // Commit heading with status indicator (git SHA in blue using LaTeX)
      const status_icon = has_errors ? ':red_circle:' : ':green_circle:'
      const colored_sha = `$\\{\\color{blue}${commit_sha}\\}$`
      let updated = doc.heading(3, `${status_icon} commit (${colored_sha}) ${subject}`)

      // If there are errors or warnings, list them
      const issues = errors.concat(warnings)
      if (issues.length > 0) {
        const list_items = issues
          .filter((issue) => { return !issue.valid })
          .map((issue) => {
            const custom_message = ERROR_MESSAGES[issue.name]
            const explanation = custom_message?.explanation

            const display_message = custom_message
              ? custom_message.message
              /* c8 ignore next */
              : issue.message

            const symbol = issue.level === LEVEL.ERROR
              ? ':heavy_exclamation_mark:'
              /* c8 ignore next */
              : ':warning:'

            // LaTex colorizing
            // see: https://github.com/orgs/community/discussions/31570
            const colored_rule = `$\\{\\color{red}${issue.name}\\}$`
            const item = md`${symbol} ${display_message} &#91; ${colored_rule} &#93;`

            // Add explanation as nested list item if available
            if (explanation) {
              return md`${item}\n  * :information_source: ${explanation}`
            }
            /* c8 ignore next */
            return item
          })

        if (list_items.length > 0) {
          updated = updated.list(list_items)
        }
      }

      return updated
    })

  // Add commit example and help links if there are failures
  if (has_failures) {
    const example = fs.readFileSync(path.join(__dirname, 'commit.txt'), 'utf8')
    report = report
      .rule()
      .heading(3, 'A Conventional Commit')
      .code('txl', example)
      .rule()
      .paragraph(md`**Get help:** ${md.link(HELP_URL, HELP_URL)}`)
      .paragraph(md`**Conventional Commit Specification:** ${md.link(SPEC_URL, SPEC_URL)}`)
  }

  return report.toString()
}

/* c8 ignore start */
function handleCatch(err) {
  process.nextTick(() => {
    throw err
  })
}
/* c8 ignore end */
