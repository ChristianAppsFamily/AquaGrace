import { useCallback } from "react";
import { Alert } from "react-native";

import { REMOVE_ADS_FALLBACK_PRICE } from "@/constants/monetization";
import { useWater } from "@/providers/WaterProvider";

export function useRemoveAdsPurchase() {
  const { hasRemovedAds } = useWater();

  const purchase = useCallback(async () => {
    Alert.alert(
      "Native App Required",
      "In-app purchases are only available in the native AquaGrace app."
    );
  }, []);

  const restore = useCallback(async () => {
    Alert.alert(
      "Native App Required",
      "Purchase restore is only available in the native AquaGrace app."
    );
  }, []);

  return {
    connected: false,
    hasRemovedAds,
    isBusy: false,
    price: REMOVE_ADS_FALLBACK_PRICE,
    productId: "web-preview",
    purchase,
    restore,
  };
}
