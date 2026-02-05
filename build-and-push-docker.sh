#!/usr/bin/env bash
set -e

# Configuration
IMAGE_NAME="shivain22/rms-web-app"
TAG="${1:-latest}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Building RMS Web App Docker Image${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Build arguments
BUILD_ARGS=(
    --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.atparui.com
    --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=rms-demo
    --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rms-demo-web
    --build-arg NEXT_PUBLIC_API_BASE_URL=https://console.atparui.com/services/rms-service/api
    --build-arg NEXT_PUBLIC_APP_KEY=rms-demo
    --build-arg NEXT_PUBLIC_TENANT_ID=rms-demo
)

echo -e "${GREEN}✓${NC} Building image: ${IMAGE_NAME}:${TAG}"
echo ""

# Build the image
docker build \
    "${BUILD_ARGS[@]}" \
    -t "${IMAGE_NAME}:${TAG}" \
    -f Dockerfile \
    .

echo ""
echo -e "${GREEN}✓${NC} Image built successfully"
echo ""

# Push to Docker Hub
echo -e "${BLUE}Pushing image to Docker Hub...${NC}"
docker push "${IMAGE_NAME}:${TAG}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Build and Push Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Image: ${IMAGE_NAME}:${TAG}${NC}"
echo ""
