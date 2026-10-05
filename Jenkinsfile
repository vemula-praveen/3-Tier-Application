pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'echo "Building Node.js application..."'
            }
        }

        stage('Test') {
            steps {
                sh 'node --check app.js'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t cicd-test-app .'
            }
        }

        stage('Docker Run/Deploy') {
            steps {
                sh 'docker rm -f cicd-test-app-container || true'
                sh 'docker run -d -p 3000:3000 --name cicd-test-app-container cicd-test-app'
            }
        }
    }
}