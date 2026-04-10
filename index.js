'use strict'

const config = {
  parserPreset: {
    parserOpts: {
      commentChar: '#'
    , breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/
    , headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/
    , headerCorrespondence: ['type', 'scope', 'subject']
    , issuePrefixes: [
      // Github issues
        '#'
      , 'gh-'

      // Mezmo Jira Issuas
      , 'LOG-'
      , 'PROD-'
      , 'SCT-'
      , 'VM-'
      , 'INFRA-'
      , 'COM-'
      ]
    , referenceActions: [
      // Common Github trailers
        'close'
      , 'closes'
      , 'closed'
      , 'fix'
      , 'fixes'
      , 'fixed'
      , 'resolve'
      , 'resolves'
      , 'resolved'

      // mezmo internal trailers
      , 'ref'
      , 'Ref'
      ]
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
  , 'type-enum': [2, 'always', [
      'build', 'ci', 'chore', 'doc', 'feat', 'fix'
    , 'lib', 'perf', 'refactor', 'style', 'test'
    ]]
  }
}

// supports both commonjs + esm loaders
module.exports = config
module.exports.default = config
