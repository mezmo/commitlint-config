library 'magic-butler-catalogue'

def PROJECT_NAME = "commitlint-config"
def DEFAULT_BRANCH = 'main'
def TRIGGER_PATTERN = ".*@logdnabot.*"
def BUILD_SLUG = slugify(env.BUILD_TAG)

def GIT_BRANCH = [env.CHANGE_BRANCH, env.BRANCH_NAME]?.find{branch -> branch != null}

def NPMRC = [
    configFile(fileId: 'npmrc', variable: 'NPM_CONFIG_USERCONFIG')
]

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
        configFileProvider(NPMRC) {
          sh 'npm install'
        }
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
  }
}
