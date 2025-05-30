# Use Node.js as the base image
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Override homepage for Docker environment
RUN sed -i 's|"homepage": "http://Rookie12910.github.io/Smart_WeatherApp",|"homepage": "/",|g' package.json

# Get build arguments
ARG REACT_APP_weatherApi
ARG REACT_APP_geminiApi

# Make them available as environment variables during build
ENV REACT_APP_weatherApi=${REACT_APP_weatherApi}
ENV REACT_APP_geminiApi=${REACT_APP_geminiApi}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]