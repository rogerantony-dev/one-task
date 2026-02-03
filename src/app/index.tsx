import { RequestBuilder } from "@/app/api-tester/RequestBuilder";
import { ResponseViewer } from "@/app/api-tester/ResponseViewer";
import { useApiTester } from "@/app/api-tester/useApiTester";
import { apiTesterStyles } from "@/app/api-tester/styles";
import { ScrollView } from "react-native";

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
  } = useApiTester();

  return (
    <ScrollView
      style={apiTesterStyles.scroll}
      contentContainerStyle={apiTesterStyles.container}
    >
      <RequestBuilder
        request={request}
        ui={ui}
        updateRequest={updateRequest}
        updateUi={updateUi}
        onSend={handleSend}
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
