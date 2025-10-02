pipeline {
    agent any

    environment {
        DOTNET_ROOT = '/usr/share/dotnet'
        PATH = "${DOTNET_ROOT}:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Restore') {
            steps {
                sh 'dotnet restore'
            }
        }
        stage('Build') {
            steps {
                sh 'dotnet build --configuration Release'
            }
        }
        stage('Test') {
            steps {
                sh 'dotnet test --no-build --verbosity normal'
            }
            post {
                always {
                    junit '**/TestResults/*.xml'
                }
            }
        }
        stage('Publish') {
            steps {
                sh 'dotnet publish --configuration Release -o ./publish'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying .NET application...'
                // Add deployment steps here
            }
        }
    }

    post {
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}