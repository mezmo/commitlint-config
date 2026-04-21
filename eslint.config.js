'use strict'

const {defineConfig} = require('eslint/config')
const logdna = require('eslint-config-logdna')

module.exports = defineConfig([
  {
    'extends': [logdna]
  , 'files': ['bin/**/*.js', 'lib/**/*.js', 'test/**/*.js', 'index.js', 'scripts/**/*.js']
  , 'ignores': ['.tap/**', './.tap']
  , 'languageOptions': {
      ecmaVersion: 2022
    , sourceType: 'commonjs'
    , globals: {
        fetch: 'readonly'
      }
    }
  , 'rules': {
      'sensible/check-require': [2, 'always', {
        root: __dirname
      }]
    }
  }
])
