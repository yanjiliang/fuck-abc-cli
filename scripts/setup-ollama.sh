#!/bin/bash

# Script to setup Ollama and pull the required model

echo "🚀 Setting up Ollama for English Optimizer CLI..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start Ollama container
echo "📦 Starting Ollama container..."
docker-compose up -d

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to start..."
sleep 10

# Pull the model
echo "📥 Pulling Llama 3.2 (3B) model..."
docker exec -it english-optimizer-ollama ollama pull llama3.2:3b

echo "✅ Setup complete! You can now use 'english-opt' command."
echo ""
echo "To stop Ollama, run: docker-compose down"
echo "To start Ollama, run: docker-compose up -d"
