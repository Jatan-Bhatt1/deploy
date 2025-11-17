# Environment Variables Setup

This project uses a **single consolidated `.env` file** in the root directory for both Backend and Frontend configuration.

## Setup Instructions

1. **Create a `.env` file in the root directory** (same level as `package.json`)

2. **Copy the template below** and fill in your actual values:

```env
# ============================================
# TROT Application - Environment Variables
# ============================================

# ============================================
# Backend Configuration
# ============================================

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string_here

# JWT Secret for authentication tokens
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# CORS Configuration (comma-separated for multiple origins)
CLIENT_ORIGIN=http://localhost:3000,http://localhost:19006

# Cloudinary Configuration (for image uploads)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# ============================================
# Frontend Configuration (Expo)
# ============================================
# Note: Expo only reads variables prefixed with EXPO_PUBLIC_

# Backend API Base URL
EXPO_PUBLIC_API_BASE=http://localhost:5000
```

## Important Notes

- **Backend** loads the `.env` file from the root directory automatically
- **Frontend (Expo)** only reads environment variables prefixed with `EXPO_PUBLIC_`
- The old `Backend/.env` file is no longer needed - all variables should be in the root `.env`
- Make sure `.env` is in your `.gitignore` file (never commit secrets!)

## Migration from Separate .env Files

If you previously had separate `.env` files:
1. Copy all variables from `Backend/.env` to the root `.env`
2. Copy all `EXPO_PUBLIC_*` variables from root `.env` (if any) to the root `.env`
3. Delete `Backend/.env` (it's no longer used)
4. Restart your backend server

