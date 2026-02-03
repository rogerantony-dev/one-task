import { JsonTree } from "@/components/JsonTree";
import type { Ui } from "./types";
import type { FetchResult } from "./useApiTester";
import { statusColor } from "./requestUtils";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { apiTesterStyles as s } from "./styles";

type ResponseViewerProps = {
  response: FetchResult;
  ui: Ui;
  updateUi: <K extends keyof Ui>(key: K, value: Ui[K]) => void;
  onCopy: () => void;
  parsedJson: unknown;
  isJson: boolean;
};

export function ResponseViewer({
  response,
  ui,
  updateUi,
  onCopy,
  parsedJson,
  isJson,
}: ResponseViewerProps) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Response</Text>
      <View style={s.responseHeader}>
        <Text style={[s.statusText, { color: statusColor(response.status) }]}>
          {response.status
            ? String(response.status)
            : response.error || "Error"}
        </Text>
        <Text style={s.timeText}>{response.responseTime} ms</Text>
        <TouchableOpacity style={s.copyBtn} onPress={onCopy}>
          <Text style={s.copyBtnText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <View style={s.responseTabRow}>
        <TouchableOpacity
          style={[
            s.responseTab,
            ui.responseTab === "body" && s.responseTabActive,
          ]}
          onPress={() => updateUi("responseTab", "body")}
        >
          <Text
            style={[
              s.responseTabText,
              ui.responseTab === "body" && s.responseTabTextActive,
            ]}
          >
            Body
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            s.responseTab,
            ui.responseTab === "headers" && s.responseTabActive,
          ]}
          onPress={() => updateUi("responseTab", "headers")}
        >
          <Text
            style={[
              s.responseTabText,
              ui.responseTab === "headers" && s.responseTabTextActive,
            ]}
          >
            Headers
          </Text>
        </TouchableOpacity>
      </View>
      {ui.responseTab === "body" && (
        <ScrollView style={s.responseBody} nestedScrollEnabled>
          {response.error ? (
            <Text style={s.errorText}>{response.error}</Text>
          ) : isJson && parsedJson !== null ? (
            <JsonTree data={parsedJson} />
          ) : (
            <Text style={s.rawText} selectable>
              {response.bodyText || "(empty)"}
            </Text>
          )}
        </ScrollView>
      )}
      {ui.responseTab === "headers" && (
        <View style={s.headersList}>
          {Object.entries(response.headers).map(([k, v]) => (
            <View key={k} style={s.headerRow}>
              <Text style={s.headerKey}>{k}</Text>
              <Text style={s.headerVal} selectable numberOfLines={2}>
                {v}
              </Text>
            </View>
          ))}
          {Object.keys(response.headers).length === 0 && (
            <Text style={s.emptyText}>No headers</Text>
          )}
        </View>
      )}
    </View>
  );
}
