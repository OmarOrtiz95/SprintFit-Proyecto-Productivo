
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build && npm run seed:compile

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps
# Instalamos prisma CLI y ts-node de forma ligera para poder correr migraciones y seedeo
RUN npm install prisma ts-node --no-save --legacy-peer-deps

# Añadimos los binarios de node_modules al PATH para que Prisma encuentre ts-node
ENV PATH=/app/node_modules/.bin:$PATH

# Copy built application and generated Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 3000

# Run migrations, seed the database, and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && npm run start:prod"]