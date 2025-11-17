// Cloudinary Asset URLs
// Copy these URLs from Backend/config/cloudinaryAssets.js after running upload script

export const CLOUDINARY_ASSETS = {
  // Default avatar
  DEFAULT_AVATAR: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359640/trot/images/default-avatar.jpg",
  
  // Category images
  CATEGORY_IMAGES: {
    creative: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359641/trot/images/creative.jpg",
    mentorships: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359643/trot/images/mentorships.jpg",
    music: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359645/trot/images/music.jpg",
    studies: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359647/trot/images/studies.jpg",
    competition: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359649/trot/images/competition.jpg",
    more: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359651/trot/images/more.jpg",
    technical: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359652/trot/images/technical.avif",
  },
  
  // Helper function to get category image
  getCategoryImage: (category: string): string => {
    const categoryMap: Record<string, string> = {
      creative: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359641/trot/images/creative.jpg",
      mentorships: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359643/trot/images/mentorships.jpg",
      music: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359645/trot/images/music.jpg",
      studies: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359647/trot/images/studies.jpg",
      competition: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359649/trot/images/competition.jpg",
      more: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359651/trot/images/more.jpg",
      technical: "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359652/trot/images/technical.avif",
    };
    return categoryMap[category?.toLowerCase()] || "https://res.cloudinary.com/ducxkpytj/image/upload/v1763359651/trot/images/more.jpg";
  }
};

// For backward compatibility with require() syntax - returns { uri: string } format
export const getImageUri = (imageName: string): { uri: string } => {
  const url = CLOUDINARY_ASSETS.CATEGORY_IMAGES[imageName as keyof typeof CLOUDINARY_ASSETS.CATEGORY_IMAGES] || 
              CLOUDINARY_ASSETS.DEFAULT_AVATAR;
  return { uri: url };
};

