pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'shivain22/rms-web-app'
        DOCKER_USERNAME = 'shivain22'
        DOCKER_PASSWORD = 'Asd!@#123'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo '🐋 Building Docker image...'
                    sh """
                        docker build \
                            --tag ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                            --tag ${DOCKER_IMAGE}:latest \
                            --build-arg BUILDKIT_INLINE_CACHE=1 \
                            .
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    echo '📤 Pushing Docker image to registry...'
                    sh """
                        echo ${DOCKER_PASSWORD} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USERNAME} --password-stdin
                        docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE}:latest
                        docker logout ${DOCKER_REGISTRY}
                    """
                }
            }
        }
        
        stage('Deploy to Platform') {
            steps {
                script {
                    echo '🚀 Deploying rms-web-app to platform...'
                    sh 'cd /platform && ./scripts/down.sh dev rms-web'
                    sh """
                        cd /platform && \
                        RMS_WEB_IMAGE_OVERRIDE=${DOCKER_IMAGE} \
                        RMS_WEB_IMAGE_TAG_OVERRIDE=latest \
                        ./scripts/up.sh dev rms-web
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo '🧹 Cleaning up Docker images...'
                sh """
                    docker rmi ${DOCKER_IMAGE}:${BUILD_NUMBER} || true
                    docker image prune -f || true
                """
            }
        }
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
