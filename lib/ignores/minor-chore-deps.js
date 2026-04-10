'use strict'

const DEP_TITLE_REGEX = /^chore\(dep(?:s)?(?:-dev)?\):/
const BREAKING_REGEX = /BREAKING CHANGE:/g

module.exports = ignoreMinorDeps

function ignoreMinorDeps(commit) {
  const [header] = commit.split('\n')
  const title_match = DEP_TITLE_REGEX.test(header)
  const is_breaking = BREAKING_REGEX.test(commit)

  return title_match && !is_breaking
}
