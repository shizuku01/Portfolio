# =============================================================================
# LATTE'S PORTFOLIO - SIMPLIFIED DOCKERFILE
# =============================================================================
# This Dockerfile creates a single container that serves both the React frontend
# and Express backend together

# Use Node.js 18 Alpine Linux as the base image
# Alpine is lightweight and perfect for production deployments
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# =============================================================================
# DEPENDENCY INSTALLATION
# =============================================================================

# Copy package.json and package-lock.json (if exists) first
# This allows Docker to cache the dependency installation step
# If only source code changes, dependencies won't be reinstalled
COPY package*.json ./

# Install all dependencies (both frontend and backend)
# --only=production flag would skip devDependencies, but we need them for building
RUN npm install

# =============================================================================
# SOURCE CODE COPYING
# =============================================================================

# Copy all source code into the container
# This includes both frontend React code and backend Express code
COPY . .

# =============================================================================
# REACT BUILD PROCESS
# =============================================================================

# Build the React frontend for production
# This creates optimized, minified files in the 'build' directory.
# GENERATE_SOURCEMAP=false cuts build memory and time significantly — important
# on small (e.g. 2 GB) servers where the build can otherwise be OOM-killed.
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# =============================================================================
# SECURITY & OPTIMIZATION
# =============================================================================

# Create a non-root user for security
# Running containers as root is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# =============================================================================
# EXPOSURE & STARTUP
# =============================================================================

# Expose port 3000 to the outside world
# This is the port the Express server will listen on
EXPOSE 3000

# Set environment variables
# NODE_ENV=production optimizes Node.js for production use
ENV NODE_ENV=production

# Health check to ensure the container is running properly
# Checks if the server is responding on port 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
# This runs the combined Express server that serves both API and React frontend
CMD ["node", "server.js"]

