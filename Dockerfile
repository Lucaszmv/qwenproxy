# Use a official Playwright image that already has all dependencies
FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only dependency files for caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]