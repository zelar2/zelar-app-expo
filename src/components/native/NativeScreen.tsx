import type { PropsWithChildren } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type NativeScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function NativeScreen({
  children,
  scroll = true,
}: NativeScreenProps) {
  const content = (
    <View style={styles.content}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
