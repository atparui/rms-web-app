# Jenkins Integration Summary

## Overview

This document summarizes the Jenkins CI/CD integration added to the RMS Web App project, enabling automatic builds and deployments when code is pushed to the repository.

## Changes Made

### 1. Created Jenkinsfile (`/Jenkinsfile`)

A complete CI/CD pipeline configuration that includes four stages:

1. **Checkout**: Pulls source code from Git
2. **Build Docker Image**: Builds the Docker image with build number and latest tags
3. **Push to Registry**: Pushes images to Docker Hub
4. **Deploy to Platform**: Deploys the updated image to the platform

### 2. Updated Platform Scripts (`/platform/scripts/up.sh`)

Added support for RMS Web App image overrides to enable dynamic deployments:

```bash
# Optional overrides for rms-web deploys
if [ -n "$RMS_WEB_IMAGE_OVERRIDE" ]; then
    export RMS_WEB_IMAGE="$RMS_WEB_IMAGE_OVERRIDE"
fi

if [ -n "$RMS_WEB_IMAGE_TAG_OVERRIDE" ]; then
    export RMS_WEB_IMAGE_TAG="$RMS_WEB_IMAGE_TAG_OVERRIDE"
fi
```

### 3. Created Documentation

- **JENKINS_CI_CD_SETUP.md**: Comprehensive guide covering pipeline configuration, environment variables, deployment process, and troubleshooting
- **JENKINS_INTEGRATION_SUMMARY.md** (this file): Overview of changes made

## How It Works

### Build Trigger
When code is pushed to the repository, Jenkins automatically:

1. Detects the change (via webhook or polling)
2. Checks out the code
3. Builds a new Docker image
4. Pushes the image to Docker Hub
5. Deploys the updated image to the platform

### Docker Image Tagging
Each build creates two tags:
- `shivain22/rms-web-app:${BUILD_NUMBER}` - Specific build version
- `shivain22/rms-web-app:latest` - Always points to the most recent build

### Platform Deployment
The deployment uses environment variable overrides to specify which image to deploy:

```bash
RMS_WEB_IMAGE_OVERRIDE=shivain22/rms-web-app \
RMS_WEB_IMAGE_TAG_OVERRIDE=latest \
./scripts/up.sh dev rms-web
```

## Service Configuration

### Docker Compose Service Name
- **Service Name**: `rms-web`
- **Container Name**: `platform-rms-web`

### Image Configuration
- **Default Image**: `docker.io/shivain22/rms-web-app:latest`
- **Override Variables**:
  - `RMS_WEB_IMAGE_OVERRIDE`: Override the Docker image
  - `RMS_WEB_IMAGE_TAG_OVERRIDE`: Override the image tag

## Comparison with Tenant Manager Web App

The RMS Web App Jenkins setup is modeled after the Tenant Manager Web App with the following key differences:

| Component | RMS Web App | Tenant Manager Web App |
|-----------|-------------|------------------------|
| **Jenkinsfile Location** | `/Jenkinsfile` | `/Jenkinsfile` |
| **Docker Image** | `shivain22/rms-web-app` | `shivain22/tenant-manager-web-app` |
| **Service Name** | `rms-web` | `tenant-manager-web` |
| **Image Override Var** | `RMS_WEB_IMAGE_OVERRIDE` | `TENANT_MANAGER_WEB_IMAGE_OVERRIDE` |
| **Tag Override Var** | `RMS_WEB_IMAGE_TAG_OVERRIDE` | `TENANT_MANAGER_WEB_IMAGE_TAG_OVERRIDE` |
| **Platform Scripts** | Updated `up.sh` | Already configured |

## Prerequisites

To use this Jenkins integration, ensure:

1. ✅ Jenkins is installed and configured
2. ✅ Jenkins has access to the Git repository
3. ✅ Jenkins agent has Docker installed
4. ✅ Jenkins can access `/platform` directory and scripts
5. ✅ Docker Hub credentials are configured (`shivain22` account)
6. ✅ Platform environment is set up and running

## Testing the Setup

### Manual Pipeline Test

1. Push a commit to the repository
2. Jenkins should automatically start the build
3. Monitor the build progress in Jenkins UI
4. Verify the stages complete successfully:
   - ✅ Checkout
   - ✅ Build Docker Image
   - ✅ Push to Registry
   - ✅ Deploy to Platform

### Verify Deployment

```bash
# Check if the service is running
cd /platform
docker-compose ps rms-web

# View logs
docker-compose logs -f rms-web

# Check the image tag
docker inspect platform-rms-web | grep Image
```

## Manual Deployment (Without Jenkins)

If you need to manually build and deploy:

```bash
# Build and push Docker image
./build-and-push-docker.sh

# Deploy to platform manually
cd /platform
./scripts/down.sh dev rms-web
RMS_WEB_IMAGE_OVERRIDE=shivain22/rms-web-app \
RMS_WEB_IMAGE_TAG_OVERRIDE=latest \
./scripts/up.sh dev rms-web
```

## Security Notes

⚠️ **Important**: The Jenkinsfile currently contains hardcoded Docker Hub credentials. This should be moved to Jenkins Credentials Store for better security.

### Recommended Security Improvements

1. **Move credentials to Jenkins**:
   - Store Docker password in Jenkins credentials
   - Reference it in Jenkinsfile using credentials binding

2. **Use secrets management**:
   - Consider using HashiCorp Vault or AWS Secrets Manager
   - Integrate with Jenkins for dynamic secret retrieval

3. **Rotate credentials regularly**:
   - Change Docker Hub password periodically
   - Update Jenkins credentials accordingly

## Troubleshooting

### Build Fails

**Symptom**: Docker build fails in Jenkins
**Solution**: 
- Check Dockerfile is valid
- Verify Node.js dependencies in package.json
- Review build logs for specific errors

### Push Fails

**Symptom**: Cannot push to Docker Hub
**Solution**:
- Verify Docker Hub credentials are correct
- Check network connectivity from Jenkins agent
- Ensure repository exists and is accessible

### Deployment Fails

**Symptom**: Platform deployment fails
**Solution**:
- Verify `/platform` directory exists
- Check platform scripts are executable: `chmod +x /platform/scripts/*.sh`
- Ensure docker-compose.yml has `rms-web` service defined
- Review platform logs: `cd /platform && docker-compose logs`

## Next Steps

1. **Set up webhooks**: Configure Git webhooks to trigger Jenkins builds automatically
2. **Add notifications**: Configure Jenkins to send Slack/email notifications on build status
3. **Implement staging**: Add a staging environment for pre-production testing
4. **Add tests**: Include automated tests in the pipeline before deployment
5. **Security hardening**: Move credentials to Jenkins credentials store

## Related Documentation

- [Jenkins CI/CD Setup Guide](./JENKINS_CI_CD_SETUP.md) - Detailed technical documentation
- [Setup Guide](./SETUP_GUIDE.md) - Project setup instructions
- [Current Status](./CURRENT_STATUS.md) - Project status and features
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## Success Criteria

The Jenkins integration is successful when:

✅ Code pushed to repository triggers automatic build
✅ Docker image is built successfully
✅ Image is pushed to Docker Hub
✅ Updated image is deployed to platform
✅ RMS Web App is accessible and functioning correctly
✅ Deployment process completes without manual intervention

---

**Last Updated**: February 5, 2026
**Status**: ✅ Implementation Complete
**Tested**: Pending first automated deployment
