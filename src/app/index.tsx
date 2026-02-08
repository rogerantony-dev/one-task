import { RequestBuilder } from "@/app/api-tester/RequestBuilder";
import { ResponseViewer } from "@/app/api-tester/ResponseViewer";
import { useApiTester } from "@/app/api-tester/useApiTester";
import { apiTesterStyles as s } from "@/app/api-tester/styles";
import { useCollectionContext } from "@/app/context/CollectionContext";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useState } from "react";

export default function HomeScreen() {
  const {
    request,
    ui,
    response,
    updateRequest,
    updateUi,
    handleSend,
    copyResponse,
    parsedJson,
    isJson,
    loadRequestData,
  } = useApiTester();
  const {
    currentCollection,
    baseUrlKind,
    setBaseUrlKind,
    currentBaseUrl,
    savedRequests,
    saveRequest,
    loadRequest,
    deleteRequest,
  } = useCollectionContext();
  const [saving, setSaving] = useState(false);

  const handleLoadSaved = useCallback(
    async (id: number) => {
      const saved = await loadRequest(id);
      if (saved) loadRequestData(saved);
    },
    [loadRequest, loadRequestData]
  );

  const handleSaveRequest = useCallback(async () => {
    if (!currentCollection) return;
    setSaving(true);
    try {
      const path = request.url.trim();
      const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "/";
      await saveRequest(
        {
          method: request.method,
          path: normalizedPath,
          params: request.params,
          headers: request.headers,
          bodyType: request.bodyType,
          bodyJson: request.bodyJson,
          bodyRaw: request.bodyRaw,
          bodyForm: request.bodyForm,
          authType: request.authType,
          bearerToken: request.bearerToken,
          apiKeyLocation: request.apiKeyLocation,
          apiKeyName: request.apiKeyName,
          apiKeyValue: request.apiKeyValue,
        },
        null
      );
    } finally {
      setSaving(false);
    }
  }, [currentCollection, request, saveRequest]);

  const urlPlaceholder = currentCollection
    ? "/v1/endpoint or path"
    : "https://api.example.com/endpoint";

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      {currentCollection && (
        <>
          <View style={s.section}>
            <Text style={s.label}>Base URL</Text>
            <View style={s.baseUrlRow}>
              {(["prod", "dev", "custom"] as const).map((kind) => (
                <TouchableOpacity
                  key={kind}
                  style={[s.baseUrlKindBtn, baseUrlKind === kind && s.baseUrlKindBtnActive]}
                  onPress={() => setBaseUrlKind(kind)}
                >
                  <Text
                    style={[s.baseUrlKindText, baseUrlKind === kind && s.baseUrlKindTextActive]}
                  >
                    {kind.charAt(0).toUpperCase() + kind.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {currentBaseUrl ? (
              <Text style={s.baseUrlDisplay} numberOfLines={2}>
                {currentBaseUrl}
              </Text>
            ) : (
              <Text style={s.baseUrlDisplay}>Set base URL in collection settings</Text>
            )}
          </View>
          {savedRequests.length > 0 && (
            <View style={s.savedSection}>
              <Text style={s.label}>Saved requests</Text>
              <View style={s.savedList}>
                {savedRequests.map((r, i) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[s.savedItem, i === savedRequests.length - 1 && s.savedItemLast]}
                    onPress={() => handleLoadSaved(r.id)}
                    onLongPress={() => deleteRequest(r.id)}
                  >
                    <Text style={s.savedItemText} numberOfLines={1}>
                      {r.name || `${r.method} ${r.url}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <TouchableOpacity
            style={s.saveRequestBtn}
            onPress={handleSaveRequest}
            disabled={saving}
          >
            <Text style={s.saveRequestBtnText}>{saving ? "Saving…" : "Save request"}</Text>
          </TouchableOpacity>
        </>
      )}
      <RequestBuilder
        request={request}
        ui={ui}
        updateRequest={updateRequest}
        updateUi={updateUi}
        onSend={handleSend}
        urlPlaceholder={urlPlaceholder}
      />
      {response && (
        <ResponseViewer
          response={response}
          ui={ui}
          updateUi={updateUi}
          onCopy={copyResponse}
          parsedJson={parsedJson}
          isJson={isJson}
        />
      )}
    </ScrollView>
  );
}
