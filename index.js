'use strict'

const config = {
  parserPreset: {
    parserOpts: {
      commentChar: '#'
    , breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/
    , headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/
    , headerCorrespondence: ['type', 'scope', 'subject']
    , issuePrefixes: [
      ]
    , referenceActions: [
      ]
    }
  }
, ignores: []
, rules: {}
}

// supports both commonjs + esm loaders
module.exports = config
module.exports.default = config
