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
  })
})

