'use strict'

module.exports = config

function config(loaded) {
  const {rules, ...opts} = loaded
  return {
    parserOpts: opts.parserPreset.parserOpts
  , rules
  , ...opts
  }
}
