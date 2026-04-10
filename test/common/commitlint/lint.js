'use strict'

const path = require('path')
const {default: load} = require('@commitlint/load')
const {default: lint} = require('@commitlint/lint')
const CONFIG_PATH = path.join(__dirname, '../../../index.js')
const config = require('./config.js')

module.exports = async function(commit) {
  const {rules, ...opts} = config(await load({'extends': CONFIG_PATH}))
  const report = lint(commit, rules, opts)
  return report
}
