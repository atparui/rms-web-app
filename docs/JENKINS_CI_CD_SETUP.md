# Jenkins CI/CD Setup for RMS Web App

## Overview

This document describes the Jenkins CI/CD pipeline configuration for the RMS Web App, which automatically builds, pushes, and deploys the application whenever changes are pushed to the repository.

## Jenkinsfile Configuration

The Jenkinsfile is located at the root of the repository and defines a four-stage pipeline:

### 1. Checkout Stage
- Checks out the source code from the Git repository
- Uses the built-in `checkout scm` command

### 2. Build Docker Image Stage
- Builds the Docker image using the Dockerfile
- Tags the image with both the build number and `latest` tag
- Uses BuildKit inline cache for optimization
- Image name: `shivain22/rms-web-app`

### 3. Push to Registry Stage
- Logs into Docker Hub registry
- Pushes both tagged images (build number and latest)
- Logs out after pushing for security

### 4. Deploy to Platform Stage
- Stops the existing rms-web service on the platform
- Deploys the updated image using platform scripts
- Uses environment variable overrides to specify the image

## Environment Variables

The pipeline uses the following environment variables:

```groovy
DOCKER_REGISTRY = 'docker.io'
DOCKER_IMAGE = 'shivain22/rms-web-app'
DOCKER_USERNAME = 'shivain22'
DOCKER_PASSWORD = 'Asd!@#123'  // TODO: Move to Jenkins credentials
```

**Security Note**: The Docker password should be moved to Jenkins credentials instead of being hardcoded.

## Deployment Configuration

### Platform Service Name
- Service name in docker-compose: `rms-web`
- Container name: `platform-rms-web`

### Image Override Variables
When deploying to the platform, the pipeline uses these environment variables:
- `RMS_WEB_IMAGE_OVERRIDE`: Specifies the Docker image to use
- `RMS_WEB_IMAGE_TAG_OVERRIDE`: Specifies the image tag (set to `latest`)

### Deployment Commands

```bash
# Stop existing service
cd /platform && ./scripts/down.sh dev rms-web

# Start service with new image
cd /platform && \
RMS_WEB_IMAGE_OVERRIDE=shivain22/rms-web-app \
RMS_WEB_IMAGE_TAG_OVERRIDE=latest \
./scripts/up.sh dev rms-web
```

## Post-Build Actions

### Always Executed
- Removes the build-specific Docker image to save disk space
- Prunes unused Docker images

### On Success
- Logs success message with ✅ emoji

### On Failure
- Logs failure message with ❌ emoji

## Manual Build Script

For manual builds and pushes, use the `build-and-push-docker.sh` script:

```bash
# Build and push with 'latest' tag
./build-and-push-docker.sh

# Build and push with custom tag
./build-and-push-docker.sh v1.0.0
```

## Pipeline Workflow

```
Push to Git → Jenkins Detects Change → Build Image → Push to Registry → Deploy to Platform
```

## Prerequisites

1. **Jenkins Server**: Jenkins must be installed and configured
2. **Docker**: Docker must be available on the Jenkins agent
3. **Platform Access**: Jenkins must have access to `/platform` directory and scripts
4. **Docker Hub**: Credentials for pushing to `shivain22/rms-web-app` repository
5. **Git Access**: Jenkins must have access to the Git repository

## Comparison with Tenant Manager Web App

This setup is similar to the tenant-manager-web-app pipeline with the following differences:

| Aspect | RMS Web App | Tenant Manager Web App |
|--------|-------------|------------------------|
| Docker Image | `shivain22/rms-web-app` | `shivain22/tenant-manager-web-app` |
| Service Name | `rms-web` | `tenant-manager-web` |
| Image Override Vars | `RMS_WEB_IMAGE_OVERRIDE`, `RMS_WEB_IMAGE_TAG_OVERRIDE` | `TENANT_MANAGER_WEB_IMAGE_OVERRIDE`, `TENANT_MANAGER_WEB_IMAGE_TAG_OVERRIDE` |

## Troubleshooting

### Build Fails
- Check Docker daemon is running on Jenkins agent
- Verify Dockerfile is present in repository root
- Check build logs for dependency issues

### Push Fails
- Verify Docker Hub credentials are correct
- Check network connectivity to docker.io
- Ensure repository `shivain22/rms-web-app` exists and is accessible

### Deployment Fails
- Verify `/platform` directory exists and scripts are executable
- Check if platform services are running
- Review platform deployment logs: `cd /platform && docker-compose logs rms-web`

## Security Recommendations

1. **Move Credentials to Jenkins**: Store Docker password in Jenkins credentials store
2. **Use Secrets Manager**: Consider using external secrets manager for sensitive data
3. **Rotate Credentials**: Regularly rotate Docker Hub and other credentials
4. **Limit Access**: Restrict Jenkins job permissions to authorized users only

## Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Current Status](./CURRENT_STATUS.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Docker Build Instructions](../Dockerfile)
