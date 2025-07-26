#!/bin/bash

# Function to check if FireFly is healthy
check_health() {
    echo "Checking FireFly health..."
    curl -s http://localhost:5000/api/v1/status || exit 1
}

# Function to create organization
create_org() {
    local name=$1
    local description=$2
    local key=$3

    echo "Creating organization: $name"
    curl -X POST http://localhost:5000/api/v1/namespaces/default/organizations \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"description\": \"$description\",
            \"key\": \"$key\",
            \"identity\": {
                \"type\": \"custom\",
                \"custom\": {
                    \"name\": \"$name\",
                    \"registryName\": \"koosi\",
                    \"key\": \"$key\"
                }
            }
        }"
}

case "$1" in
    "start")
        docker-compose up -d
        echo "Waiting for services to start..."
        sleep 30
        check_health
        ;;
    "stop")
        docker-compose down
        ;;
    "restart")
        docker-compose restart
        sleep 30
        check_health
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "create-org")
        if [ "$#" -ne 4 ]; then
            echo "Usage: $0 create-org <name> <description> <key>"
            exit 1
        fi
        create_org "$2" "$3" "$4"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|create-org}"
        exit 1
        ;;
esac
