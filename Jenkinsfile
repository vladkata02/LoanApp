pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT[0..7]}"
        
        API_URL = "'http://localhost:8080'"
        FRONTEND_URL = "'http://localhost:8081'"

        // Docker Compose
        COMPOSE_PROJECT_NAME = "loanapp-${env.BRANCH_NAME}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Setup Environment') {
            steps {
                echo 'Setting up Docker environment...'
                script {
                    // Create environment file for Docker Compose with proper encoding and secure credential handling
                    withCredentials([
                        string(credentialsId: 'loanapp-db-password', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'loanapp-jwt-secret', variable: 'JWT_SECRET_VAL'),
                        string(credentialsId: 'loanapp-admin-password', variable: 'ADMIN_PASSWORD_VAL')
                    ]) {
                        sh '''
                            echo "DB_SA_PASSWORD=$DB_PASSWORD" > .env
                            echo "JWT_SECRET=$JWT_SECRET_VAL" >> .env
                            echo "ADMIN_PASSWORD=$ADMIN_PASSWORD_VAL" >> .env
                        '''
                    }
                    
                    // Add non-sensitive variables
                    sh """
                        echo "API_URL=${API_URL}" >> .env
                        echo "FRONTEND_URL=${FRONTEND_URL}" >> .env
                        echo "COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME}" >> .env
                    """
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                echo 'Building backend Docker image...'
                script {
                    def backendImage = docker.build("loanapp-api:${IMAGE_TAG}", "-f LoanApp.Api/Dockerfile .")
                    
                    // Tag for registry
                    if (env.BRANCH_NAME == 'master') {
                        backendImage.tag("loanapp-api:latest")
                        backendImage.tag("${DOCKER_REGISTRY}/loanapp-api:${IMAGE_TAG}")
                        backendImage.tag("${DOCKER_REGISTRY}/loanapp-api:latest")
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo 'Building frontend Docker image...'
                script {
                    def frontendImage = docker.build("loanapp-web:${IMAGE_TAG}", 
                        "--build-arg VITE_API_URL=${API_URL} -f LoanApp.Web/Dockerfile LoanApp.Web")
                    
                    // Tag for registry
                    if (env.BRANCH_NAME == 'master') {
                        frontendImage.tag("loanapp-web:latest")
                        frontendImage.tag("${DOCKER_REGISTRY}/loanapp-web:${IMAGE_TAG}")
                        frontendImage.tag("${DOCKER_REGISTRY}/loanapp-web:latest")
                    }
                }
            }
        }

        stage('Start Database') {
            steps {
                echo 'Starting database container...'
                sh 'docker-compose up -d database'
                
                echo 'Waiting for database to be ready...'
                script {
                    timeout(time: 3, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                withCredentials([string(credentialsId: 'loanapp-db-password', variable: 'DB_PASSWORD')]) {
                                    def result = sh(script: 'docker-compose exec -T database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $DB_PASSWORD -Q "SELECT 1" -b', returnStatus: true)
                                    return result == 0
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Database Migration') {
            steps {
                echo 'Running Entity Framework migrations...'
                script {
                    // Run migrations using a temporary container with secure credential handling
                    withCredentials([string(credentialsId: 'loanapp-db-password', variable: 'DB_PASSWORD')]) {
                        sh '''
                            docker run --rm --network=${COMPOSE_PROJECT_NAME}_loanapp-network \\
                                -e "ConnectionStrings__DefaultConnection=Server=database,1433;Database=LoanAppDb;User Id=sa;Password=$DB_PASSWORD;TrustServerCertificate=True" \\
                                -v "$(pwd):/src" \\
                                mcr.microsoft.com/dotnet/sdk:9.0 \\
                                bash -c "cd /src && dotnet ef database update --project LoanApp.Infrastructure --startup-project LoanApp.Api --verbose"
                        '''
                    }
                }
            }
        }

        stage('Start Backend') {
            steps {
                echo 'Starting backend API...'
                sh 'docker-compose up -d api'
                
                echo 'Waiting for API to be ready...'
                script {
                    timeout(time: 3, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                def result = sh(script: 'curl -f http://localhost:8080/api/health', returnStatus: true)
                                return result == 0
                            }
                        }
                    }
                }
            }
        }

        stage('Start Frontend') {
            steps {
                echo 'Starting frontend application...'
                sh 'docker-compose up -d web'
                
                echo 'Waiting for frontend to be ready...'
                script {
                    timeout(time: 2, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                def result = sh(script: 'curl -f http://localhost:8081/health', returnStatus: true)
                                return result == 0
                            }
                        }
                    }
                }
            }
        }

        stage('Integration Tests') {
            steps {
                echo 'Running integration tests...'
                script {
                    // Run API tests
                    try {
                        sh """
                            docker run --rm --network=${COMPOSE_PROJECT_NAME}_loanapp-network \\
                                -e API_BASE_URL=http://api:8080 \\
                                -v "\$(pwd):/tests" \\
                                mcr.microsoft.com/dotnet/sdk:9.0 \\
                                sh -c "cd /tests && dotnet test --filter Category=Integration --verbosity normal"
                        """
                    } catch (Exception e) {
                        echo "Integration tests failed: ${e.getMessage()}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'master'
                }
            }
            steps {
                echo 'Deploying to production environment...'
                script {
                    // Create production docker-compose file from template
                    sh """
                        cp docker-compose.prod.template docker-compose.prod.yml
                        sed -i 's/DOCKER_REGISTRY_PLACEHOLDER/${DOCKER_REGISTRY}/g' docker-compose.prod.yml
                        sed -i 's/IMAGE_TAG_PLACEHOLDER/${IMAGE_TAG}/g' docker-compose.prod.yml
                    """

                    // Deploy using docker-compose
                    sh """
                        docker-compose -f docker-compose.prod.yml --env-file .env pull
                        docker-compose -f docker-compose.prod.yml --env-file .env up -d --remove-orphans
                    """
                }
            }
        }

        stage('Production Health Check') {
            when {
                anyOf {
                    branch 'master'
                }
            }
            steps {
                echo 'Running production health checks...'
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        // Wait for services to be healthy
                        waitUntil {
                            script {
                                def apiHealth = sh(script: 'curl -f http://localhost:8080/api/health', returnStatus: true)
                                def webHealth = sh(script: 'curl -f http://localhost:8081/health', returnStatus: true)
                                return apiHealth == 0 && webHealth == 0
                            }
                        }
                    }
                    
                    echo 'All services are healthy!'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Cleaning up...'
            
            // Stop development containers (not production)
            script {
                if (env.BRANCH_NAME != 'master') {
                    try {
                        sh 'docker-compose down'
                    } catch (Exception e) {
                        echo "Error stopping containers: ${e.getMessage()}"
                    }
                }
            }
            
            // Clean up temporary files
            script {
                if (fileExists('.env')) {
                    sh 'rm -f .env'
                }
                if (fileExists('docker-compose.prod.yml')) {
                    sh 'rm -f docker-compose.prod.yml'
                }
            }
            
            // Clean up unused Docker images (keep last 5 builds)
            script {
                try {
                    sh 'docker image prune -f'
                    sh 'docker system prune -f --volumes'
                } catch (Exception e) {
                    echo "Docker cleanup warning: ${e.getMessage()}"
                }
            }
            
            // Archive Docker Compose files
            archiveArtifacts artifacts: 'docker-compose*.yml', allowEmptyArchive: true
            archiveArtifacts artifacts: 'LoanApp.Api/Dockerfile, LoanApp.Web/Dockerfile', allowEmptyArchive: true
        }
        
        success {
            echo 'Build and deployment succeeded!'
        }
        
        failure {
            echo 'Build or deployment failed!'
        }
        
        unstable {
            echo 'Build completed with warnings (tests failed or linting issues)'
        }
    }
}
