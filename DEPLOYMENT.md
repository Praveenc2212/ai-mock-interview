# 🚀 Deployment Guide - AI Mock Interview System

This guide provides step-by-step instructions for deploying your AI Mock Interview System to free hosting platforms.

## 📋 Table of Contents

- [Platform Comparison](#platform-comparison)
- [Option 1: Render (Recommended)](#option-1-render-recommended)
- [Option 2: Railway](#option-2-railway)
- [Option 3: Fly.io](#option-3-flyio)
- [Environment Variables](#environment-variables)
- [Post-Deployment Testing](#post-deployment-testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Platform Comparison

| Platform | Free Tier | Ease of Setup | Auto-Deploy | Best For |
|----------|-----------|---------------|-------------|----------|
| **Render** | 750 hrs/month | ⭐⭐⭐⭐⭐ Easy | ✅ Yes | Beginners |
| **Railway** | $5 credit/month | ⭐⭐⭐⭐ Easy | ✅ Yes | Developers |
| **Fly.io** | 3 VMs free | ⭐⭐⭐ Moderate | ✅ Yes | Advanced |

---

## Option 1: Render (Recommended)

### Why Render?
- ✅ Easiest setup
- ✅ 750 free hours per month (enough for continuous running)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ✅ No credit card required

### Step-by-Step Instructions

#### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

#### 2. Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended for easy integration)

#### 3. Deploy Your Application

1. **From Render Dashboard**, click **"New +"** → **"Web Service"**

2. **Connect Your Repository**:
   - Click **"Connect account"** if not already connected
   - Select your repository: `ai-mock-interview` (or your repo name)
   - Click **"Connect"**

3. **Configure Your Service**:
   - **Name**: `ai-mock-interview` (or your preferred name)
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**:
   - Scroll down to **"Environment Variables"**
   - Click **"Add Environment Variable"**
   - Add:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

5. **Select Free Plan**:
   - Choose **"Free"** plan (750 hours/month)

6. **Click "Create Web Service"**

#### 4. Wait for Deployment

- Render will build and deploy your app (takes 2-5 minutes)
- Watch the logs for any errors
- Once complete, you'll see **"Your service is live 🎉"**

#### 5. Access Your Application

Your app will be available at:
```
https://your-app-name.onrender.com/static/index.html
```

> [!TIP]
> Bookmark this URL! You can also set up a custom domain in Render settings.

---

## Option 2: Railway

### Why Railway?
- ✅ Great developer experience
- ✅ $5 free credit per month
- ✅ Simple deployment
- ✅ Excellent logs and monitoring

### Step-by-Step Instructions

#### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway

#### 2. Deploy Your Application

1. **From Railway Dashboard**, click **"New Project"**

2. **Select "Deploy from GitHub repo"**

3. **Choose Your Repository**:
   - Select `ai-mock-interview`
   - Click **"Deploy Now"**

4. **Railway will auto-detect** your Python app and start building

#### 3. Add Environment Variables

1. Click on your deployed service
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add:
   - **Variable**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key

5. Click **"Add"**

#### 4. Generate Domain

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Railway will create a public URL like: `your-app.up.railway.app`

#### 5. Access Your Application

Your app will be available at:
```
https://your-app.up.railway.app/static/index.html
```

> [!NOTE]
> Railway's free tier gives you $5 credit per month. Monitor your usage in the dashboard.

---

## Option 3: Fly.io

### Why Fly.io?
- ✅ 3 free VMs with 256MB RAM each
- ✅ Global deployment
- ✅ More control over infrastructure
- ✅ CLI-based (great for automation)

### Step-by-Step Instructions

#### 1. Install Fly CLI

**Windows (PowerShell)**:
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS/Linux**:
```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. Sign Up and Login

```bash
fly auth signup
# OR if you already have an account
fly auth login
```

#### 3. Launch Your Application

From your project directory:

```bash
cd e:\Projects\AI\Anti-Gravity
fly launch
```

When prompted:
- **App name**: Press Enter to use auto-generated or type your preferred name
- **Region**: Choose closest to you
- **PostgreSQL**: No
- **Redis**: No
- **Deploy now**: No (we need to set environment variables first)

#### 4. Set Environment Variables

```bash
fly secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

#### 5. Deploy Your Application

```bash
fly deploy
```

#### 6. Access Your Application

```bash
fly open /static/index.html
```

Or visit:
```
https://your-app-name.fly.dev/static/index.html
```

---

## 🔐 Environment Variables

All platforms require the following environment variable:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API Key | Yes* | `AIzaSyC...` |

> [!IMPORTANT]
> *The API key is optional if users provide it through the UI, but recommended for better UX.

### Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Add it to your deployment platform's environment variables

---

## ✅ Post-Deployment Testing

After deployment, test these features:

### 1. Basic Health Check
Visit: `https://your-app-url/`

Expected response:
```json
{"message": "AI Mock Interview System API"}
```

### 2. Frontend Access
Visit: `https://your-app-url/static/index.html`

You should see the interview interface.

### 3. Full Workflow Test

1. **Enter API Key** (if not set in environment)
2. **Enter Job Role**: "Software Engineer"
3. **Upload Resume**: Use a sample PDF
4. **Start Interview**: Allow microphone/camera permissions
5. **Answer a Question**: Speak clearly
6. **End Interview**: Get feedback

---

## 🐛 Troubleshooting

### Issue: "Application Error" or 500 Error

**Solution**:
1. Check deployment logs:
   - **Render**: Click on your service → "Logs" tab
   - **Railway**: Click on deployment → "Logs" tab
   - **Fly.io**: Run `fly logs`

2. Common causes:
   - Missing `GEMINI_API_KEY` environment variable
   - Invalid API key
   - Missing dependencies in `requirements.txt`

### Issue: "Cannot access /static/index.html"

**Solution**:
1. Ensure the `static` folder is committed to Git:
   ```bash
   git add static/
   git commit -m "Add static files"
   git push
   ```

2. Check that the deployment platform built successfully

### Issue: Speech Recognition Not Working

**Solution**:
- Speech recognition requires HTTPS (all platforms provide this automatically)
- Use Google Chrome for best compatibility
- Allow microphone permissions when prompted

### Issue: "Port already in use" (Local Testing)

**Solution**:
```bash
# Kill the process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

### Issue: Deployment Timeout

**Solution**:
- Increase build timeout in platform settings
- Check if all dependencies in `requirements.txt` are necessary
- Consider using a lighter Python version

---

## 🔄 Updating Your Deployment

All platforms support automatic deployment from GitHub:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. The platform will automatically rebuild and redeploy

---

## 💡 Tips for Free Tier Usage

### Render
- App sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours = ~31 days of continuous running

### Railway
- Monitor your $5 monthly credit in the dashboard
- Typical usage: ~$3-4/month for light traffic
- Set up usage alerts

### Fly.io
- 3 VMs with 256MB RAM each (shared CPU)
- Auto-stop/start to save resources
- Monitor with `fly status`

---

## 🎉 Success!

Your AI Mock Interview System is now deployed and accessible worldwide! 

**Next Steps**:
- Share your deployment URL with friends
- Monitor usage and logs
- Consider setting up a custom domain
- Add analytics to track usage

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Fly.io Documentation](https://fly.io/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Verify environment variables are set correctly
4. Ensure your GitHub repository is up to date

Happy Deploying! 🚀
