const Skill = require("../models/Skill");
const EnhancedProfile = require("../models/EnhancedProfile");
const SharedSkill = require("../models/SharedSkill");

exports.createSkill = async (req, res) => {
  try {
    const { name, category, description, experience, proofUrl } = req.body || {};

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    // Create the skill
    const skill = await Skill.create({
      userId: req.user._id,
      name,
      category,
      description: description || "",
      experience: experience || "",
      proofUrl: proofUrl || "",
    });

    // Add skill to enhanced profile
    let profile = await EnhancedProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      // Create enhanced profile if it doesn't exist
      profile = await EnhancedProfile.create({
        userId: req.user._id,
        skills: [skill._id]
      });
    } else {
      // Add skill to existing profile
      profile.skills = profile.skills || [];
      profile.skills.push(skill._id);
      await profile.save();
    }

    // Add to shared skills collection (for all users to see)
    try {
      const existingSharedSkill = await SharedSkill.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive match
        category 
      });
      
      if (existingSharedSkill) {
        // If skill already exists, increment usage count
        existingSharedSkill.usageCount += 1;
        await existingSharedSkill.save();
      } else {
        // Create new shared skill
        await SharedSkill.create({
          name,
          category,
          description: description || "",
          addedBy: req.user._id,
          usageCount: 1
        });
      }
    } catch (sharedSkillError) {
      console.error("Error adding to shared skills:", sharedSkillError);
      // Don't fail the main operation if shared skill creation fails
    }

    // Return the created skill with profile info
    const populatedSkill = await Skill.findById(skill._id)
      .populate('userId', 'name email avatarUrl');

    return res.status(201).json({
      skill: populatedSkill,
      message: "Skill added successfully to your profile"
    });
  } catch (err) {
    console.error("Error creating skill:", err);
    return res.status(500).json({ message: err.message || "Failed to create skill" });
  }
};

exports.listMySkills = async (req, res) => {
  try {
    // Get skills with user information
    const skills = await Skill.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('name category description experience proofUrl')
      .lean();

    return res.json({
      skills: skills.map(skill => ({
        name: skill.name || '',
        category: skill.category || '',
        description: skill.description || '',
        experience: skill.experience || '',
        proofUrl: skill.proofUrl || ''
      }))
    });
  } catch (err) {
    console.error("Error fetching skills:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch skills" });
  }
};

// Get all shared skills by category (for skill suggestions)
exports.getSharedSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({ message: "Category parameter is required" });
    }

    // Get shared skills for the category, sorted by usage count (most popular first)
    const sharedSkills = await SharedSkill.find({ category })
      .sort({ usageCount: -1, name: 1 })
      .select('name description usageCount')
      .lean();

    return res.json({
      skills: sharedSkills.map(skill => ({
        name: skill.name || '',
        description: skill.description || '',
        usageCount: skill.usageCount || 0
      }))
    });
  } catch (err) {
    console.error("Error fetching shared skills:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch shared skills" });
  }
};

// Get users who have a specific skill
exports.getUsersWithSkill = async (req, res) => {
  try {
    const { skillName, category } = req.query;
    
    if (!skillName || !category) {
      return res.status(400).json({ message: "Skill name and category are required" });
    }

    // Find users who have this skill
    const skills = await Skill.find({ 
      name: { $regex: new RegExp(`^${skillName}$`, 'i') }, // Case-insensitive match
      category 
    })
    .populate('userId', 'name email avatarUrl')
    .select('userId description experience')
    .lean();

    // Group by user and get unique users
    const userMap = new Map();
    skills.forEach(skill => {
      if (skill.userId) {
        const userId = skill.userId._id.toString();
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            _id: skill.userId._id,
            name: skill.userId.name,
            email: skill.userId.email,
            avatarUrl: skill.userId.avatarUrl,
            skillDescription: skill.description,
            skillExperience: skill.experience
          });
        }
      }
    });

    const users = Array.from(userMap.values());

    return res.json({
      skillName,
      category,
      users,
      totalUsers: users.length
    });
  } catch (err) {
    console.error("Error fetching users with skill:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch users with skill" });
  }
};

// Get teachers/users who have a specific skill by skill name
exports.getTeachersBySkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    if (!skillName) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    // Find all users who have this skill (case-insensitive)
    const skills = await Skill.find({ 
      name: { $regex: new RegExp(`^${skillName}$`, 'i') }
    })
    .populate('userId', 'name email avatarUrl')
    .select('name category description experience proofUrl userId')
    .lean();

    if (!skills || skills.length === 0) {
      return res.json([]);
    }

    // Transform to the expected format
    const teachers = skills.map(skill => ({
      _id: skill._id,
      name: skill.name,
      category: skill.category,
      description: skill.description || '',
      experience: skill.experience || '',
      proofUrl: skill.proofUrl || '',
      userId: {
        _id: skill.userId._id,
        name: skill.userId.name,
        email: skill.userId.email
      },
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt
    }));

    return res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch teachers" });
  }
};

