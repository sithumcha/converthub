# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package.json if any (not present here, so we will handle client and server separately)
# Actually, since it's a monorepo structure without workspaces, we build them separately.
# This Dockerfile will be for the server.

COPY server/package*.json ./
RUN npm install --production

# Copy server files
COPY server/ .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
