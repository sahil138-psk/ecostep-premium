# GCP Deployment Guide - EcoStep Premium

This guide outlines two pathways for deploying the EcoStep Premium Carbon Footprint Tracker on Google Cloud Platform (GCP):

1. **Option A: Google Cloud Run (Recommended)** – Containerized serverless deployment.
2. **Option B: Firebase Hosting** – Optimal for hosting static single-page web applications.

---

## Prerequisites
1. A **GCP Account** and active project.
2. The [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install) installed and configured on your machine.
3. Node.js (v18+) and Docker (if building containers locally) installed.

---

## Option A: Deploying to Google Cloud Run (Containerized)

Cloud Run is a fully managed, serverless platform that runs containerized applications.

### Step 1: Initialize gcloud CLI
Authenticate your CLI and set your working project ID:
```bash
# Log in to your GCP account
gcloud auth login

# Set your current project ID
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 2: Enable Required GCP APIs
Enable Google Cloud Build, Google Artifact Registry, and Google Cloud Run services:
```bash
gcloud services enable run.googleapis.com \
                       builds.googleapis.com \
                       artifactregistry.googleapis.com
```

### Step 3: Serverless Build and Deploy (Simplest Method)
You can build the Docker image in the cloud using Google Cloud Build and deploy it immediately to Cloud Run with a single command:
```bash
gcloud run deploy ecostep-premium \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080
```
*GCP will compile your code using the local `Dockerfile`, register it in Artifact Registry, and launch a Cloud Run instance.*

### Step 4: Access Your App
After the command completes, it will print a URL:
`Service [ecostep-premium] has been deployed and is available at: https://ecostep-premium-xxxxxx.a.run.app`

---

## Option B: Deploying to Firebase Hosting (Static Hosting)

Since EcoStep is a client-side Single Page Application, hosting it on Firebase (GCP's developer platform) is highly performant and falls well within the free tier.

### Step 1: Install Firebase Tools
```bash
npm install -g firebase-tools
```

### Step 2: Login and Initialize Project
```bash
# Log in to your Firebase account (GCP Credentials)
firebase login

# Initialize the project structure
firebase init hosting
```

**Selection prompts:**
- Select your GCP Project.
- Set public directory to: `dist`
- Configure as a single-page app: `Yes`
- Set up automatic builds/deploys with GitHub: `No` (Optional)
- Overwrite `index.html`: `No` (Important: do not overwrite!)

### Step 3: Build and Deploy
```bash
# Compile the React TypeScript production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## Option C: CI/CD Deployment with GitHub Actions (Optional)

If your codebase is hosted on GitHub, you can automate deployments to Cloud Run using a workflow file:

Create a file named `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ecostep-premium \
            --source . \
            --region us-central1 \
            --allow-unauthenticated
```
*(Requires creating a Service Account with Cloud Run Admin, Cloud Build Editor, and Storage Admin permissions, and saving its JSON key as a GitHub Secret `GCP_SA_KEY`).*
