# Backend Deployment Guide for Render

## Prerequisites
- MongoDB database (MongoDB Atlas recommended)
- Cloudinary account (for image uploads)
- Render account

## Deployment Steps

### 1. Prepare Your Code
- Ensure all environment variables are set
- Test locally before deploying

### 2. Deploy to Render

#### Option A: Using Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `trot-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd Backend && npm install`
   - **Start Command**: `cd Backend && npm start`
   - **Root Directory**: Leave empty (or set to `Backend` if deploying only backend)

#### Option B: Using render.yaml
1. The `render.yaml` file is already created
2. Push to GitHub
3. Render will auto-detect and use the configuration

### 3. Environment Variables in Render

Add these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_ORIGIN=https://your-expo-app-url,exp://your-expo-url
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

**Important Notes:**
- `CLIENT_ORIGIN` should include your Expo app URLs (comma-separated)
- For Expo Go, use format: `exp://192.168.x.x:8081` or your Expo URL
- Render provides the `PORT` automatically, but set it to `10000` for consistency

### 4. Update Frontend

After deployment, update your frontend `.env`:

```env
EXPO_PUBLIC_API_BASE=https://your-backend-name.onrender.com
```

### 5. Health Check

Visit: `https://your-backend-name.onrender.com/`

Should return: `{"ok":true,"service":"backend","time":"..."}`

## Socket.IO Configuration

Socket.IO works automatically with Render. Make sure:
- Your frontend connects to the Render URL
- CORS is properly configured with your Expo URLs

## Troubleshooting

- **Build fails**: Check build logs in Render dashboard
- **Connection refused**: Verify MongoDB URI and network access
- **CORS errors**: Update `CLIENT_ORIGIN` with correct Expo URLs
- **Socket.IO not working**: Check WebSocket support (Render supports it)

