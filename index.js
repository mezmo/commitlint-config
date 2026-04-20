'use strict'

const {ISSUE_PREFEXIS, REFERENCE_ACTIONS, COMMIT_TYPES} = require('./lib/constants.js')

const config = {
  parserPreset: {
    parserOpts: {
      commentChar: '#'
    , breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/
    , headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/
    , headerCorrespondence: ['type', 'scope', 'subject']
    , issuePrefixes: ISSUE_PREFEXIS
    , referenceActions: REFERENCE_ACTIONS
    }
  }
, ignores: require('./lib/ignores/index.js')
, rules: {
    'body-empty': [2, 'never']
  , 'body-leading-blank': [2, 'always']
  , 'body-max-line-length': [2, 'always', 72]
  , 'body-min-length': [2, 'always', 20]
  , 'footer-empty': [2, 'never']
  , 'footer-leading-blank': [1, 'always']
  , 'footer-max-line-length': [2, 'always', 72]
  , 'header-max-length': [2, 'always', 72]
  , 'references-empty': [2, 'never']
  , 'scope-case': [2, 'always', 'lower-case']
  , 'subject-case': [2, 'always', [
      'sentence-case'
    , 'start-case'
    , 'lower-case'
    ]]
  , 'subject-empty': [2, 'never']
  , 'subject-full-stop': [2, 'never', '.']
  , 'type-case': [2, 'always', 'lower-case']
  , 'type-empty': [2, 'never']
  , 'type-enum': [2, 'always', COMMIT_TYPES]
  }
}

// supports both commonjs + esm loaders
module.exports = config
module.exports.default = config
