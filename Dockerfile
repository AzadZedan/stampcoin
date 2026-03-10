# StampCoin Backend Dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and patches (needed for pnpm install)
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY patches/ ./patches/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the server and frontend
RUN pnpm run build && pnpm run build:frontend

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]
