import React from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

import { ADMOB_BANNER_AD_UNIT_ID } from "@/constants/monetization";
import { useWater } from "@/providers/WaterProvider";

export default function AdBanner() {
  const { hasRemovedAds } = useWater();

  if (hasRemovedAds) {
    return null;
  }

  return (
    <View style={styles.bannerContainer} testID="ad-banner">
      <BannerAd
        unitId={ADMOB_BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
