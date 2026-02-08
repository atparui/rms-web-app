# Jenkins Build Improvements

## Change Summary

Added `npm install` stage to the Jenkins pipeline to ensure all dependencies are properly installed before building the Docker image.

## What Changed

### Before
```
1. Checkout
2. Build Docker Image
3. Push to Registry
4. Deploy to Platform
```

### After
```
1. Checkout
2. Install Dependencies ← NEW STAGE
3. Build Docker Image
4. Push to Registry
5. Deploy to Platform
```

## New Stage Details

### Stage: Install Dependencies

```groovy
stage('Install Dependencies') {
    steps {
        script {
            echo '📦 Installing npm dependencies...'
            sh """
                npm install
            """
        }
    }
}
```

**Purpose:**
- Ensures all npm packages are installed before Docker build
- Downloads dependencies defined in `package.json`
- Creates/updates `node_modules/` directory
- Validates `package-lock.json` integrity

**When it runs:**
- After code checkout
- Before Docker image build
- Every pipeline execution

## Why This Change?

### Benefits

1. **Dependency Validation**
   - Ensures `package.json` is valid
   - Verifies all dependencies can be resolved
   - Catches dependency conflicts early

2. **Build Reliability**
   - Dependencies available for Docker build
   - Reduces build failures
   - Consistent builds across environments

3. **Better Error Messages**
   - npm errors are clearer than Docker build errors
   - Easier to debug dependency issues
   - Faster feedback on problems

4. **Caching Potential**
   - node_modules can be cached between builds
   - Faster subsequent builds
   - Reduced network usage

### Use Cases

**When dependencies are needed:**
- TypeScript compilation
- ESLint/Prettier checks
- Pre-build scripts
- Asset generation
- Testing (if added)

## Complete Pipeline Flow

```
┌──────────────────────────────────────────┐
│ 1. Checkout                              │
│    - Clone repository                    │
│    - Checkout branch                     │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ 2. Install Dependencies (NEW)            │
│    - npm install                         │
│    - Download packages                   │
│    - Create node_modules/                │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ 3. Build Docker Image                    │
│    - docker build                        │
│    - Tag with build number               │
│    - Tag as latest                       │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ 4. Push to Registry                      │
│    - docker login                        │
│    - Push build number tag               │
│    - Push latest tag                     │
│    - docker logout                       │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ 5. Deploy to Platform                    │
│    - Stop existing container             │
│    - Start new container                 │
│    - Use latest image                    │
└──────────────────────────────────────────┘
```

## Additional Improvements (Future)

### 1. Add Build/Lint Stage

```groovy
stage('Build & Lint') {
    steps {
        script {
            echo '🔨 Building and linting...'
            sh """
                npm run build
                npm run lint
            """
        }
    }
}
```

### 2. Add Testing Stage

```groovy
stage('Test') {
    steps {
        script {
            echo '🧪 Running tests...'
            sh """
                npm run test
            """
        }
    }
}
```

### 3. Cache node_modules

```groovy
stage('Install Dependencies') {
    steps {
        script {
            echo '📦 Installing npm dependencies...'
            // Cache node_modules between builds
            sh """
                if [ -d "/var/jenkins_home/cache/rms-web-app/node_modules" ]; then
                    echo "Restoring cached node_modules..."
                    cp -r /var/jenkins_home/cache/rms-web-app/node_modules ./
                fi
                
                npm install
                
                echo "Caching node_modules..."
                mkdir -p /var/jenkins_home/cache/rms-web-app
                cp -r ./node_modules /var/jenkins_home/cache/rms-web-app/
            """
        }
    }
}
```

### 4. Use npm ci for CI/CD

```groovy
stage('Install Dependencies') {
    steps {
        script {
            echo '📦 Installing npm dependencies (CI mode)...'
            sh """
                npm ci
            """
        }
    }
}
```

**Benefits of `npm ci`:**
- Faster than `npm install`
- Cleaner installs
- Uses `package-lock.json` exactly
- Better for CI/CD environments

### 5. Add Environment Check

```groovy
stage('Environment Check') {
    steps {
        script {
            echo '🔍 Checking environment...'
            sh """
                node --version
                npm --version
                echo "Current directory: \$(pwd)"
                echo "Files present: \$(ls -la)"
            """
        }
    }
}
```

## Configuration

### Environment Variables Used

```groovy
environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_IMAGE = 'shivain22/rms-web-app'
    DOCKER_USERNAME = 'shivain22'
    DOCKER_PASSWORD = 'Asd!@#123'
}
```

### Build Arguments

```groovy
docker build \
    --tag ${DOCKER_IMAGE}:${BUILD_NUMBER} \
    --tag ${DOCKER_IMAGE}:latest \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    .
```

## Best Practices

### 1. Separate Install Stage
✅ Makes it clear when dependencies are installed
✅ Easier to debug dependency issues
✅ Can add caching in future
✅ Clear pipeline visualization

### 2. Explicit Commands
✅ `npm install` is explicit and clear
✅ Can switch to `npm ci` for stricter installs
✅ Can add flags as needed (`--production`, `--frozen-lockfile`)

### 3. Error Handling
✅ If npm install fails, pipeline stops early
✅ Doesn't waste time building Docker image
✅ Clear error messages

### 4. Pipeline Visualization
Jenkins will show:
```
✅ Checkout
✅ Install Dependencies
✅ Build Docker Image
✅ Push to Registry
✅ Deploy to Platform
```

## Dockerfile Considerations

The Dockerfile should also have `npm install`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ... rest of Dockerfile
```

**Note:** The Jenkins `npm install` is for the host, the Dockerfile `npm ci` is for the container.

## Testing the Change

### Test Locally

```bash
# Test the npm install step
npm install

# Verify node_modules created
ls -la node_modules

# Test the build
npm run build
```

### Test in Jenkins

1. Commit the Jenkinsfile change
2. Trigger a build
3. Watch the "Install Dependencies" stage
4. Verify it completes successfully
5. Check that Docker build succeeds

### Expected Output

```
[Pipeline] stage (Install Dependencies)
[Pipeline] { (Install Dependencies)
[Pipeline] script
[Pipeline] {
[Pipeline] echo
📦 Installing npm dependencies...
[Pipeline] sh
+ npm install
added 234 packages in 15s
[Pipeline] }
[Pipeline] // script
[Pipeline] }
[Pipeline] // stage
```

## Summary

### Change Made
✅ Added "Install Dependencies" stage
✅ Runs `npm install` before Docker build
✅ Ensures all dependencies available

### Benefits
✅ Validates dependencies early
✅ Better error messages
✅ More reliable builds
✅ Preparation for caching
✅ Clear pipeline stages

### Next Steps
- Commit the change
- Test the pipeline
- Consider adding build/lint/test stages
- Consider using `npm ci` for stricter installs

## Related Files

- `Jenkinsfile` - Pipeline definition (updated)
- `package.json` - Dependencies list
- `package-lock.json` - Exact versions
- `Dockerfile` - Container build (also does npm install)

---

Last Updated: 2026-02-04
Change: Added npm install stage to Jenkins pipeline
