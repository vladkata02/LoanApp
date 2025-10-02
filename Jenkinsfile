pipeline {
    agent any

    environment {
        // Docker settings
        DOCKER_REGISTRY = 'docker.io'  // Change to your registry (docker.io, your-registry.com, etc.)
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT[0..7]}"
        
        // Application secrets
        DB_SA_PASSWORD = credentials('loanapp-db-password')
        JWT_SECRET = credentials('loanapp-jwt-secret')
        ADMIN_PASSWORD = credentials('loanapp-admin-password')
        
        // URLs - Update these to your actual domains
        API_URL = "${env.BRANCH_NAME == 'master' ? 'https://api.yourdomain.com' : 'http://localhost:8080'}"
        FRONTEND_URL = "${env.BRANCH_NAME == 'master' ? 'https://yourdomain.com' : 'http://localhost:8081'}"
        
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
                    // Create environment file for Docker Compose with proper encoding
                    bat """
                        echo DB_SA_PASSWORD=${DB_SA_PASSWORD} > .env
                        echo JWT_SECRET=${JWT_SECRET} >> .env
                        echo ADMIN_PASSWORD=${ADMIN_PASSWORD} >> .env
                        echo API_URL=${API_URL} >> .env
                        echo FRONTEND_URL=${FRONTEND_URL} >> .env
                        echo COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME} >> .env
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
                bat 'docker-compose up -d database'
                
                echo 'Waiting for database to be ready...'
                script {
                    timeout(time: 3, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                def result = bat(script: 'docker-compose exec -T database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P %DB_SA_PASSWORD% -Q "SELECT 1" -b', returnStatus: true)
                                return result == 0
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
                    // Run migrations using a temporary container
                    bat """
                        docker run --rm --network=${COMPOSE_PROJECT_NAME}_loanapp-network ^
                            -e ConnectionStrings__DefaultConnection="Server=database,1433;Database=LoanAppDb;User Id=sa;Password=${DB_SA_PASSWORD};TrustServerCertificate=True" ^
                            -v "%cd%:/src" ^
                            mcr.microsoft.com/dotnet/sdk:9.0 ^
                            powershell -c "cd /src; dotnet ef database update --project LoanApp.Infrastructure --startup-project LoanApp.Api --verbose"
                    """
                }
            }
        }

        stage('Start Backend') {
            steps {
                echo 'Starting backend API...'
                bat 'docker-compose up -d api'
                
                echo 'Waiting for API to be ready...'
                script {
                    timeout(time: 3, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                def result = bat(script: 'curl -f http://localhost:8080/api/health', returnStatus: true)
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
                bat 'docker-compose up -d web'
                
                echo 'Waiting for frontend to be ready...'
                script {
                    timeout(time: 2, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                def result = bat(script: 'curl -f http://localhost:8081/health', returnStatus: true)
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
                        bat """
                            docker run --rm --network=${COMPOSE_PROJECT_NAME}_loanapp-network ^
                                -e API_BASE_URL=http://api:8080 ^
                                -v "%cd%:/tests" ^
                                mcr.microsoft.com/dotnet/sdk:9.0 ^
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
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo 'Deploying to production environment...'
                script {
                    // Create production docker-compose file from template
                    bat """
                        copy docker-compose.prod.template docker-compose.prod.yml
                        powershell -Command "(Get-Content docker-compose.prod.yml) -replace 'DOCKER_REGISTRY_PLACEHOLDER', '${DOCKER_REGISTRY}' | Set-Content docker-compose.prod.yml"
                        powershell -Command "(Get-Content docker-compose.prod.yml) -replace 'IMAGE_TAG_PLACEHOLDER', '${IMAGE_TAG}' | Set-Content docker-compose.prod.yml"
                    """

                    // Deploy using docker-compose
                    bat """
                        docker-compose -f docker-compose.prod.yml --env-file .env pull
                        docker-compose -f docker-compose.prod.yml --env-file .env up -d --remove-orphans
                    """
                }
            }
        }

        stage('Production Health Check') {
            when {
                anyOf {
                    branch 'main'
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
                                def apiHealth = bat(script: 'curl -f http://localhost:8080/api/health', returnStatus: true)
                                def webHealth = bat(script: 'curl -f http://localhost:8081/health', returnStatus: true)
                                return apiHealth == 0 && webHealth == 0
                            }
                        }
                    }
                    
                    echo '✅ All services are healthy!'
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
                        bat 'docker-compose down'
                    } catch (Exception e) {
                        echo "Error stopping containers: ${e.getMessage()}"
                    }
                }
            }
            
            // Clean up temporary files
            script {
                if (fileExists('.env')) {
                    bat 'del .env'
                }
                if (fileExists('docker-compose.prod.yml')) {
                    bat 'del docker-compose.prod.yml'
                }
            }
            
            // Clean up unused Docker images (keep last 5 builds)
            script {
                try {
                    bat 'docker image prune -f'
                    bat 'docker system prune -f --volumes'
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