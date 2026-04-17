pipeline {
    agent any

    environment {
        NETWORK = "app-net"
        BACKEND_IMAGE = "green-backend"
        FRONTEND_IMAGE = "green-frontend"
        BACKEND_CONTAINER = "green-backend"
        FRONTEND_CONTAINER = "green-frontend"
        FRONTEND_PORT = "8090"
        BACKEND_PORT = "3000"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh """
                cd green/backend
                docker build --no-cache -t ${BACKEND_IMAGE} .
                """
            }
        }

        stage('Build Frontend') {
            steps {
                sh """
                cd green/frontend
                docker build --no-cache -t ${FRONTEND_IMAGE} .
                """
            }
        }

        stage('Network Setup') {
            steps {
                sh """
                docker network inspect ${NETWORK} >/dev/null 2>&1 || \
                docker network create ${NETWORK}
                """
            }
        }

        stage('Cleanup Containers') {
            steps {
                sh """
                docker rm -f ${BACKEND_CONTAINER} || true
                docker rm -f ${FRONTEND_CONTAINER} || true
                """
            }
        }

        stage('Run Backend') {
            steps {
                sh """
                docker run -d \
                --name ${BACKEND_CONTAINER} \
                --network ${NETWORK} \
                -p ${BACKEND_PORT}:3000 \
                ${BACKEND_IMAGE}
                """
            }
        }

        stage('Run Frontend') {
            steps {
                sh """
                docker run -d \
                --name ${FRONTEND_CONTAINER} \
                --network ${NETWORK} \
                -p ${FRONTEND_PORT}:80 \
                ${FRONTEND_IMAGE}
                """
            }
        }
    }
}