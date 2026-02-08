# Jenkins Build - Dependency Installation Strategy

## Important: npm install in Docker, Not Jenkins

### Why Jenkins Doesn't Run npm install

Jenkins is running in a Docker container and **does not have npm installed**. This is the correct approach because:

1. ✅ Jenkins agent is lightweight (only needs Docker)
2. ✅ Dependencies are installed inside Docker build
3. ✅ Consistent environment (Node version in Dockerfile)
4. ✅ No need to install Node/npm on Jenkins

### Incorrect Approach (Attempted)
```groovy
// ❌ This fails because Jenkins doesn't have npm
stage('Install Dependencies') {
    sh "npm install"  // Error: npm: not found
}
```

### Correct Approach (Current)
```groovy
// ✅ Docker build handles npm install internally
stage('Build Docker Image') {
    sh "docker build ..."  // npm install happens inside
}
```

## Pipeline Stages

### Current (Correct)
```
1. Checkout
2. Build Docker Image (npm install inside Docker)
3. Push to Registry
4. Deploy to Platform
```

### Why Not on Jenkins Agent?
- Jenkins container doesn't have npm installed
- npm install happens inside Docker build (multi-stage)
- This is the standard Docker CI/CD pattern

## How npm install Actually Works

### Inside Dockerfile (Multi-Stage Build)

The Dockerfile has **two stages** that handle npm install:

#### Stage 1: Dependencies (Production)
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force
```

#### Stage 2: Builder (All Dependencies)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && \
    npm cache clean --force

COPY . .
RUN npm run build
```

**Key Points:**
- ✅ Stage 1: Production deps only
- ✅ Stage 2: All deps + build
- ✅ Uses `npm ci` (faster, stricter than `npm install`)
- ✅ Cleans cache to reduce image size
- ✅ Multi-stage keeps final image small

## Why This Approach?

### Benefits of Docker-Based Installation

1. **Consistent Environment**
   - Node version controlled by Dockerfile
   - Same environment locally and in CI/CD
   - No need to install Node on Jenkins

2. **Multi-Stage Optimization**
   - Production deps separate from dev deps
   - Small final image size
   - Only runtime files in production

3. **Better Caching**
   - Docker layer caching for dependencies
   - Only reinstalls when package.json changes
   - Faster subsequent builds

4. **Isolation**
   - No conflicts with Jenkins environment
   - Dependencies don't pollute Jenkins agent
   - Clean builds every time

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
│ 2. Build Docker Image                    │
│    - docker build                        │
│    - Stage 1: npm ci (prod deps)         │
│    - Stage 2: npm ci (all deps) + build  │
│    - Stage 3: Copy built files           │
│    - Tag with build number               │
│    - Tag as latest                       │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ 3. Push to Registry                      │
│    - docker login                        │
│    - Push build number tag               │
│    - Push latest tag                     │
│    - docker logout                       │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ 4. Deploy to Platform                    │
│    - Stop existing container             │
│    - Start new container                 │
│    - Use latest image                    │
└──────────────────────────────────────────┘
```

## Docker Build Optimization

### Current Dockerfile Strategy

The Dockerfile already uses best practices:

✅ **Multi-Stage Build**
- Stage 1 (deps): Production dependencies only
- Stage 2 (builder): All dependencies + build
- Stage 3 (runner): Minimal runtime image

✅ **npm ci (not npm install)**
- Faster and more reliable
- Uses exact versions from package-lock.json
- Better for CI/CD

✅ **Cache Optimization**
- COPY package files first (better layer caching)
- Dependencies cached if package.json unchanged
- Only rebuilds when needed

✅ **Security**
- Non-root user
- Minimal runtime image
- Production dependencies only in final image

### Docker Layer Caching

Docker automatically caches layers:

```dockerfile
# Layer 1: Base image (cached unless version changes)
FROM node:20-alpine AS builder

# Layer 2: Dependencies (cached unless package.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# Layer 3: Source code (rebuilds when code changes)
COPY . .
RUN npm run build
```

**How it helps:**
- If only source code changes → Layers 1-2 cached, only rebuild Layer 3
- If dependencies change → Layers 1 cached, rebuild 2-3
- If nothing changes → All layers cached, instant build

### Additional Improvements (Future)

#### 1. Add BuildKit Cache Mounts

```dockerfile
# Use BuildKit cache for npm
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts
```

**Benefits:**
- Persistent npm cache across builds
- Even faster dependency downloads
- Requires Docker BuildKit

#### 2. Parallel Stage Execution (Jenkins)

```groovy
stage('Parallel Checks') {
    parallel {
        stage('Lint Check') {
            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci && npm run lint'
            }
        }
        stage('Type Check') {
            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci && npm run type-check'
            }
        }
    }
}
```

**Benefits:**
- Run checks in parallel
- Use Node Docker image temporarily
- Faster pipeline execution

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

### Architecture
✅ Jenkins: Lightweight, only needs Docker
✅ Docker: Handles Node.js, npm, and dependencies
✅ Multi-stage build: Optimized images
✅ Layer caching: Fast subsequent builds

### Benefits
✅ No npm needed on Jenkins agent
✅ Consistent Node version (from Dockerfile)
✅ Better dependency caching (Docker layers)
✅ Smaller final images
✅ More secure (isolated builds)

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
