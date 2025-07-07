# 1) Build stage
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Production stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Optional: copy a custom nginx.conf if you need routing / single-page-app fallback
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
