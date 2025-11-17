# 🚀 Quick Manual Update Guide

## ✅ Step 1: Constants File (DONE!)
The file `Frontend/app/constants/cloudinaryAssets.ts` is already updated with all URLs.

---

## 📝 Step 2: Update Each File

### Simple 3-Step Process for Each File:

1. **Add import at the top:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
```

2. **Replace `require("../../assets/images/xxx.png")` with:**
```typescript
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.xxx }
```

3. **Replace `Image.resolveAssetSource(require("../../assets/images/default-avatar.jpg")).uri` with:**
```typescript
CLOUDINARY_ASSETS.DEFAULT_AVATAR
```

---

## 📋 Files to Update (10 files total):

### 1. ✅ Dashboard.tsx (ALREADY DONE!)
- Added import
- Updated all 6 category images

### 2. Frontend/app/data/skillCategories.ts
**Find and replace:**
- `require("../../assets/images/creative.png")` → `{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.creative }`
- `require("../../assets/images/mentorships.png")` → `{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.mentorships }`
- `require("../../assets/images/music.png")` → `{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.music }`
- `require("../../assets/images/studies.png")` → `{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.studies }`
- `require("../../assets/images/competition.png")` → `{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.competition }`
- `require("../../assets/images/more.png")` → `{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.more }`

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
```

### 3. Frontend/app/_components/Header.tsx
**Find:**
```typescript
Image.resolveAssetSource(require("../../assets/images/default-avatar.jpg")).uri
```

**Replace with:**
```typescript
CLOUDINARY_ASSETS.DEFAULT_AVATAR
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
```

### 4. Frontend/app/screens/Profile.tsx
**Find:**
```typescript
const initialFallback = Image.resolveAssetSource(
  require("../../assets/images/default-avatar.jpg")
).uri;
```

**Replace with:**
```typescript
const initialFallback = CLOUDINARY_ASSETS.DEFAULT_AVATAR;
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
```

### 5. Frontend/app/screens/UserProfile.tsx
**Find:**
```typescript
const defaultAvatar = Image.resolveAssetSource(
  require("../../assets/images/default-avatar.jpg")
).uri;
```

**Replace with:**
```typescript
const defaultAvatar = CLOUDINARY_ASSETS.DEFAULT_AVATAR;
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
```

### 6. Frontend/app/screens/SearchResults.tsx
**Find:**
```typescript
const defaultAvatar = Image.resolveAssetSource(
  require("../../assets/images/default-avatar.jpg")
).uri;
```

**Replace with:**
```typescript
const defaultAvatar = CLOUDINARY_ASSETS.DEFAULT_AVATAR;
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
```

### 7. Frontend/app/screens/chats/Chats.tsx
**Find all:**
```typescript
require("../../../assets/images/default-avatar.jpg")
```

**Replace with:**
```typescript
{ uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR }
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../../constants/cloudinaryAssets";
```

### 8. Frontend/app/screens/chatscreen/ChatScreen.tsx
**Find:**
```typescript
require("../../../assets/images/default-avatar.jpg")
```

**Replace with:**
```typescript
{ uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR }
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../../constants/cloudinaryAssets";
```

### 9. Frontend/app/screens/Credits.tsx
**Find:**
```typescript
const defaultAvatar = require("../../assets/images/default-avatar.jpg");
```

**Replace with:**
```typescript
const defaultAvatar = { uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR };
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
```

### 10. Frontend/app/index.tsx
**Find:**
```typescript
<Image source={require("../assets/images/default-avatar.jpg")} ... />
```

**Replace with:**
```typescript
<Image source={{ uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR }} ... />
```

**Add import:**
```typescript
import { CLOUDINARY_ASSETS } from "./constants/cloudinaryAssets";
```

---

## 🎯 Quick Copy-Paste Reference

### For Category Images:
```typescript
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.creative }
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.mentorships }
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.music }
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.studies }
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.competition }
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.more }
{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.technical }
```

### For Default Avatar:
```typescript
CLOUDINARY_ASSETS.DEFAULT_AVATAR
// OR if you need { uri: ... } format:
{ uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR }
```

---

## ✅ After All Updates:

1. **Test the app** - All images should load from Cloudinary
2. **Delete folders:**
   - `Backend/assets/` ✅ Safe to delete
   - `Frontend/assets/images/` ✅ Safe to delete
3. **Remove static route from Backend/server.js:**
   - Remove: `app.use("/static", express.static(path.join(__dirname, "assets")));`

---

## 💡 Pro Tip: Use Find & Replace

In your IDE, use Find & Replace:
- **Find:** `require("../../assets/images/default-avatar.jpg")`
- **Replace:** `{ uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR }`

Then manually add the import statement at the top of each file!

