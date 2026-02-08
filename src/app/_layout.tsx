import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { initSchema } from "@/lib/db";
import { CollectionProvider } from "@/app/context/CollectionContext";
import { CollectionSelector } from "@/app/api-tester/CollectionSelector";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="api-tester.db" onInit={initSchema}>
      <CollectionProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#1a1a2e" },
            headerTintColor: "#eee",
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "REST",
              headerRight: () => <CollectionSelector />,
            }}
          />
        </Stack>
      </CollectionProvider>
    </SQLiteProvider>
  );
}
