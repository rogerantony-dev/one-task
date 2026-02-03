import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1a1a2e" },
        headerTintColor: "#eee",
      }}
    >
      <Stack.Screen name="index" options={{ title: "REST" }} />
    </Stack>
  );
}
