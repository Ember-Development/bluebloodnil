# Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install all deps (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript / bundler output → dist/
RUN npm run build

# Remove devDependencies to reduce image size (optional but recommended)
RUN npm prune --production

# Expose the port your app listens on
EXPOSE 4000

# Start command – should match your package.json "start"
CMD ["npm", "run", "start"]
