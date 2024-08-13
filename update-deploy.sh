#!/bin/bash

# Ensure you're authenticated with Google Cloud
gcloud auth configure-docker

# Build the new Docker image
docker build -t openfrontio .

# Tag the new image (use a version number or 'latest')
docker tag openfrontio gcr.io/[YOUR-PROJECT-ID]/openfrontio:latest

# Push the new image to Google Container Registry
docker push gcr.io/[YOUR-PROJECT-ID]/openfrontio:latest

# Update the GCE instance with the new container image
gcloud compute instances update-container openfrontio-instance \
  --container-image us-central1-docker.pkg.dev/openfrontio/openfrontio:latest \
  --zone=us-central1-a

echo "Deployment complete. New version should be live soon."