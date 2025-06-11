pipeline {
    agent any
    
    environment {
        APP_NAME = 'klowdi'
        AWS_REGION = 'us-east-2'
        AWS_ACCOUNT_ID = '470699573094'
        ECR_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"
        ECS_CLUSTER = 'klowdi-cluster'
        ECS_SERVICE = 'klowdi-service'
    }
    
    stages {
        stage('🔍 Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('🏗️ Build React App') {
            steps {
                echo 'Installing dependencies and building React app...'
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        
        stage('🐳 Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image for AMD64 platform...'
                    sh "docker buildx build --platform linux/amd64 -t ${ECR_REPO}:${BUILD_NUMBER} ."
                    sh "docker tag ${ECR_REPO}:${BUILD_NUMBER} ${ECR_REPO}:latest"
                }
            }
        }
        
        stage('🔐 Login to ECR') {
            steps {
                echo 'Logging into AWS ECR...'
                sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO}
                '''
            }
        }
        
        stage('📤 Push to ECR') {
            steps {
                echo 'Pushing Docker images to ECR...'
                sh "docker push ${ECR_REPO}:${BUILD_NUMBER}"
                sh "docker push ${ECR_REPO}:latest"
            }
        }
        
        stage('🚀 Deploy to ECS') {
            steps {
                echo 'Deploying to AWS ECS...'
                sh '''
                    aws ecs update-service \
                        --cluster ${ECS_CLUSTER} \
                        --service ${ECS_SERVICE} \
                        --force-new-deployment \
                        --region ${AWS_REGION}
                '''
            }
        }
        
        stage('✅ Verify Deployment') {
            steps {
                echo 'Waiting for deployment to complete...'
                sh '''
                    aws ecs wait services-stable \
                        --cluster ${ECS_CLUSTER} \
                        --services ${ECS_SERVICE} \
                        --region ${AWS_REGION}
                    
                    echo "✅ Deployment completed successfully!"
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up Docker images...'
            sh 'docker system prune -f || true'
        }
        success {
            echo '🎉 Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs for details.'
        }
    }
} 