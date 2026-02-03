import { colors } from "@/theme";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface JsonTreeProps {
  data: unknown;
  depth?: number;
}

export function JsonTree({ data, depth = 0 }: JsonTreeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const indent = depth * 12;

  if (data === null || data === undefined) {
    return <Text style={[styles.value, styles.null]}>{String(data)}</Text>;
  }

  if (typeof data !== "object") {
    const str = typeof data === "string" ? `"${data}"` : String(data);
    return (
      <Text
        style={[styles.value, typeof data === "string" && styles.string]}
        selectable
      >
        {str}
      </Text>
    );
  }

  if (Array.isArray(data)) {
    const isOpen = !collapsed;
    return (
      <View style={[styles.node, { marginLeft: indent }]}>
        <TouchableOpacity
          style={styles.keyRow}
          onPress={() => setCollapsed(!collapsed)}
        >
          <Text style={styles.bracket}>{isOpen ? "▼" : "▶"} [</Text>
          <Text style={styles.meta}> {data.length} items </Text>
          <Text style={styles.bracket}>]</Text>
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.children}>
            {data.map((item, i) => (
              <View key={i} style={styles.child}>
                <Text style={styles.index}>[{i}]</Text>
                <JsonTree data={item} depth={depth + 1} />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  const entries = Object.entries(data);
  const isOpen = !collapsed;
  return (
    <View style={[styles.node, { marginLeft: indent }]}>
      <TouchableOpacity
        style={styles.keyRow}
        onPress={() => setCollapsed(!collapsed)}
      >
        <Text style={styles.bracket}>
          {isOpen ? "▼" : "▶"} {"{"}
        </Text>
        <Text style={styles.meta}> {entries.length} keys </Text>
        <Text style={styles.bracket}>{"}"}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.children}>
          {entries.map(([key, value]) => (
            <View key={key} style={styles.child}>
              <Text style={styles.key}>"{key}":</Text>
              <JsonTree data={value} depth={depth + 1} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  node: { marginBottom: 2 },
  keyRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  bracket: { color: colors.muted, fontSize: 12 },
  meta: { color: colors.placeholder, fontSize: 11 },
  key: { color: colors.link, fontSize: 12, marginRight: 4 },
  index: { color: colors.warning, fontSize: 12, marginRight: 4 },
  children: { marginLeft: 8, marginTop: 2 },
  child: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  value: { color: colors.text, fontSize: 12 },
  string: { color: colors.success },
  null: { color: colors.muted },
});
