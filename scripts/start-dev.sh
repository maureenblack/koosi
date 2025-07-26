#!/bin/bash

# Create FireFly database if it doesn't exist
createdb -U postgres firefly 2>/dev/null || true

# Start local blockchain
echo "Starting local blockchain..."
node scripts/start-blockchain.js &
BLOCKCHAIN_PID=$!

# Wait for blockchain to start
sleep 5

# Deploy contracts
echo "Deploying smart contracts..."
cd contracts/ethereum
npx hardhat run scripts/deploy.ts --network localhost
cd ../..

# Start FireFly
echo "Starting FireFly..."
cd firefly
go run cmd/firefly/main.go -f config/firefly.dev.yml &
FIREFLY_PID=$!

# Function to handle script termination
cleanup() {
    echo "Shutting down services..."
    kill $BLOCKCHAIN_PID
    kill $FIREFLY_PID
    exit 0
}

# Register the cleanup function
trap cleanup SIGINT SIGTERM

# Keep script running
wait
