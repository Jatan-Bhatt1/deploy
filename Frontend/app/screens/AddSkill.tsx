import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postJson, resolveApiBase } from "../../lib/api";
import { useRouter } from "expo-router";
import { skillCategories } from "../data/skillCategories";
import { useTheme } from "../theme/ThemeContext";

export default function AddSkill() {
  const router = useRouter();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  // Backend expects these exact category enums
  const allowedCategories = [
    "Technical",
    "Creative",
    "Mentorship",
    "Music and Dance",
    "Primary and Secondary",
    "Competition",
    "More",
    "Finance",
    "Hardware",
    "Gaming",
  ] as const;
  type AllowedCategory = (typeof allowedCategories)[number];
  const [category, setCategory] = useState<AllowedCategory>(allowedCategories[0]);
  const [selectedSkillNames, setSelectedSkillNames] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sharedSkills, setSharedSkills] = useState<{ name: string; description: string; usageCount: number }[]>([]);
  const [loadingSharedSkills, setLoadingSharedSkills] = useState(false);

  const canSubmit = useMemo(
    () => (name.trim().length > 0 || selectedSkillNames.size > 0) && !!category,
    [name, selectedSkillNames, category]
  );

  // Map backend category enums to our in-app category ids for suggestions
  const suggestionCategoryMap: Record<AllowedCategory, string | null> = {
    Technical: "technical",
    Creative: "creative",
    Mentorship: "engineering",
    "Music and Dance": "creative",
    "Primary and Secondary": "science",
    Competition: "science",
    More: "personal",
    Finance: "business",
    Hardware: "engineering",
    Gaming: "technical",
  };

  const skillsForCategory = useMemo(() => {
    const mappedId = suggestionCategoryMap[category];
    const cat = skillCategories.find(c => c.id === mappedId);
    return cat?.skills || [];
  }, [category]);

  // Fetch shared skills when category changes
  useEffect(() => {
    const fetchSharedSkills = async () => {
      setLoadingSharedSkills(true);
      try {
        const base = resolveApiBase();
        const response = await fetch(`${base}/api/skills/shared/${encodeURIComponent(category)}`);
        if (response.ok) {
          const data = await response.json();
          setSharedSkills(data.skills || []);
        } else {
          setSharedSkills([]);
        }
      } catch (error) {
        console.error("Error fetching shared skills:", error);
        setSharedSkills([]);
      } finally {
        setLoadingSharedSkills(false);
      }
    };

    fetchSharedSkills();
  }, [category]);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log('Token found:', token ? 'Yes' : 'No'); // Debug token presence
      if (!token) {
        alert('Please log in again to add skills');
        router.push('/login');
        return;
      }
      // Build list of skills to save (multi-select + typed name if provided)
      const namesToSave = new Set<string>();
      if (name.trim().length > 0) namesToSave.add(name.trim());
      selectedSkillNames.forEach((n) => n && namesToSave.add(n));

      for (const n of namesToSave) {
        const resp = await postJson(
          "/api/skills",
          {
            name: n,
            category, // send backend enum value
            description,
            experience,
            proofUrl,
          },
          token ? { Authorization: `Bearer ${token}` } : {}
        );
        const contentType: string = resp.headers.get("content-type") || "";
        let data: any = null;
        try {
          if (contentType.includes("application/json")) {
            data = await resp.json();
          } else {
            data = await resp.text();
          }
        } catch {
          try { data = await resp.text(); } catch { data = null; }
        }
        if (!resp.ok) {
          const message =
            data && typeof data === "object" && data.message
              ? data.message
              : typeof data === "string" && data.length
              ? data
              : `Failed to add skill (${resp.status})`;
          alert(message);
          setSubmitting(false);
          return;
        }
      }
      alert("Skills saved successfully");
      router.back();
    } catch (e: any) {
      alert(e?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: theme.text }]}>Add Skill</Text>

      <Text style={[styles.label, { color: theme.text }]}>Category</Text>
      <View style={styles.pillRow}>
        {allowedCategories.map((opt) => {
          const active = category === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setCategory(opt)}
              style={[
                styles.pill,
                { backgroundColor: active ? theme.primary : theme.secondaryBackground, borderColor: active ? theme.primary : theme.border },
                active && styles.pillActive
              ]}
            >
              <Text style={[styles.pillText, { color: active ? "#fff" : theme.text }, active && styles.pillTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Skill</Text>
      <TextInput
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        placeholder="e.g., React Native"
        placeholderTextColor={theme.muted}
        value={name}
        onChangeText={setName}
      />
      {/* Default skills from app data */}
      {!!skillsForCategory.length && (
        <View style={styles.pillRow}>
          {skillsForCategory.map((s) => {
            const isSelected = selectedSkillNames.has(s.name || "");
            return (
                <TouchableOpacity
                key={s.name}
                onPress={() => {
                  const label = s.name || "";
                  const next = new Set(selectedSkillNames);
                  if (next.has(label)) next.delete(label); else next.add(label);
                  setSelectedSkillNames(next);
                  if (!name) setName(label);
                  if (s.description && !description) setDescription(s.description);
                }}
                style={[
                  styles.pill,
                  { backgroundColor: isSelected ? theme.primary : theme.secondaryBackground, borderColor: isSelected ? theme.primary : theme.border },
                  isSelected && styles.pillActive
                ]}
              >
                <Text style={[styles.pillText, { color: isSelected ? "#fff" : theme.text }, isSelected && styles.pillTextActive]}>{s.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Shared skills from other users */}
      {!!sharedSkills.length && (
        <>
          <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Popular Skills (from other users)</Text>
          <View style={styles.pillRow}>
            {sharedSkills.map((s) => {
              const isSelected = selectedSkillNames.has(s.name || "");
              return (
                  <TouchableOpacity
                  key={s.name}
                  onPress={() => {
                    const label = s.name || "";
                    const next = new Set(selectedSkillNames);
                    if (next.has(label)) next.delete(label); else next.add(label);
                    setSelectedSkillNames(next);
                    if (!name) setName(label);
                    if (s.description && !description) setDescription(s.description);
                  }}
                  style={[
                    styles.pill,
                    { backgroundColor: isSelected ? theme.primary : theme.secondaryBackground, borderColor: isSelected ? theme.primary : theme.border },
                    isSelected && styles.pillActive
                  ]}
                >
                  <Text style={[styles.pillText, { color: isSelected ? "#fff" : theme.text }, isSelected && styles.pillTextActive]}>{s.name}</Text>
                  {s.usageCount > 1 && (
                    <Text style={[styles.usageCount, { color: isSelected ? "#fff" : theme.muted }]}>
                      ({s.usageCount} users)
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {loadingSharedSkills && (
        <Text style={[styles.label, { color: theme.muted, textAlign: "center" }]}>Loading popular skills...</Text>
      )}

      <Text style={[styles.label, { color: theme.text }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        placeholder="Brief description"
        placeholderTextColor={theme.muted}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={[styles.label, { color: theme.text }]}>Experience</Text>
      <TextInput
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        placeholder="Years or short summary"
        placeholderTextColor={theme.muted}
        value={experience}
        onChangeText={setExperience}
      />

      <Text style={[styles.label, { color: theme.text }]}>Any proof (URL)</Text>
      <TextInput
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        placeholder="Link to portfolio, certificate, etc."
        placeholderTextColor={theme.muted}
        value={proofUrl}
        onChangeText={setProofUrl}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.primaryBtn, (!canSubmit || submitting) && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || submitting}
      >
        <Text style={styles.primaryBtnText}>{submitting ? "Saving..." : selectedSkillNames.size > 1 ? `Save ${selectedSkillNames.size} Skills` : "Save Skill"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  cardActive: {
    borderColor: "#00e0ff",
    shadowColor: "#00e0ff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#111",
    resizeMode: "cover",
  },
  cardTitle: { color: "#e5e7eb", fontWeight: "700" },
  cardTitleActive: { color: "#00e0ff" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1a202c",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    color: "#1a202c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#f8fafc",
  },
  pillActive: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  pillText: {
    color: "#1a202c",
  },
  pillTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  usageCount: {
    fontSize: 10,
    marginTop: 2,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});


