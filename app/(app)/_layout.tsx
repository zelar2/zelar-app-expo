import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../src/hooks/useAuth";

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
