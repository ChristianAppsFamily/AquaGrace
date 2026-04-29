import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { ADMOB_BANNER_AD_UNIT_ID, ADMOB_INTERSTITIAL_AD_UNIT_ID } from "@/constants/monetization";
import { useWater } from "@/providers/WaterProvider";

const effectiveDate = "April 29, 2026";

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useWater();
  const colors = settings.darkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          testID="privacy-policy-back"
        >
          <ArrowLeft size={18} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>AquaGrace Privacy Policy</Text>
        <Text style={[styles.updated, { color: colors.textSecondary }]}>
          Effective date: {effectiveDate}
        </Text>

        <PolicySection title="Overview" colors={colors}>
          AquaGrace is a hydration and wellness app from Christian App Empire LLC. This
          policy explains what information the app uses, why permissions may be requested,
          and how advertising and in-app purchases work.
        </PolicySection>

        <PolicySection title="Information stored by AquaGrace" colors={colors}>
          AquaGrace stores your hydration entries, daily goal, reminder times, preferred
          measurement unit, appearance setting, drink sound choice, and ad-free purchase
          status on your device. This app does not require an account and does not upload
          your water log to an AquaGrace server.
        </PolicySection>

        <PolicySection title="Advertising and tracking" colors={colors}>
          AquaGrace shows banner and interstitial ads unless you purchase Remove Ads. Ads
          are served through Google AdMob. The AquaGrace ad unit IDs are{" "}
          {ADMOB_BANNER_AD_UNIT_ID} for banner ads and {ADMOB_INTERSTITIAL_AD_UNIT_ID}{" "}
          for interstitial ads. AdMob may process device identifiers, approximate
          location derived from your IP address, ad interactions, diagnostics, and similar
          data to deliver, limit, measure, and improve ads.
        </PolicySection>

        <PolicySection title="App Tracking Transparency and advertising ID" colors={colors}>
          On iOS, AquaGrace may request App Tracking Transparency permission before using
          data that can track you across apps or websites for advertising. You can allow
          or deny this permission in iOS Settings. On Android, AquaGrace declares the
          Google advertising ID permission so AdMob can request the advertising ID when
          available. If you deny tracking or limit ad personalization, AquaGrace still
          works and may show non-personalized ads.
        </PolicySection>

        <PolicySection title="In-app purchases" colors={colors}>
          AquaGrace offers a one-time Remove Ads purchase. Purchases and restorations are
          processed by Apple App Store or Google Play billing. AquaGrace stores only the
          local ad-free entitlement state needed to hide ads. Apple and Google may process
          payment, transaction, account, and fraud-prevention information under their own
          policies.
        </PolicySection>

        <PolicySection title="Permissions and device features" colors={colors}>
          AquaGrace may use local storage to save your settings and water log. The app can
          play water sounds and soundscape effects through your device audio output. The
          current app does not require camera, microphone, contacts, precise location, or
          health database access for its core hydration tracking features.
        </PolicySection>

        <PolicySection title="Children's privacy" colors={colors}>
          AquaGrace is not directed to children under 13 and does not knowingly collect
          personal information from children. If you believe a child provided personal
          information through a third-party service used by the app, contact the relevant
          platform provider and Christian App Empire LLC through the app store listing.
        </PolicySection>

        <PolicySection title="Your choices" colors={colors}>
          You can delete AquaGrace from your device to remove locally stored app data. You
          can reset or limit your advertising ID in your device settings, manage iOS App
          Tracking Transparency permission in Settings, and restore purchases from the
          AquaGrace Settings screen.
        </PolicySection>

        <PolicySection title="Changes and contact" colors={colors}>
          This policy may be updated when AquaGrace changes features, permissions, ads, or
          purchases. For privacy questions, contact Christian App Empire LLC using the
          support contact listed on the AquaGrace App Store or Google Play listing.
        </PolicySection>
      </ScrollView>
    </View>
  );
}

interface PolicySectionProps {
  title: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}

function PolicySection({ title, colors, children }: PolicySectionProps) {
  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 30,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  updated: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 20,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
    ...(Platform.OS === "web" ? { maxWidth: 780 } : {}),
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 22,
  },
});
