# Files and Folders NOT Required for Deployment

## Backend Deployment (Render)

### ❌ DO NOT DEPLOY THESE:

#### Folders:
- `Backend/node_modules/` - Will be installed on Render
- `Backend/uploads/` - User uploads (use Cloudinary instead)
- `Backend/assets/` - Static assets (can be served from Cloudinary)
- `Backend/.env` - Environment variables (set in Render dashboard)

#### Files:
- `Backend/package-lock.json` - Optional (can be regenerated)
- `Backend/.git/` - Git metadata (not needed in deployment)
- `Backend/*.log` - Log files
- `Backend/.DS_Store` - macOS system files
- `Backend/Thumbs.db` - Windows system files

### ✅ REQUIRED FOR DEPLOYMENT:

#### Essential Files:
- `Backend/server.js` - Main server file
- `Backend/package.json` - Dependencies
- `Backend/config/` - Configuration files
- `Backend/controllers/` - Route controllers
- `Backend/models/` - Database models
- `Backend/routes/` - API routes
- `Backend/middleware/` - Middleware functions
- `Backend/sockets/` - Socket.IO handlers
- `Backend/utils/` - Utility functions

## Frontend Deployment (Expo Go)

### ❌ DO NOT DEPLOY THESE:

#### Folders:
- `node_modules/` - Will be installed by Expo
- `Frontend/node_modules/` - Will be installed by Expo
- `.expo/` - Expo build cache
- `dist/` - Build output
- `web-build/` - Web build output
- `android/build/` - Android build files
- `android/.gradle/` - Gradle cache
- `android/app/build/` - Android app build
- `ios/build/` - iOS build files
- `ios/Pods/` - CocoaPods dependencies

#### Files:
- `.env.local` - Local environment overrides
- `*.log` - Log files
- `.DS_Store` - macOS system files
- `Thumbs.db` - Windows system files
- `package-lock.json` - Optional
- `yarn.lock` - Optional (if using npm)

### ✅ REQUIRED FOR DEPLOYMENT:

#### Essential Files:
- `Frontend/app/` - All app source code
- `Frontend/assets/` - Static assets (images, etc.)
- `Frontend/lib/` - Library files
- `Frontend/search/` - Search components
- `package.json` - Root package.json
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration
- `tailwind.config.js` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration
- `metro.config.js` - Metro bundler config

## Root Level - NOT REQUIRED:

- `TROT-main (2).zip` - Archive file (delete)
- `.env` - Local development only (use Render env vars)
- `node_modules/` - Root dependencies (if any)

## Summary

**For Render Backend Deployment:**
- Only deploy: `Backend/` folder contents (excluding node_modules, uploads, .env)
- Set environment variables in Render dashboard
- Render will run `npm install` automatically

**For Expo Go Frontend:**
- Deploy entire repo (Expo handles what it needs)
- Set `EXPO_PUBLIC_API_BASE` in `.env` or Expo dashboard
- Expo Go will bundle only necessary files

## .gitignore Recommendations

Make sure your `.gitignore` includes:
```
node_modules/
.env
.env.local
uploads/
.expo/
dist/
build/
*.log
.DS_Store
Thumbs.db
```

