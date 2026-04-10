'use strict'

const {test} = require('tap')
const fixtures = require('../fixtures/commits/index.js')
const {testCommit} = require('../common/bootstrap.js')
test('package', async (t) => {
  t.test('valid commits', async (t) => {
    for (const [name, commit] of Object.entries(fixtures.valid)) {
      testCommit(t, {
        commit
      , description: name.replace(/-/g, ' ')
      , report: {
          valid: true
        , errors: []
        , warnings: []
        }
      }, 'commit passes linting rules')
    }
  })

  t.test('error cases', async (t) => {
    testCommit(t, {
      commit: fixtures.error['deps-breaking']
    , description: 'Breaking changes with deps'
    , report: {
        valid: false
      , errors: [
          {
            level: 2
          , valid: false
          , name: 'references-empty'
          , message: 'references may not be empty'
          }
        ]
      , warnings: []
      }
    })

    testCommit(t, {
      commit: fixtures.error['missing-body']
    , description: 'body-empty'
    , report: {
        valid: false
      , errors: [{
          level: 2
        , valid: false
        , name: 'body-empty'
        , message: 'body may not be empty'
        }]
      , warnings: []
      }
    })

    testCommit(t, {
      commit: fixtures.error['invalid-fixes-ref']
    , description: 'footer-empty'
    , report: {
        valid: false
      , errors: [
          {
            level: 2
          , valid: false
          , name: 'footer-empty'
          , message: 'footer may not be empty'
          }
        , {
            level: 2
          , valid: false
          , name: 'references-empty'
          , message: 'references may not be empty'
          }
        ]
      , warnings: []
      }
    })

    testCommit(t, {
      commit: fixtures.error['missing-issue-ref']
    , description: 'footer with missing issue reference'
    , report: {
        valid: false
      , errors: [
          {
            level: 2
          , valid: false
          , name: 'references-empty'
          , message: 'references may not be empty'
          }
        ]
      , warnings: []
      }
    })

    testCommit(t, {
      commit: fixtures.error['missing-footer']
    , description: 'missing footer'
    , report: {
        valid: false
      , errors: [
          {
            level: 2
          , valid: false
          , name: 'footer-empty'
          , message: 'footer may not be empty'
          }
        , {
            level: 2
          , valid: false
          , name: 'references-empty'
          , message: 'references may not be empty'
          }
        ]
      , warnings: []
      }
    })
  })
})

