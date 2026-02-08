import { KeyValueEditor } from "@/components/KeyValueEditor";
import { colors } from "@/theme";
import { METHODS } from "./types";
import type { Request, Ui } from "./types";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiTesterStyles as s } from "./styles";

type RequestBuilderProps = {
  request: Request;
  ui: Ui;
  updateRequest: <K extends keyof Request>(key: K, value: Request[K]) => void;
  updateUi: <K extends keyof Ui>(key: K, value: Ui[K]) => void;
  onSend: () => void;
  urlPlaceholder?: string;
};

export function RequestBuilder({
  request,
  ui,
  updateRequest,
  updateUi,
  onSend,
  urlPlaceholder = "https://api.example.com/endpoint",
}: RequestBuilderProps) {
  return (
    <View style={s.section}>
      <View style={s.methodRow}>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[s.methodBtn, request.method === m && s.methodBtnActive]}
            onPress={() => updateRequest("method", m)}
          >
            <Text
              style={[s.methodText, request.method === m && s.methodTextActive]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={s.urlInput}
        placeholder={urlPlaceholder}
        placeholderTextColor={colors.placeholder}
        value={request.url}
        onChangeText={(v) => updateRequest("url", v)}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={s.tabRow}>
        {(["params", "headers", "body"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, ui.activeTab === tab && s.tabActive]}
            onPress={() => updateUi("activeTab", tab)}
          >
            <Text style={[s.tabText, ui.activeTab === tab && s.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {ui.activeTab === "params" && (
        <KeyValueEditor
          items={request.params}
          onChange={(v) => updateRequest("params", v)}
          keyPlaceholder="Param"
          valuePlaceholder="Value"
        />
      )}
      {ui.activeTab === "headers" && (
        <KeyValueEditor
          items={request.headers}
          onChange={(v) => updateRequest("headers", v)}
          keyPlaceholder="Header"
          valuePlaceholder="Value"
        />
      )}
      {ui.activeTab === "body" && (
        <View style={s.bodySection}>
          <View style={s.bodyTypeRow}>
            {(["json", "raw", "form"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  s.bodyTypeBtn,
                  request.bodyType === t && s.bodyTypeBtnActive,
                ]}
                onPress={() => updateRequest("bodyType", t)}
              >
                <Text
                  style={[
                    s.bodyTypeText,
                    request.bodyType === t && s.bodyTypeTextActive,
                  ]}
                >
                  {t === "json" ? "JSON" : t === "raw" ? "Raw" : "Form"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {request.bodyType === "json" && (
            <TextInput
              style={s.bodyInput}
              placeholder='{"key": "value"}'
              placeholderTextColor={colors.placeholder}
              value={request.bodyJson}
              onChangeText={(v) => updateRequest("bodyJson", v)}
              multiline
              textAlignVertical="top"
            />
          )}
          {request.bodyType === "raw" && (
            <TextInput
              style={s.bodyInput}
              placeholder="Raw body"
              placeholderTextColor={colors.placeholder}
              value={request.bodyRaw}
              onChangeText={(v) => updateRequest("bodyRaw", v)}
              multiline
              textAlignVertical="top"
            />
          )}
          {request.bodyType === "form" && (
            <KeyValueEditor
              items={request.bodyForm}
              onChange={(v) => updateRequest("bodyForm", v)}
              keyPlaceholder="Field"
              valuePlaceholder="Value"
            />
          )}
        </View>
      )}

      <View style={s.authSection}>
        <Text style={s.label}>Auth</Text>
        <View style={s.authTypeRow}>
          {(["none", "bearer", "apiKey"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                s.authTypeBtn,
                request.authType === t && s.authTypeBtnActive,
              ]}
              onPress={() => updateRequest("authType", t)}
            >
              <Text
                style={[
                  s.authTypeText,
                  request.authType === t && s.authTypeTextActive,
                ]}
              >
                {t === "none" ? "None" : t === "bearer" ? "Bearer" : "API Key"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {request.authType === "bearer" && (
          <TextInput
            style={s.authInput}
            placeholder="Token"
            placeholderTextColor={colors.placeholder}
            value={request.bearerToken}
            onChangeText={(v) => updateRequest("bearerToken", v)}
            secureTextEntry
            autoCapitalize="none"
          />
        )}
        {request.authType === "apiKey" && (
          <>
            <View style={s.apiKeyLocRow}>
              <TouchableOpacity
                style={[
                  s.apiKeyLocBtn,
                  request.apiKeyLocation === "header" && s.apiKeyLocBtnActive,
                ]}
                onPress={() => updateRequest("apiKeyLocation", "header")}
              >
                <Text
                  style={[
                    s.apiKeyLocText,
                    request.apiKeyLocation === "header" &&
                      s.apiKeyLocTextActive,
                  ]}
                >
                  Header
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.apiKeyLocBtn,
                  request.apiKeyLocation === "query" && s.apiKeyLocBtnActive,
                ]}
                onPress={() => updateRequest("apiKeyLocation", "query")}
              >
                <Text
                  style={[
                    s.apiKeyLocText,
                    request.apiKeyLocation === "query" && s.apiKeyLocTextActive,
                  ]}
                >
                  Query
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={s.authInput}
              placeholder="Key name (e.g. X-Api-Key)"
              placeholderTextColor={colors.placeholder}
              value={request.apiKeyName}
              onChangeText={(v) => updateRequest("apiKeyName", v)}
            />
            <TextInput
              style={s.authInput}
              placeholder="Value"
              placeholderTextColor={colors.placeholder}
              value={request.apiKeyValue}
              onChangeText={(v) => updateRequest("apiKeyValue", v)}
              secureTextEntry
              autoCapitalize="none"
            />
          </>
        )}
      </View>

      <TouchableOpacity
        style={[s.sendBtn, ui.loading && s.sendBtnDisabled]}
        onPress={onSend}
        disabled={ui.loading}
      >
        <Text style={s.sendBtnText}>{ui.loading ? "Sending…" : "Send"}</Text>
      </TouchableOpacity>
    </View>
  );
}
