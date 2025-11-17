import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Linking,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header, { SearchBar, TopBar, Greeting } from "../_components/Header";
import FooterBar from "../_components/Footerbar";
import { useTheme } from "../theme/ThemeContext";
import { skillCategories, type SkillCategory } from "../data/skillCategories";
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";

const { width } = Dimensions.get("window");
const router = useRouter();

export default function Dashboard() {
  const { theme } = useTheme();
  const [userName, setUserName] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rating, setRating] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [contactModal, setContactModal] = useState(false);
  const [suggestionModal, setSuggestionModal] = useState(false);
  const [termsModal, setTermsModal] = useState(false);

  // ✅ Fetch user name from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const cached =
          (globalThis as any).__USER_NAME__ ||
          (await AsyncStorage.getItem("userName"));
        if (cached) setUserName(cached);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  // ✅ Updated routes (exactly matching App.tsx names)
  const cards = [
    {
      title: "Creative",
      color: "#B2E7C9",
      image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.creative },
      route: "screens/batches/creative",
    },
    {
      title: "Mentorships",
      color: "#FFD6A5",
      image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.mentorships },
      route: "screens/batches/mentorships",
    },
    {
      title: "Music & Dance",
      color: "#A7D8FF",
      image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.music },
      route: "screens/batches/music",
    },
    {
      title: "Studies (Primary & Secondary)",
      color: "#D0B3FF",
      image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.studies },
      route: "screens/batches/studies",
    },
    {
      title: "Competitions",
      color: "#FFF59D",
      image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.competition },
      route: "screens/batches/competition",
    },
    {
      title: "More",
      color: "#F6A5C0",
      image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.more },
      route: "screens/batches/more",
    },
  ];

  // ✅ Trending Skills Slider Data
  const trendingSkills = [
    {
      id: 1,
      title: "🔥 Trending Now",
      skillName: "Dance",
      description: "Most visited skill this week! Learn from professional dancers.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&q=80&auto=format&fit=crop",
      category: "creative",
      visits: "2.5K+ visits"
    },
    {
      id: 2,
      title: "⭐ Popular Choice",
      skillName: "Programming",
      description: "Join 500+ students learning coding skills from experts.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop",
      category: "Technical",
      visits: "1.8K+ visits"
    },
    {
      id: 3,
      title: "🎯 Hot Skill",
      skillName: "Music Production",
      description: "Create amazing music with guidance from industry professionals.",
      image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&q=80&auto=format&fit=crop",
      category: "Music and Dance",
      visits: "1.2K+ visits"
    },
    {
      id: 4,
      title: "🚀 Rising Fast",
      skillName: "Digital Marketing",
      description: "Master online marketing strategies with real-world projects.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80&auto=format&fit=crop",
      category: "finance",
      visits: "950+ visits"
    },
  ];

  // Handle slide change
  const handleSlideChange = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (width * 0.8 + 12));
    setCurrentSlide(slideIndex);
  };

  // Handle skill slide press
  const handleSkillSlidePress = (skill: any) => {
    router.push({
      pathname: "/screens/SkillDetail",
      params: { skillName: skill.skillName }
    });
  };

  // Footer section handlers
  const handleContactUs = () => {
    setContactModal(true);
  };

  const handleMyProfile = () => {
    router.push("/screens/Profile");
  };

  const handleSuggestion = () => {
    setSuggestionModal(true);
  };

  const handleTermsConditions = () => {
    setTermsModal(true);
  };

  const handleRateNow = () => {
    Alert.alert(
      "Rate TROT",
      "Thank you for using TROT! Please rate your experience.",
      [
        { text: "Cancel" },
        { text: "Rate on App Store", onPress: () => console.log("Open App Store") },
        { text: "Rate on Play Store", onPress: () => console.log("Open Play Store") }
      ]
    );
  };

  const handleWhatsAppHelp = () => {
    Linking.openURL("https://wa.me/918401487213?text=Hi, I need help with TROT app");
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <TopBar />
      <SearchBar />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Greeting userName={userName} />
        
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>#TrotChange</Text>

          <View style={styles.grid}>
            {cards.map((card, index) => (
              <Card key={index} {...card} />
            ))}
          </View>

          {/* Trending Skills Slider */}
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderTitle, { color: theme.text }]}>🔥 Trending Skills</Text>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToAlignment="center"
              decelerationRate="fast"
              contentContainerStyle={styles.sliderRow}
              onMomentumScrollEnd={handleSlideChange}
            >
              {trendingSkills.map((skill, idx) => (
                <TouchableOpacity
                  key={skill.id}
                  style={styles.slideItem}
                  onPress={() => handleSkillSlidePress(skill)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: skill.image }} style={styles.slideImage} />
                  <View style={styles.slideOverlay}>
                    <View style={styles.slideContent}>
                      <Text style={styles.slideBadge}>{skill.title}</Text>
                      <Text style={styles.slideSkillName}>{skill.skillName}</Text>
                      <Text style={styles.slideDescription}>{skill.description}</Text>
                      <View style={styles.slideFooter}>
                        <Text style={styles.slideCategory}>{skill.category}</Text>
                        <Text style={styles.slideVisits}>{skill.visits}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Dots Indicator */}
            <View style={styles.dotsBar}>
              <View style={styles.dotsContainer}>
                {trendingSkills.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      currentSlide === idx && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.settingsTitle, { color: theme.text }]}>TROT Settings</Text>
            <Text style={[styles.settingsSubtitle, { color: theme.muted }]}>Manage your experience</Text>

            {/* Interactive Cards Grid */}
            <View style={styles.cardsGrid}>
              <TouchableOpacity 
                style={styles.settingsCard} 
                onPress={handleContactUs}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&q=80" }}
                  style={styles.cardImage}
                />
                <View style={styles.cardOverlay}>
                  <View style={styles.cardTextOverlay}>
                    <Text style={styles.cardOverlayTitle}>Contact Us</Text>
                    <Text style={styles.cardOverlaySubtitle}>Get in touch with us</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsCard} 
                onPress={handleMyProfile}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" }}
                  style={styles.cardImage}
                />
                <View style={styles.cardOverlay}>
                  <View style={styles.cardTextOverlay}>
                    <Text style={styles.cardOverlayTitle}>My Profile</Text>
                    <Text style={styles.cardOverlaySubtitle}>View your account</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsCard} 
                onPress={handleSuggestion}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80" }}
                  style={styles.cardImage}
                />
                <View style={styles.cardOverlay}>
                  <View style={styles.cardTextOverlay}>
                    <Text style={styles.cardOverlayTitle}>Suggestions</Text>
                    <Text style={styles.cardOverlaySubtitle}>Share your feedback</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsCard} 
                onPress={handleTermsConditions}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80" }}
                  style={styles.cardImage}
                />
                <View style={styles.cardOverlay}>
                  <View style={styles.cardTextOverlay}>
                    <Text style={styles.cardOverlayTitle}>Terms</Text>
                    <Text style={styles.cardOverlaySubtitle}>Read our policies</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Rate Your Experience Section */}
            <View style={[styles.ratingSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.ratingTitle, { color: theme.text }]}>Rate Your Experience !!</Text>
              <View style={styles.ratingContainer}>
                <TouchableOpacity style={styles.rateButton} onPress={handleRateNow}>
                  <Text style={styles.rateButtonText}>Rate Now</Text>
                </TouchableOpacity>
                <View style={styles.starsDisplay}>
                  {renderStars()}
                </View>
              </View>
            </View>

            {/* Help/Support Section */}
            <View style={[styles.helpSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.helpTitle, { color: theme.text }]}>Do you need our help?</Text>
              <Text style={[styles.helpDescription, { color: theme.muted }]}>
                TROT is available to help you. Please contact us on WhatsApp for queries.
              </Text>
              <View style={styles.helpContainer}>
                <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppHelp}>
                  <Text style={styles.whatsappIcon}>💬</Text>
                  <Text style={styles.whatsappText}>Get the help →</Text>
                </TouchableOpacity>
                <View style={styles.supportIcon}>
                  <Text style={styles.supportEmoji}>🎧</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <FooterBar />

      {/* Contact Us Modal */}
      <Modal visible={contactModal} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>📞 Contact Us</Text>
            <Text style={[styles.modalDescription, { color: theme.muted }]}>
              Get in touch with our support team through your preferred channel
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#E0AA3E' }]}
              onPress={() => {
                setContactModal(false);
                Linking.openURL("mailto:jasoliya28072006@gmail.com");
              }}
            >
              <Text style={styles.modalButtonIcon}>📧</Text>
              <Text style={styles.modalButtonText}>Email Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#25D366' }]}
              onPress={() => {
                setContactModal(false);
                Linking.openURL("https://wa.me/918401487213");
              }}
            >
              <Text style={styles.modalButtonIcon}>💬</Text>
              <Text style={styles.modalButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: theme.secondaryBackground }]}
              onPress={() => setContactModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Suggestion Modal */}
      <Modal visible={suggestionModal} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>💡 Give Suggestion</Text>
            <Text style={[styles.modalDescription, { color: theme.muted }]}>
              We'd love to hear your feedback and suggestions to improve TROT!
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#E0AA3E' }]}
              onPress={() => {
                setSuggestionModal(false);
                Linking.openURL("mailto:jasoliya28072006@gmail.com?subject=TROT Suggestion");
              }}
            >
              <Text style={styles.modalButtonIcon}>📧</Text>
              <Text style={styles.modalButtonText}>Email Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#25D366' }]}
              onPress={() => {
                setSuggestionModal(false);
                Linking.openURL("https://wa.me/918401487213?text=Hi, I have a suggestion for TROT");
              }}
            >
              <Text style={styles.modalButtonIcon}>💬</Text>
              <Text style={styles.modalButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: theme.secondaryBackground }]}
              onPress={() => setSuggestionModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal visible={termsModal} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>📄 Terms & Conditions</Text>
            <ScrollView style={styles.termsContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.termsText, { color: theme.text }]}>
                Welcome to TROT! By using our platform, you agree to the following terms:{'\n\n'}
                
                <Text style={{ fontWeight: 'bold' }}>1. User Responsibilities{'\n'}</Text>
                • Provide accurate information{'\n'}
                • Maintain account security{'\n'}
                • Respect other users{'\n\n'}
                
                <Text style={{ fontWeight: 'bold' }}>2. Skills & Mentorship{'\n'}</Text>
                • Share genuine skills and experience{'\n'}
                • Be professional in interactions{'\n'}
                • Honor commitments made{'\n\n'}
                
                <Text style={{ fontWeight: 'bold' }}>3. Credits System{'\n'}</Text>
                • Credits are for platform services{'\n'}
                • Non-refundable once transferred{'\n'}
                • Use responsibly{'\n\n'}
                
                <Text style={{ fontWeight: 'bold' }}>4. Privacy{'\n'}</Text>
                • We protect your data{'\n'}
                • Don't share sensitive information publicly{'\n'}
                • Report any concerns{'\n\n'}
                
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Last updated: November 2025{'\n'}
                  For questions: jasoliya28072006@gmail.com
                </Text>
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#E0AA3E', marginTop: 12 }]}
              onPress={() => setTermsModal(false)}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Card({ title, color, image, route }: any) {
  const router = useRouter();

  const handlePress = () => {
    try {
      router.push(`/${route}`);
    } catch (err) {
      console.warn(`⚠️ Failed to navigate to route: ${route}`, err);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.categoryCard, { backgroundColor: color }]}
      onPress={handlePress}
    >
      {image && <Image source={image} style={styles.categoryCardImage} />}
      <Text style={styles.categoryCardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}


const CARD_WIDTH = width * 0.42;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { backgroundColor: "#FFFFFF", paddingHorizontal: 20 },
  scrollContainer: {
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 20,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  sliderContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  sliderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  sliderRow: {
    paddingHorizontal: 20,
  },
  slideItem: {
    width: width * 0.85,
    height: 220,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  slideImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  slideOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: 20,
  },
  slideContent: {
    flex: 1,
  },
  slideBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFA500",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slideSkillName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  slideDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 19,
    marginBottom: 10,
  },
  slideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slideCategory: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  slideVisits: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    opacity: 0.9,
  },
  dotsBar: {
    backgroundColor: "#2563EB",
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  settingsSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  settingsTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 24,
    fontWeight: "400",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  settingsCard: {
    width: "48%",
    height: 140,
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    padding: 14,
  },
  cardTextOverlay: {
    gap: 2,
  },
  cardOverlayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardOverlaySubtitle: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.85,
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  cardEmoji: {
    fontSize: 18,
  },
  cardTextContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
    paddingBottom: 16,
  },
  cardNewTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  cardIcon: {
    position: "absolute",
    right: 12,
    top: 12,
    opacity: 0.3,
  },
  iconText: {
    fontSize: 24,
  },
  ratingSection: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rateButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  rateButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  starsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    padding: 2,
    marginHorizontal: 1,
  },
  star: {
    fontSize: 22,
    color: "#E5E7EB",
  },
  starFilled: {
    color: "#FBBF24",
  },
  helpSection: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  helpDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
    marginBottom: 18,
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 16,
  },
  whatsappIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  whatsappText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  supportIcon: {
    alignItems: "center",
  },
  supportEmoji: {
    fontSize: 40,
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 130,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryCardImage: {
    width: 48,
    height: 48,
    marginBottom: 10,
    resizeMode: "contain",
  },
  categoryCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#2d2d2d",
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 21,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0AA3E",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  modalButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  modalButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  modalCancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  termsContent: {
    maxHeight: 300,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#333333",
  },
});
