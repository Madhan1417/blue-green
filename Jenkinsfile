pipeline {
    agent any

    environment {
        NETWORK = "app-net"

        BACKEND_IMAGE = "green-backend"
        FRONTEND_IMAGE = "green-frontend"

        BACKEND_CONTAINER = "backend-green"
        FRONTEND_CONTAINER = "frontend-green"

        FRONTEND_PORT = "8090"
        BACKEND_PORT = "3000"
    }

    stages {

        /* =========================
           1. FRESH CODE ALWAYS
        ========================= */
        stage('Checkout Fresh Code') {
            steps {
                deleteDir()

                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/Madhan1417/blue-green.git']],
                    extensions: [[$class: 'CleanBeforeCheckout']]
                ])

                sh """
                echo "📌 Latest commit:"
                git log -1 --oneline
                """
            }
        }

        /* =========================
           2. BUILD BACKEND
        ========================= */
        stage('Build Backend') {
            steps {
                sh """
                cd green/backend
                docker build --no-cache -t ${BACKEND_IMAGE} .
                """
            }
        }

        /* =========================
           3. BUILD FRONTEND
        ========================= */
        stage('Build Frontend') {
            steps {
                sh """
                cd green/frontend
                docker build --no-cache -t ${FRONTEND_IMAGE} .
                """
            }
        }

        /* =========================
           4. NETWORK SETUP
        ========================= */
        stage('Network Setup') {
            steps {
                sh """
                docker network inspect ${NETWORK} >/dev/null 2>&1 || \
                docker network create ${NETWORK}
                """
            }
        }

        /* =========================
           5. SAFE CLEANUP (IMPORTANT FIX)
        ========================= */
        stage('Full Safe Cleanup') {
            steps {
                sh """
                echo "🧹 Stopping all old containers..."

                docker stop ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER} || true
                docker rm -f ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER} || true

                echo "🧹 Freeing ports (important fix)..."

                docker ps -q --filter publish=${BACKEND_PORT} | xargs -r docker stop
                docker ps -aq --filter publish=${BACKEND_PORT} | xargs -r docker rm -f

                docker ps -q --filter publish=${FRONTEND_PORT} | xargs -r docker stop
                docker ps -aq --filter publish=${FRONTEND_PORT} | xargs -r docker rm -f

                echo "✅ Cleanup completed"
                """
            }
        }

        /* =========================
           6. RUN BACKEND
        ========================= */
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

        /* =========================
           7. RUN FRONTEND
        ========================= */
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

        /* =========================
           8. HEALTH CHECK
        ========================= */
        stage('Health Check') {
            steps {
                sh """
                echo "Checking backend..."
                curl -f http://localhost:${BACKEND_PORT}/api/message

                echo "Checking frontend..."
                curl -f http://localhost:${FRONTEND_PORT}

                echo "✅ Deployment healthy"
                """
            }
        }
    }

    post {
        success {
            echo "🚀 DEPLOYMENT SUCCESSFUL"
            echo "Frontend: http://<EC2-IP>:8090"
            echo "Backend: http://<EC2-IP>:3000/api/message"
        }

        failure {
            echo "❌ DEPLOYMENT FAILED"
        }
    }
}