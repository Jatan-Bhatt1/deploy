# Step-by-Step Render Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

✅ **Ensure these files exist:**
- `Backend/server.js`
- `Backend/package.json`
- `Backend/.gitignore` (already created)
- `Backend/render.yaml` (already created)

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 3. Deploy on Render

#### Step 3.1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

#### Step 3.2: Configure Service
- **Name**: `trot-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your main branch)
- **Root Directory**: `Backend` ⚠️ **IMPORTANT: Set this to `Backend`**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Step 3.3: Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add:

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trot?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
CLIENT_ORIGIN=https://exp.host/@yourusername/trot,exp://192.168.1.1:8081
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

**Important Notes:**
- `CLIENT_ORIGIN`: Add your Expo URLs (comma-separated, no spaces)
- For Expo Go, you'll need to add the URL after you get your Expo URL
- `PORT`: Render sets this automatically, but 10000 is safe

#### Step 3.4: Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (2-5 minutes)
3. Your backend will be live at: `https://trot-backend.onrender.com`

### 4. Update Frontend

#### Step 4.1: Get Your Render URL
After deployment, copy your Render URL (e.g., `https://trot-backend.onrender.com`)

#### Step 4.2: Update Frontend .env
In your root `.env` file, add:

```env
EXPO_PUBLIC_API_BASE=https://trot-backend.onrender.com
```

#### Step 4.3: Update Render CORS
Go back to Render → Environment Variables → Update `CLIENT_ORIGIN`:

```
CLIENT_ORIGIN=https://exp.host/@yourusername/trot,exp://your-expo-url
```

### 5. Test Your Deployment

#### Backend Health Check:
Visit: `https://trot-backend.onrender.com/`

Should return:
```json
{"ok":true,"service":"backend","time":"2024-..."}
```

#### Test API Endpoint:
Visit: `https://trot-backend.onrender.com/api/skills/debug`

Should return:
```json
{"ok":true,"route":"/api/skills/debug","time":"2024-..."}
```

### 6. Expo Go Setup

1. **Start Expo:**
   ```bash
   npm start
   ```

2. **Scan QR Code** with Expo Go app

3. **Update Backend URL** in your app's `.env`:
   ```env
   EXPO_PUBLIC_API_BASE=https://trot-backend.onrender.com
   ```

4. **Restart Expo** to load new environment variable

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `Root Directory` is set to `Backend`
- Verify `package.json` has correct `start` script

### Connection Refused
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access (allow all IPs for testing)
- Ensure MongoDB user has correct permissions

### CORS Errors
- Update `CLIENT_ORIGIN` in Render with your Expo URL
- Include both `https://exp.host/...` and `exp://...` formats
- Restart Render service after updating env vars

### Socket.IO Not Working
- Render supports WebSocket, but verify CORS settings
- Check that frontend connects to `https://` URL (not `http://`)
- Ensure `CLIENT_ORIGIN` includes your Expo URLs

### Environment Variables Not Loading
- Render loads `.env` from root, but we configured it to check both
- Set all variables in Render dashboard (recommended)
- Restart service after adding env vars

## 📝 Render Configuration Summary

**Service Type:** Web Service  
**Environment:** Node  
**Root Directory:** `Backend`  
**Build Command:** `npm install`  
**Start Command:** `npm start`  
**Auto-Deploy:** Yes (on git push)

## 🎯 Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Verify Socket.IO connections
3. ✅ Test image uploads (Cloudinary)
4. ✅ Update frontend `.env` with Render URL
5. ✅ Test full app flow in Expo Go

## 💡 Pro Tips

- **Free Tier:** Render free tier spins down after 15 min inactivity. First request may be slow.
- **Upgrade:** Consider paid tier for production (no spin-down)
- **Monitoring:** Use Render logs to debug issues
- **Backups:** Ensure MongoDB has backups enabled
- **SSL:** Render provides free SSL automatically

