#!/bin/sh
set -e

# Start the Ollama server in the background
ollama serve &
SERVER_PID=$!

# Wait a fixed duration for the server to start (adjust if needed)
echo "Waiting for Ollama server to start..."
sleep 10

# Check if the model is already present; if not, pull it
if [ ! -d "/root/.ollama/models/deepseek-r1:14b" ]; then
  echo "Model not found, pulling deepseek-r1:14b..."
  ollama pull deepseek-r1:14b
fi

# Bring the server process to the foreground
wait $SERVER_PID