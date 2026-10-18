# Multi-stage Dockerfile for Cloud Placement Management REST API Server
FROM node:20-alpine AS base

# Install system dependencies
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Set container environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose API port
EXPOSE 5000

# Run server
CMD ["node", "src/server.js"]
