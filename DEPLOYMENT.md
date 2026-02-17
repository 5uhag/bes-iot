# Deployment Guide for Sentient-Mirror-OSS

## 🚨 Important: Vercel Limitation

**Sentient-Mirror-OSS CANNOT be deployed to Vercel** due to technical constraints:

### Why Vercel Won't Work:
1. **Webcam Access**: The app uses `cv2.VideoCapture()` which requires direct hardware camera access
2. **Serverless Architecture**: Vercel runs serverless functions - no cameras, no persistent processes
3. **Client vs Server**: Webcams are on the CLIENT side (user's browser), but OpenCV runs on the SERVER side
4. **No Browser APIs**: Streamlit doesn't natively support client-side browser camera API

---

## ✅ Recommended Hosting Options

### Option 1: Streamlit Community Cloud (BEST FOR THIS APP) 🌟

**Pros:**
- ✅ FREE forever
- ✅ Built specifically for Streamlit apps
- ✅ Optimized for camera-based apps
- ✅ Easy GitHub integration
- ✅ Automatic HTTPS
- ✅ No configuration needed

**Cons:**
- ⚠️ Users still need local webcam (can't access your personal camera remotely)
- ⚠️ Public URLs (can make private with authentication)

**Deployment Steps:**
1. Push code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Sign in with GitHub
4. Click "New app"
5. Select repository, branch, and `app.py`
6. Click "Deploy"

**Note:** Each user who visits the deployed app will use THEIR OWN webcam, not yours. This is a privacy-first feature.

---

### Option 2: Self-Hosting (VPS/Home Server)

**Best for:** Personal use, full control

**Options:**
- **Railway** (free tier, easy deploy)
- **Render** (free tier available)
- **DigitalOcean** ($5/month for basic droplet)
- **AWS EC2** (free tier for 12 months)
- **Your own computer** (run 24/7)

**Deployment:**
```bash
# On server:
git clone <your-repo>
cd sentient-mirror-oss
pip install -r requirements.txt
streamlit run app.py --server.port 8501 --server.address 0.0.0.0
```

**Access via:** `http://your-server-ip:8501`

---

### Option 3: Docker Deployment

**Best for:** Portability, consistent environments

Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

**Build and run:**
```bash
docker build -t sentient-mirror .
docker run -p 8501:8501 sentient-mirror
```

---

## 🔄 Alternative: Modify for Vercel

If you MUST use Vercel, you need to **completely redesign** the app:

### Required Changes:
1. **Remove webcam capture** - Use file upload instead
2. **Process images, not video** - Upload photo → detect emotion → show result
3. **Convert to FastAPI/Flask** - Use REST API instead of Streamlit
4. **Client-side camera** - Use JavaScript to capture from browser, send to API

This would be a **different app** entirely. Not recommended if you want real-time video emotion detection.

---

## 📋 Deployment Checklist

### Before Deploying:

- [ ] Test locally: `streamlit run app.py` ✅ (Currently running!)
- [ ] Commit all files to Git
- [ ] Create `.gitignore` (already done ✅)
- [ ] Add README.md with setup instructions (already done ✅)
- [ ] Choose hosting platform
- [ ] Create GitHub repository (if not exists)
- [ ] Push code to GitHub

### For Streamlit Community Cloud:

```bash
# 1. Initialize git (if not already)
git init

# 2. Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/sentient-mirror-oss.git

# 3. Commit and push
git add .
git commit -m "Initial commit: Sentient-Mirror-OSS MVP"
git push -u origin main

# 4. Go to share.streamlit.io and deploy
```

---

## 🔐 Privacy Considerations for Deployment

**IMPORTANT:** When deployed to a public URL:
- Each user accesses THEIR OWN webcam (not yours)
- All processing happens on the SERVER, not user's device
- Consider adding authentication to restrict access
- Add disclaimer about data usage

**Recommended additions for public deployment:**
1. User authentication (Streamlit has built-in auth)
2. Usage limits to prevent server overload
3. Privacy policy page
4. Terms of service

---

## 🎯 Recommendation

**For Sentient-Mirror-OSS, I recommend:**

1. **Deploy to Streamlit Community Cloud** - It's free, easy, and designed for this
2. **Keep Vercel for other projects** - It's great for static sites, APIs, and Next.js apps

**Next Steps:**
1. Test the app locally (currently running on localhost:8501)
2. Create a GitHub repository
3. Push the code
4. Deploy to Streamlit Community Cloud
5. Share the public URL with users

---

## 🆘 Need Help?

**Current Status:**
- ✅ App is running locally at `http://localhost:8501`
- ✅ All files are ready for Git
- ⏸️ Waiting for user to test the app
- ⏸️ Ready to push to GitHub when ready

**If you want to proceed with Streamlit Community Cloud, just let me know and I'll help you:**
1. Set up the Git repository
2. Push to GitHub
3. Deploy to Streamlit Community Cloud
