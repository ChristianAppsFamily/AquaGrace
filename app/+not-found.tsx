import { Link, Stack } from "expo-router";
import { Droplets } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  const colors = Colors.light;

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Droplets size={48} color={colors.border} />
        <Text style={[styles.title, { color: colors.text }]}>
          Page not found
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.tint }]}>
            Back to AquaFlow
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  link: {
    marginTop: 8,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
