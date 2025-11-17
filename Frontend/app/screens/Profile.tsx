import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FooterBar from "../_components/Footerbar";
import { useRouter } from "expo-router";
import { resolveApiBase } from "../../lib/api";
import { useTheme } from '../theme/ThemeContext';

const PROFILE_MENU = [
  { key: "my-profile", label: "My Profile", icon: "person-circle-outline" },
  {
    key: "enhance-profile",
    label: "Enhance Profile",
    icon: "person-add-outline",
  },
  { key: "add-skills", label: "Add Skills", icon: "construct-outline" },
  { key: "create-avatar", label: "Create Avatar", icon: "color-wand-outline" },
];

export default function Profile() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [avatarModal, setAvatarModal] = useState(false);
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const [readOnlyEnhanceOpen, setReadOnlyEnhanceOpen] = useState(false);
  const [myProfileOpen, setMyProfileOpen] = useState(false);
  const [enhancedProfile, setEnhancedProfile] = useState<null | {
    gender: string | null;
    dob: string | null;
    role: string | null;
    phone: string | null;
    education: string | null;
  }>(null);
  const initialFallback = Image.resolveAssetSource(
    require("../../assets/images/default-avatar.jpg")
  ).uri;
  const [avatarUrl, setAvatarUrl] = useState(initialFallback);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [skills, setSkills] = useState<{ name: string, category: string }[]>([]);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      const [yy, mm, dd] = dob.split("-").map((x) => parseInt(x, 10));
      return new Date(yy, mm - 1, dd);
    }
    return new Date(2000, 0, 1);
  });

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem("avatarUrl");
        if (cached) {
          setAvatarUrl(cached);
          (globalThis as any).__AVATAR_URL__ = cached;
        }
        const cachedName =
          (globalThis as any).__USER_NAME__ ||
          (await AsyncStorage.getItem("userName"));
        const cachedEmail =
          (globalThis as any).__USER_EMAIL__ ||
          (await AsyncStorage.getItem("userEmail"));
        if (cachedName) setName(cachedName);
        if (cachedEmail) setEmail(cachedEmail);
      } catch {}
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.secondaryBackground }]}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={[styles.name, { color: theme.text }]}>{name || "Your Name"}</Text>
          <Text style={[styles.email, { color: theme.muted }]}>{email || "your@email.com"}</Text>
        </View>
      </View>

      <FlatList
        data={PROFILE_MENU}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: theme.surface }]}
            onPress={async () => {
              if (item.key === "create-avatar") {
                setAvatarModal(true);
                return;
              }
              if (item.key === "add-skills") {
                router.push("/screens/AddSkill");
                return;
              }
              if (item.key === "my-profile") {
                try {
                  const token = await AsyncStorage.getItem("authToken");
                  const base = resolveApiBase();
                  const resp = await fetch(`${base}/api/settings/enhanced`, {
                    method: "GET",
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                  });
                  let data: any = null;
                  try {
                    data = await resp.json();
                  } catch {}
                  if (resp.ok && data) {
                    setEnhancedProfile({
                      gender: data.gender ?? null,
                      dob: data.dob ? String(data.dob).slice(0, 10) : null,
                      role: data.role ?? null,
                      phone: data.phone ?? null,
                      education: data.education ?? null,
                    });
                  }

                  // Fetch user skills
                  try {
                    const skillsResp = await fetch(`${base}/api/skills/mine`, {
                      method: "GET",
                      headers: { Authorization: token ? `Bearer ${token}` : "" },
                    });
                    const skillsData = await skillsResp.json();
                    if (skillsResp.ok && Array.isArray(skillsData.skills)) {
                      setSkills(skillsData.skills.map((skill: any) => ({
                        name: skill.name || '',
                        category: skill.category || '',
                        description: skill.description || '',
                        experience: skill.experience || '',
                        proofUrl: skill.proofUrl || ''
                      })));
                    } else {
                      setSkills([]);
                    }
                  } catch {
                    setSkills([]);
                  }
                } catch {}
                setMyProfileOpen(true);
                return;
              }
              if (item.key === "enhance-profile") {
                try {
                  const token = await AsyncStorage.getItem("authToken");
                  const base = resolveApiBase();
                  const resp = await fetch(`${base}/api/settings/enhanced`, {
                    method: "GET",
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                  });
                  let data: any = null;
                  try {
                    data = await resp.json();
                  } catch {}
                  // Prefill editor with existing values (if any) and open editor always
                  if (data) {
                    setEnhancedProfile({
                      gender: data.gender ?? null,
                      dob: data.dob ? String(data.dob).slice(0, 10) : null,
                      role: data.role ?? null,
                      phone: data.phone ?? null,
                      education: data.education ?? null,
                    });
                    setGender((data.gender ?? "") as string);
                    setDob(data.dob ? String(data.dob).slice(0, 10) : "");
                    setRole((data.role ?? "") as string);
                    setPhone((data.phone ?? "") as string);
                    setEducation((data.education ?? "") as string);
                  }
                  setEnhanceOpen(true);
                } catch {
                  setEnhanceOpen(true);
                }
                return;
              }
            }}
          >
            <Text style={[styles.rowLabel, { color: theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={avatarModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Your Avatar</Text>
            <Text style={[styles.modalHint, { color: theme.muted }]}>
              Pick a photo from your device, then Save
            </Text>
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: theme.secondaryBackground, marginTop: 12, alignSelf: "flex-start" },
              ]}
              onPress={async () => {
                try {
                  const perm =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (perm.status !== "granted") return;
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                  });
                  if (result.canceled) return;
                  const asset = result.assets?.[0];
                  if (!asset?.uri) return;
                  setPendingAvatarUri(asset.uri);
                } catch (_) {
                  alert("Upload failed. Check network/API base.");
                }
              }}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>
                Choose from Library
              </Text>
            </TouchableOpacity>

            <View style={styles.previewRow}>
              <View style={styles.previewCol}>
                <Text style={[styles.previewLabel, { color: theme.muted }]}>Your Photo</Text>
                <Image
                  source={{ uri: pendingAvatarUri || avatarUrl }}
                  style={styles.previewImg}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.secondaryBackground }]}
                onPress={() => setAvatarModal(false)}
              >
                <Text style={[styles.btnText, { color: theme.text }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!pendingAvatarUri}
                style={[
                  styles.btn,
                  { backgroundColor: theme.primary },
                  !pendingAvatarUri && { opacity: 0.6 },
                ]}
                onPress={async () => {
                  try {
                    if (!pendingAvatarUri) return;
                    const token = await (
                      await import("@react-native-async-storage/async-storage")
                    ).default.getItem("authToken");
                    const form = new FormData();
                    // React Native FormData accepts a file-like object with uri/name/type
                    // Cast to any to satisfy DOM lib typing in RN environment
                    form.append("avatar", {
                      uri: pendingAvatarUri,
                      name: "avatar.jpg",
                      type: "image/jpeg",
                    } as unknown as any);
                    const base = resolveApiBase();
                    const resp = await fetch(`${base}/api/avatar/upload`, {
                      method: "POST",
                      headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                      },
                      body: form,
                    });
                    let data: any = null;
                    try {
                      data = await resp.json();
                    } catch {}
                    if (!resp.ok) {
                      alert(
                        (data && data.message) ||
                          `Upload failed (${resp.status})`
                      );
                      return;
                    }
                    if (data?.avatarUrl) {
                      setAvatarUrl(data.avatarUrl);
                      (globalThis as any).__AVATAR_URL__ = data.avatarUrl;
                      const AsyncStorage = (
                        await import(
                          "@react-native-async-storage/async-storage"
                        )
                      ).default;
                      await AsyncStorage.setItem("avatarUrl", data.avatarUrl);
                      setPendingAvatarUri("");
                      setAvatarModal(false);
                    }
                  } catch (_) {
                    alert("Upload failed. Check API base and token.");
                  }
                }}
              >
                <Text style={[styles.btnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={enhanceOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Enhance Profile</Text>
            <Text style={[styles.modalHint, { color: theme.muted }]}>
              Add more details to personalize your account
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.muted }]}>Gender</Text>
            <View style={styles.radioRow}>
              {[
                { key: "male", label: "Male" },
                { key: "female", label: "Female" },
                { key: "other", label: "Other" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.radioItem}
                  onPress={() => setGender(opt.key)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: gender === opt.key ? theme.primary : theme.muted },
                      gender === opt.key && styles.radioOuterActive,
                    ]}
                  >
                    {gender === opt.key && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
                  </View>
                  <Text style={[styles.radioLabel, { color: theme.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: theme.muted }]}>Date of Birth</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center", backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => {
                const init = /^\d{4}-\d{2}-\d{2}$/.test(dob)
                  ? new Date(
                      parseInt(dob.slice(0, 4), 10),
                      parseInt(dob.slice(5, 7), 10) - 1,
                      parseInt(dob.slice(8, 10), 10)
                    )
                  : new Date(2000, 0, 1);
                setSelectedDate(init);
                setDobPickerOpen(true);
              }}
            >
              <Text style={{ color: dob ? theme.text : theme.muted }}>
                {dob || "Choose date"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.fieldLabel, { color: theme.muted }]}>Role</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center", backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setRolePickerOpen(true)}
            >
              <Text style={{ color: role ? theme.text : theme.muted }}>
                {role || "Select role (student/professional/other)"}
              </Text>
            </TouchableOpacity>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor={theme.muted}
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              keyboardType="phone-pad"
              onChangeText={(t) => setPhone(t)}
              value={phone}
            />
            <TextInput
              placeholder="Education"
              placeholderTextColor={theme.muted}
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              onChangeText={(t) => setEducation(t)}
              value={education}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.secondaryBackground }]}
                onPress={() => setEnhanceOpen(false)}
              >
                <Text style={[styles.btnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  try {
                    const token = await AsyncStorage.getItem("authToken");
                    const base = resolveApiBase();
                    // Normalize gender strictly: trim + lowercase, then whitelist
                    const inputGender = (gender || "").trim().toLowerCase();
                    const normalizedGender = [
                      "male",
                      "female",
                      "other",
                    ].includes(inputGender)
                      ? inputGender
                      : "other";
                    const resp = await fetch(`${base}/api/settings/enhanced`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                      },
                      body: JSON.stringify({
                        gender: normalizedGender,
                        dob,
                        role,
                        phone,
                        education,
                      }),
                    });
                    let data: any = null;
                    try {
                      data = await resp.json();
                    } catch {}
                    if (!resp.ok) {
                      alert(
                        (data && data.message) ||
                          `Failed to save (${resp.status})`
                      );
                      return;
                    }
                    setEnhanceOpen(false);
                    // show read-only with saved details
                    setEnhancedProfile({
                      gender: data?.gender ?? normalizedGender,
                      dob: data?.dob
                        ? String(data.dob).slice(0, 10)
                        : dob || null,
                      role: data?.role ?? (role || null),
                      phone: data?.phone ?? (phone || null),
                      education: data?.education ?? (education || null),
                    });
                    setReadOnlyEnhanceOpen(true);
                  } catch (_) {
                    alert("Network error. Check API base and firewall.");
                  }
                }}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Read-only Enhanced Profile Modal */}
      <Modal visible={readOnlyEnhanceOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Enhanced Profile</Text>
            <Text style={[styles.modalHint, { color: theme.muted }]}>
              These details are locked. Edit later from Settings.
            </Text>

            <View style={{ marginTop: 12, gap: 12 }}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Gender</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.gender
                    ? enhancedProfile.gender.charAt(0).toUpperCase() +
                      enhancedProfile.gender.slice(1)
                    : "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Date of Birth</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.dob || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Role</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.role
                    ? enhancedProfile.role.charAt(0).toUpperCase() +
                      enhancedProfile.role.slice(1)
                    : "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Phone</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.phone || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Education</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.education || "—"}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.secondaryBackground }]}
                onPress={() => setReadOnlyEnhanceOpen(false)}
              >
                <Text style={[styles.btnText, { color: theme.text }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  // Prefill editor with current values and switch to edit modal
                  setGender((enhancedProfile?.gender ?? '') as string);
                  setDob(enhancedProfile?.dob ?? '');
                  setRole((enhancedProfile?.role ?? '') as string);
                  setPhone((enhancedProfile?.phone ?? '') as string);
                  setEducation((enhancedProfile?.education ?? '') as string);
                  setReadOnlyEnhanceOpen(false);
                  setEnhanceOpen(true);
                }}
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* My Profile - read-only details */}
      <Modal visible={myProfileOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>My Profile</Text>
            <Text style={[styles.modalHint, { color: theme.muted }]}>Your account details</Text>

            <View style={{ alignItems: "center", marginTop: 12 }}>
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 90, height: 90, borderRadius: 45 }}
              />
            </View>

            <View style={{ marginTop: 16, gap: 12 }}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Username</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {name || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Email</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {email || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Gender</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {(enhancedProfile?.gender &&
                    enhancedProfile.gender.charAt(0).toUpperCase() +
                      enhancedProfile.gender.slice(1)) ||
                    "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Date of Birth</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.dob || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Role</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {(enhancedProfile?.role &&
                    enhancedProfile.role.charAt(0).toUpperCase() +
                      enhancedProfile.role.slice(1)) ||
                    "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Phone Number</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.phone || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Education</Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {enhancedProfile?.education || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.muted }]}>Skills</Text>
                <Text style={[styles.detailValue, { flex: 1, textAlign: "left", color: theme.text }]} numberOfLines={0}>
                  {skills.length 
                    ? skills.map(skill => `${skill.name} (${skill.category})`).join("\n") 
                    : "—"}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.primary }]}
                onPress={() => setMyProfileOpen(false)}
              >
                <Text style={[styles.btnText, { color: '#fff' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DOB Picker (system calendar) */}
      {dobPickerOpen && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "android" ? "calendar" : "spinner"}
          maximumDate={new Date()}
          themeVariant={isDark ? "dark" : "light"}
          onChange={(event, date) => {
            if (Platform.OS === "android") setDobPickerOpen(false);
            if (!date) return;
            const today = new Date();
            const safe = date > today ? today : date;
            setSelectedDate(safe);
            const y = safe.getFullYear();
            const m = String(safe.getMonth() + 1).padStart(2, "0");
            const d = String(safe.getDate()).padStart(2, "0");
            setDob(`${y}-${m}-${d}`);
          }}
          onTouchCancel={() => setDobPickerOpen(false)}
        />
      )}

      {/* Role Picker Modal */}
      <Modal visible={rolePickerOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Role</Text>
            {(["student", "professional", "other"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.row, { paddingHorizontal: 0, backgroundColor: theme.surface }]}
                onPress={() => {
                  setRole(opt);
                  setRolePickerOpen(false);
                }}
              >
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  {opt[0].toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.secondaryBackground }]}
                onPress={() => setRolePickerOpen(false)}
              >
                <Text style={[styles.btnText, { color: theme.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FooterBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // backgroundColor set via theme
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  }, // backgroundColor set via theme
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  name: { fontSize: 18, fontWeight: "700" }, // color set via theme
  email: { fontSize: 13 }, // color set via theme
  separator: { height: 1 }, // backgroundColor set via theme
  row: {
    paddingVertical: 14,
    paddingHorizontal: 8,
  }, // backgroundColor set via theme
  rowLabel: { fontSize: 16 }, // color set via theme
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff", // Keep light for modal
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1a202c" }, // Dark text on light modal
  modalHint: { marginTop: 4, color: "#4a5568" }, // Muted text on light modal
  readonlyText: { marginTop: 4, color: "#1a202c" },
  fieldLabel: { marginTop: 12, color: "#4a5568", fontWeight: "600" },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: "#1a202c",
    backgroundColor: "#ffffff",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 6,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    minWidth: 0,
    overflow: "visible",
  },
  radioLeft: { flex: 1, justifyContent: "flex-start" },
  radioCenter: { flex: 1, justifyContent: "center" },
  radioRight: { flex: 1, justifyContent: "flex-end" },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: "#1a202c" },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1a202c",
  },
  radioLabel: {
    color: "#1a202c",
    fontSize: 14,
    includeFontPadding: false,
    textAlignVertical: "center",
    lineHeight: 18,
    paddingRight: 2,
    flexShrink: 0,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  detailLabel: { width: 140, color: "#4a5568" }, // Muted text for labels
  detailValue: { flex: 1, textAlign: "right", color: "#1a202c" }, // Dark text for values
  previewRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  previewCol: { flex: 1 },
  previewLabel: { fontSize: 12, marginBottom: 6, color: "#4a5568" }, // Muted text for preview label
  previewImg: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnSecondary: { backgroundColor: "#e2e8f0" },
  btnPrimary: { backgroundColor: "#1a202c" },
  btnText: { color: "#ffffff", fontWeight: "600" },
});

