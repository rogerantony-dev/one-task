import { colors } from "@/theme";
import type { CollectionInsert } from "@/lib/db";
import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type CollectionFormProps = {
  visible: boolean;
  initial?: Partial<CollectionInsert> & { id?: number };
  onSave: (data: CollectionInsert) => Promise<void>;
  onCancel: () => void;
};

export function CollectionForm({
  visible,
  initial,
  onSave,
  onCancel,
}: CollectionFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [baseUrlProd, setBaseUrlProd] = useState(initial?.baseUrlProd ?? "");
  const [baseUrlDev, setBaseUrlDev] = useState(initial?.baseUrlDev ?? "");
  const [baseUrlCustom, setBaseUrlCustom] = useState(initial?.baseUrlCustom ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        name: name.trim() || "Unnamed",
        baseUrlProd: baseUrlProd.trim(),
        baseUrlDev: baseUrlDev.trim() || null,
        baseUrlCustom: baseUrlCustom.trim() || null,
      });
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {initial?.id != null ? "Edit collection" : "New collection"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Collection name"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Text style={styles.label}>Prod base URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://api.example.com"
            placeholderTextColor={colors.placeholder}
            value={baseUrlProd}
            onChangeText={setBaseUrlProd}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Dev base URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://dev-api.example.com"
            placeholderTextColor={colors.placeholder}
            value={baseUrlDev}
            onChangeText={setBaseUrlDev}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Custom base URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://custom.example.com"
            placeholderTextColor={colors.placeholder}
            value={baseUrlCustom}
            onChangeText={setBaseUrlCustom}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: { color: colors.muted, fontSize: 15 },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: colors.white, fontWeight: "600", fontSize: 15 },
});
