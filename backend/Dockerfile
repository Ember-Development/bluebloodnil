# Use Node 20 (change if your project uses a specific version)
FROM node:20-alpine

# Set app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use pnpm/yarn if that’s what you’re using)
RUN npm ci --omit=dev

# Copy the rest of the backend source
COPY . .

# If you build TypeScript, uncomment:
# RUN npm run build

# Expose the port your app listens on
EXPOSE 3000

# Start the app (change to your real start command)
CMD ["npm", "start"]
