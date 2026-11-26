# Baseline
# Image taken from: https://hub.docker.com/_/node
FROM node:26 

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Document this image exposes port 80,
# Which is Vite preview port
EXPOSE 80

# This command runs whenever the container starts
CMD ["npm", "run", "preview"]
