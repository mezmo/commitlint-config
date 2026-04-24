library 'magic-butler-catalogue'

def PROJECT_NAME = "commitlint-config"
def DEFAULT_BRANCH = 'main'
def TRIGGER_PATTERN = ".*@triggerbuild.*"
def BUILD_SLUG = slugify(env.BUILD_TAG)

def CURRENT_BRANCH = [env.CHANGE_BRANCH, env.BRANCH_NAME]?.find{branch -> branch != null}

pipeline {
  agent {
    node {
      label 'ec2-fleet'
       customWorkspace("/tmp/workspace/${BUILD_SLUG}")
    }
  }

  options {
    timestamps()
    ansiColor 'xterm'
  }

  triggers {
    issueCommentTrigger(TRIGGER_PATTERN)
  }

  tools {
    nodejs 'NodeJS 24'
  }

  stages {
    stage('Setup') {
      steps {
        sh 'npm install'
      }
    }

    stage('Lint') {
      stages{
        stage("CommitLint") {
          steps {
            sh 'npm run commitlint'
          }
        }

        stage("ESLint") {
          steps {
            discoverGitReferenceBuild()
            sh 'npm run lint:ci'
            recordIssues(
              tool: esLint(pattern: '.eslint.json'),
              id: 'eslint',
              name: 'ESLint Analysis',
              sourceDirectories: [[path: "${WORKSPACE}"]],
              checksAnnotationScope: 'ALL',
              minimumSeverity: 'ERROR',
              qualityGates: [[threshold: 1, type: 'TOTAL', criticality: 'FAILURE']],
              stopBuild: true
            )
          }
        }
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
      post {
        always {
          sh 'echo running post-test stage' // makes templating easier
          junit testResults: '.tap/test.xml', allowEmptyResults: true
          publishHTML target: [
            allowMissing: false,
            alwaysLinkToLastBuild: false,
            keepAll: true,
            reportDir: '.tap/report',
            reportFiles: '*.html',
            reportName: "coverage-${BUILD_SLUG}"
          ]
        }
      }
    }

    stage('Release Test') {
      environment {
        GIT_BRANCH = "${CURRENT_BRANCH}"
        BRANCH_NAME = "${CURRENT_BRANCH}"
        CHANGE_ID = ""
      }

      when {
        beforeAgent true
        not {
          branch DEFAULT_BRANCH
        }
      }

      steps {
        sh 'npm install'
        sh "git checkout -b ${BRANCH_NAME}"

        withCredentials([
           string(credentialsId: 'github-api-token', variable: 'GITHUB_TOKEN'),
           string(credentialsId: 'npm-publish-token', variable: 'NPM_TOKEN')
        ]) {
          sh "npm run release:dry"
        }
      }
    }

    stage('Release') {
      when {
        beforeAgent true
        branch DEFAULT_BRANCH
        not {
          changelog '\\[skip ci\\]'
        }
      }

      steps {
        withCredentials([
           string(credentialsId: 'github-api-token', variable: 'GITHUB_TOKEN'),
           string(credentialsId: 'npm-publish-token', variable: 'NPM_TOKEN')
        ]) {
          sh 'npm run release'
        }
      }
    }
  }
}
