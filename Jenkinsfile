pipeline {
    agent any

    environment {
        NETWORK = "app-net"

        BACKEND_IMAGE_BLUE = "blue-backend"
        FRONTEND_IMAGE_BLUE = "blue-frontend"

        BACKEND_IMAGE_GREEN = "green-backend"
        FRONTEND_IMAGE_GREEN = "green-frontend"

        ACTIVE_SLOT = "green"   // change to blue for rollback

        BACKEND_CONTAINER = "backend-${ACTIVE_SLOT}"
        FRONTEND_CONTAINER = "frontend-${ACTIVE_SLOT}"

        FRONTEND_PORT = "8090"
        BACKEND_PORT = "3000"
    }

    stages {

        stage('Checkout (Clean Pull)') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/Madhan1417/blue-green.git']],
                    extensions: [[$class: 'CleanBeforeCheckout']]
                ])
            }
        }

        stage('Build Backend') {
            steps {
                sh """
                cd green/backend
                docker build --no-cache -t ${BACKEND_IMAGE_GREEN} .
                """
            }
        }

        stage('Build Frontend') {
            steps {
                sh """
                cd green/frontend
                docker build --no-cache -t ${FRONTEND_IMAGE_GREEN} .
                """
            }
        }

        stage('Create Network') {
            steps {
                sh """
                docker network inspect ${NETWORK} >/dev/null 2>&1 || \
                docker network create ${NETWORK}
                """
            }
        }

        stage('Stop Old Container') {
            steps {
                sh """
                docker rm -f backend-green frontend-green || true
                docker rm -f backend-blue frontend-blue || true
                """
            }
        }

        stage('Deploy GREEN') {
            steps {
                sh """
                docker run -d \
                --name backend-green \
                --network ${NETWORK} \
                -p ${BACKEND_PORT}:3000 \
                ${BACKEND_IMAGE_GREEN}

                docker run -d \
                --name frontend-green \
                --network ${NETWORK} \
                -p ${FRONTEND_PORT}:80 \
                ${FRONTEND_IMAGE_GREEN}
                """
            }
        }

        stage('Health Check') {
            steps {
                sh """
                curl -f http://localhost:3000/api/message
                curl -f http://localhost:8090
                """
            }
        }
    }

    post {
        success {
            echo "🚀 DEPLOYMENT SUCCESSFUL (GREEN ACTIVE)"
        }

        failure {
            echo "❌ DEPLOYMENT FAILED"
        }
    }
}