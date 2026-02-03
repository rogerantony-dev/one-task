import { colors } from "@/theme";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native";

export interface KeyValue {
  key: string;
  value: string;
}

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  const update = (index: number, field: "key" | "value", value: string) => {
    const next = [...items];
    if (!next[index]) next[index] = { key: "", value: "" };
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const add = () => onChange([...items, { key: "", value: "" }]);
  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index));

  const list = items.length ? items : [{ key: "", value: "" }];

  return (
    <View style={styles.container}>
      {list.map((item, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={[styles.input, styles.keyInput]}
            placeholder={keyPlaceholder}
            placeholderTextColor={colors.placeholder}
            value={item.key}
            onChangeText={(v) => update(index, "key", v)}
          />
          <TextInput
            style={[styles.input, styles.valueInput]}
            placeholder={valuePlaceholder}
            placeholderTextColor={colors.placeholder}
            value={item.value}
            onChangeText={(v) => update(index, "value", v)}
          />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => remove(index)}
          >
            <Text style={styles.removeText}>−</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={add}>
        <Text style={styles.addText}>+ Add row</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  keyInput: { flex: 1, minWidth: 80 },
  valueInput: { flex: 2, minWidth: 100 },
  removeBtn: {
    width: 28,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.removeBg,
    borderRadius: 6,
  },
  removeText: { color: colors.remove, fontSize: 16, fontWeight: "bold" },
  addBtn: {
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    borderStyle: "dashed",
  },
  addText: { color: colors.primary, fontSize: 13 },
});
