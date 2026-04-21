'use strict'

const SNYK_COMMIT_REGEX = /^snyk has created this pr to upgrade/i

module.exports = ignoreSnyk

function ignoreSnyk(commit) {
  for (const bit of commit.split('\n')) {
    if (SNYK_COMMIT_REGEX.test(bit)) return true
  }

  return false
}
