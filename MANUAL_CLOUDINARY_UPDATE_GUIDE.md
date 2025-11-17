# Manual Cloudinary URLs Update Guide

## ✅ Step 1: Frontend Constants File (Already Done!)
The file `Frontend/app/constants/cloudinaryAssets.ts` has been updated with all Cloudinary URLs.

---

## 📝 Step 2: Update All Frontend Files

You need to replace `require("../../assets/images/...")` with Cloudinary URLs in these files:

### Files to Update:

1. **Frontend/app/screens/Dashboard.tsx**
2. **Frontend/app/data/skillCategories.ts**
3. **Frontend/app/_components/Header.tsx**
4. **Frontend/app/screens/Profile.tsx**
5. **Frontend/app/screens/UserProfile.tsx**
6. **Frontend/app/screens/SearchResults.tsx**
7. **Frontend/app/screens/chats/Chats.tsx**
8. **Frontend/app/screens/chatscreen/ChatScreen.tsx**
9. **Frontend/app/screens/Credits.tsx**
10. **Frontend/app/index.tsx**

---

## 🔄 Replacement Patterns

### Pattern 1: For Image Components (require → { uri: string })

**OLD:**
```typescript
image: require("../../assets/images/creative.png")
```

**NEW:**
```typescript
image: { uri: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359641/trot/images/creative.jpg" }
```

**OR use the constant:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.creative }
```

---

### Pattern 2: For Default Avatar

**OLD:**
```typescript
require("../../assets/images/default-avatar.jpg")
Image.resolveAssetSource(require("../../assets/images/default-avatar.jpg")).uri
```

**NEW:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
CLOUDINARY_ASSETS.DEFAULT_AVATAR
// OR directly:
"https://res.cloudinary.com/ducxkpytj/image/upload/v1763359640/trot/images/default-avatar.jpg"
```

---

### Pattern 3: For Image.resolveAssetSource()

**OLD:**
```typescript
const defaultAvatar = Image.resolveAssetSource(
  require("../../assets/images/default-avatar.jpg")
).uri;
```

**NEW:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";
const defaultAvatar = CLOUDINARY_ASSETS.DEFAULT_AVATAR;
```

---

## 📋 Quick Reference - All Cloudinary URLs

```typescript
// Default Avatar
DEFAULT_AVATAR = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359640/trot/images/default-avatar.jpg"

// Category Images
creative = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359641/trot/images/creative.jpg"
mentorships = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359643/trot/images/mentorships.jpg"
music = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359645/trot/images/music.jpg"
studies = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359647/trot/images/studies.jpg"
competition = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359649/trot/images/competition.jpg"
more = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359651/trot/images/more.jpg"
technical = "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359652/trot/images/technical.avif"
```

---

## 🎯 Example Updates

### Example 1: Dashboard.tsx

**BEFORE:**
```typescript
const cards = [
  {
    title: "Creative",
    image: require("../../assets/images/creative.png"),
  },
];
```

**AFTER:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";

const cards = [
  {
    title: "Creative",
    image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.creative },
  },
];
```

---

### Example 2: Header.tsx

**BEFORE:**
```typescript
const [avatarUrl, setAvatarUrl] = useState<string>(
  Image.resolveAssetSource(require("../../assets/images/default-avatar.jpg")).uri
);
```

**AFTER:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";

const [avatarUrl, setAvatarUrl] = useState<string>(
  CLOUDINARY_ASSETS.DEFAULT_AVATAR
);
```

---

### Example 3: Profile.tsx

**BEFORE:**
```typescript
const initialFallback = Image.resolveAssetSource(
  require("../../assets/images/default-avatar.jpg")
).uri;
```

**AFTER:**
```typescript
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";

const initialFallback = CLOUDINARY_ASSETS.DEFAULT_AVATAR;
```

---

## ✅ Checklist

After updating all files:

- [ ] All `require("../../assets/images/...")` replaced
- [ ] All `Image.resolveAssetSource(require(...))` replaced
- [ ] Import statement added: `import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";`
- [ ] Test app to verify images load correctly
- [ ] Delete `Backend/assets/` folder
- [ ] Delete `Frontend/assets/images/` folder (keep other assets if needed)

---

## 🚀 After Updates Complete

1. **Test the app** - Make sure all images load from Cloudinary
2. **Delete assets folders:**
   - `Backend/assets/` (can be deleted)
   - `Frontend/assets/images/` (can be deleted, but keep other assets if you have them)
3. **Update server.js** - Remove the static assets route (optional, but recommended)

---

## 💡 Pro Tip

Use Find & Replace in your IDE:
- Find: `require("../../assets/images/`
- Replace with: `{ uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.` (then manually fix each one)

Or use the constants file for cleaner code!

