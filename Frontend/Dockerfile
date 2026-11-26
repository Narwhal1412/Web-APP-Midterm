# Baseline
# Image taken from: https://hub.docker.com/_/node
FROM node:26 

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Document this image exposes port 4173,
# Which is Vite preview port
EXPOSE 4173

# This command runs whenever the container starts
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0" , "--port", "4173"]
