'use strict'

const ISSUE_PREFEXIS = [
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

const REFERENCE_ACTIONS = [
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

const COMMIT_TYPES = [
  'build'
, 'chore'
, 'ci'
, 'doc'
, 'docs'
, 'feat'
, 'fix'
, 'lib'
, 'perf'
, 'pkg'
, 'refactor'
, 'src'
, 'style'
, 'svc'
, 'test'
]

const ERROR_MESSAGES = {
  'body-empty': {
    message: 'commit body must not be empty'
  , explanation: 'Add a detailed description of the changes in the body of the commit'
  }
, 'body-leading-blank': {
    message: 'commit body must have a blank line after the header'
  , explanation: 'Add a blank line between the subject and body content'
  }
, 'body-max-line-length': {
    message: 'commit body line exceeds maximum length of 72 characters'
  , explanation: 'Break long lines and wrap them at 72 characters'
  }
, 'body-min-length': {
    message: 'commit body is too short'
  , explanation: 'Expand the body to provide more context about the changes'
  }
, 'footer-empty': {
    message: 'commit footer must not be empty'
  , explanation: 'Add references, breaking changes, or issue numbers in the footer'
  }
, 'footer-leading-blank': {
    message: 'commit footer must have a blank line before it'
  , explanation: 'Add a blank line between the body and footer content'
  }
, 'footer-max-line-length': {
    message: 'commit footer line exceeds maximum length of 72 characters'
  , explanation: 'Break long lines and wrap them at 72 characters'
  }
, 'header-max-length': {
    message: 'commit header exceeds maximum length of 72 characters'
  , explanation: 'Shorten the commit subject to be under 72 characters'
  }
, 'references-empty': {
    message: 'commit references must not be empty'
  , explanation: 'Add issue references or PR numbers in the footer'
  }
, 'scope-case': {
    message: 'scope must be in lower case'
  , explanation: `
      Use lowercase letters for the scope (e.g., use "auth" instead of "Auth")
    `.trim()
  }
, 'subject-case': {
    message: 'subject must start with sentence case, start case, or lowercase'
  , explanation: 'Start the subject with a capital letter or use all lowercase'
  }
, 'subject-empty': {
    message: 'commit subject must not be empty'
  , explanation: 'Add a brief description of the changes in the subject line'
  }
, 'subject-full-stop': {
    message: 'commit subject must not end with a full stop'
  , explanation: 'Remove the period from the end of the subject line'
  }
, 'type-case': {
    message: 'commit type must be in lower case'
  , explanation: `
      Use lowercase letters for the commit type (e.g., use "feat" instead of "Feat")
    `.trim()
  }
, 'type-empty': {
    message: 'commit type must not be empty'
  , explanation: 'Add a commit type (e.g., feat, fix, docs, style, refactor, test, chore)'
  }
, 'type-enum': {
    message: 'Invalid commit type'
  , explanation: `Use a valid commit type from: ${COMMIT_TYPES.join(', ')}`
  }
}
module.exports = {COMMIT_TYPES, ISSUE_PREFEXIS, ERROR_MESSAGES, REFERENCE_ACTIONS}
