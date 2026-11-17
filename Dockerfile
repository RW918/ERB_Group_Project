# Single stage on purpose: `migrate`/`seed` load TypeScript through `tsx`,
# which is a dev dependency, so pruning dev deps would break the boot command.
# PORT defaults to 7860, the port Hugging Face Spaces expects.

FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7860

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 7860

# Idempotent: migrate is a no-op once applied, seeds skip existing rows.
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
