# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for automated CI/CD workflows. The pipeline includes building, testing, security scanning, and Docker image deployment.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs:**

#### Build and Test
- Checkout code
- Setup Node.js 20.x
- Install dependencies with `npm ci`
- Run linter (if available)
- Build application
- Upload build artifacts

#### Security Scan
- Run npm audit for vulnerabilities
- Scan with Trivy for security issues
- Upload results to GitHub Security

#### Docker Build and Push
- Build Docker image with BuildKit
- Push to Docker Hub (main branch only)
- Tag with:
  - `latest` (for main branch)
  - `main-<commit-sha>`
  - Branch name

#### Deploy
- Triggered after successful Docker push
- Creates deployment summary
- Ready for custom deployment steps

### 2. Dependency Updates (`dependency-update.yml`)

**Triggers:**
- Weekly schedule (Monday 2 AM UTC)
- Manual workflow dispatch

**Actions:**
- Updates npm dependencies
- Applies security fixes
- Creates pull request with changes

### 3. Code Quality (`code-quality.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Checks:**
- ESLint for code quality
- TypeScript type checking
- Prettier formatting
- Security audit
- Secret scanning with Trufflehog

## Required GitHub Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `DOCKER_USERNAME` | Docker Hub username | Yes |
| `DOCKER_PASSWORD` | Docker Hub access token | Yes |

### How to Create Docker Hub Access Token:

1. Go to https://hub.docker.com/settings/security
2. Click **"New Access Token"**
3. Name: `github-actions`
4. Permissions: **Read & Write**
5. Copy the token
6. Add to GitHub Secrets as `DOCKER_PASSWORD`

## Setup Instructions

### 1. Add GitHub Secrets

```bash
# Go to your repository on GitHub
Repository → Settings → Secrets and variables → Actions → New repository secret

# Add:
DOCKER_USERNAME = abdullah0100
DOCKER_PASSWORD = <your-docker-hub-token>
```

### 2. Enable GitHub Actions

GitHub Actions should be enabled by default. Verify in:
```
Repository → Settings → Actions → General → Allow all actions
```

### 3. First Pipeline Run

The pipeline will automatically run when you:
```bash
git add .github/workflows/
git commit -m "Add CI/CD pipeline"
git push origin main
```

## Workflow Status

Check workflow runs:
- Go to **Actions** tab in your repository
- View running/completed workflows
- Check logs for any errors

## Pipeline Flow

```
┌─────────────────────┐
│   Code Push/PR      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Build & Test       │
│  - Install deps     │
│  - Build app        │
│  - Run tests        │
└──────────┬──────────┘
           │
           ├──────────────────────┐
           │                      │
           ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│  Security Scan      │  │  Code Quality       │
│  - npm audit        │  │  - ESLint           │
│  - Trivy scan       │  │  - TypeScript       │
└──────────┬──────────┘  │  - Prettier         │
           │              └─────────────────────┘
           ▼
┌─────────────────────┐
│  Docker Build       │
│  - Build image      │
│  - Push to Hub      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Deploy (Optional)  │
│  - Notification     │
│  - Update servers   │
└─────────────────────┘
```

## Customization

### Adding Tests

Edit `.github/workflows/ci-cd.yml`:

```yaml
- name: Run tests
  run: npm test
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
```

### Custom Deployment

Edit the `deploy` job in `ci-cd.yml`:

```yaml
deploy:
  steps:
    # Example: Deploy to Azure
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy to Azure
      run: |
        az webapp deployment container config \
          --name your-app \
          --resource-group your-rg \
          --docker-custom-image-name ${{ env.DOCKER_USERNAME }}/${{ env.DOCKER_IMAGE }}:latest
```

### Slack Notifications

Add to any job:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment completed for ${{ github.repository }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Environment Protection

For production deployments, enable environment protection:

1. **Settings → Environments → New environment**
2. Name: `production`
3. **Add protection rules:**
   - Required reviewers
   - Wait timer
   - Deployment branches (main only)

## Monitoring

### View Pipeline Status

**Badge for README:**
```markdown
![CI/CD](https://github.com/Omage001/TAM-Abdullah-Alotaibi/actions/workflows/ci-cd.yml/badge.svg)
```

### Email Notifications

GitHub sends email notifications for:
- Failed workflows
- First successful run after failures
- Configure in: **Settings → Notifications**

## Troubleshooting

### Build Fails

```bash
# Check logs in Actions tab
# Common issues:
- Missing dependencies → Check package.json
- Build errors → Check TypeScript/ESLint errors locally
- Environment variables → Add to workflow secrets
```

### Docker Push Fails

```bash
# Verify:
1. DOCKER_USERNAME is correct
2. DOCKER_PASSWORD is a valid access token (not password)
3. Repository exists on Docker Hub
4. Token has read/write permissions
```

### Tests Fail

```bash
# Run locally:
npm test

# Check database connection:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db npm test
```

## Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Test locally first** - Run build/test before pushing
3. **Use pull requests** - Trigger CI before merging
4. **Monitor workflows** - Check Actions tab regularly
5. **Keep dependencies updated** - Use dependency update workflow

## Manual Workflow Triggers

Trigger workflows manually:

1. Go to **Actions** tab
2. Select workflow
3. Click **"Run workflow"**
4. Choose branch
5. Click **"Run workflow"** button

## Workflow Examples

### Deploy to Production

```bash
# The pipeline automatically deploys when you push to main:
git checkout main
git merge develop
git push origin main

# Watch deployment:
# Repository → Actions → CI/CD Pipeline → Latest run
```

### Update Dependencies

```bash
# Manual trigger:
Repository → Actions → "Docker Image Update" → Run workflow

# Or wait for weekly automatic run
```

## Cost Optimization

GitHub Actions is free for public repositories. For private:
- 2,000 minutes/month free
- Optimize by:
  - Using cache for dependencies
  - Running tests only on PR
  - Limiting scheduled workflows

## Next Steps

1. ✅ Add GitHub Secrets (DOCKER_USERNAME, DOCKER_PASSWORD)
2. ✅ Push workflows to repository
3. ✅ Verify first pipeline run
4. ✅ Add status badge to README
5. ✅ Configure environment protection
6. ✅ Set up deployment target (Azure/AWS/GCP)

---

**Your CI/CD pipeline is now ready!** 🚀

Every push to main will:
- ✅ Build and test the application
- ✅ Scan for security vulnerabilities
- ✅ Build and push Docker image
- ✅ Deploy (when configured)
