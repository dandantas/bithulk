FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose application port
EXPOSE 3000

# Set environment variables for development
ENV NODE_ENV=development

# Command will be overridden by docker-compose
CMD ["pnpm", "run", "dev"] 