import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  getAvailablePurchases as fetchAvailablePurchases,
  Product,
  Purchase,
  useIAP,
} from "react-native-iap";

import {
  REMOVE_ADS_FALLBACK_PRICE,
  REMOVE_ADS_PRODUCT_ID,
} from "@/constants/monetization";
import { useWater } from "@/providers/WaterProvider";

function ownsRemoveAds(purchases: Purchase[]) {
  return purchases.some((purchase) => purchase.productId === REMOVE_ADS_PRODUCT_ID);
}

export function useRemoveAdsPurchase() {
  const { hasRemovedAds, setHasRemovedAds } = useWater();
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const {
    connected,
    products,
    availablePurchases,
    finishTransaction,
    fetchProducts,
    requestPurchase,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      if (purchase.productId !== REMOVE_ADS_PRODUCT_ID) return;

      setHasRemovedAds(true);
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch (err) {
        console.log("[AquaGrace] Finish remove ads transaction error", err);
      } finally {
        setIsBusy(false);
      }
    },
    onPurchaseError: (error) => {
      setIsBusy(false);
      if (error.code === "user-cancelled") return;
      Alert.alert("Purchase Error", error.message);
    },
    onError: (error) => {
      console.log("[AquaGrace] IAP error", error);
    },
  });

  useEffect(() => {
    if (!connected) return;

    fetchProducts({
      skus: [REMOVE_ADS_PRODUCT_ID],
      type: "in-app",
    }).catch((err) => {
      console.log("[AquaGrace] Fetch remove ads product error", err);
    });
  }, [connected, fetchProducts]);

  useEffect(() => {
    if (ownsRemoveAds(availablePurchases)) {
      setHasRemovedAds(true);
    }
  }, [availablePurchases, setHasRemovedAds]);

  const product = useMemo<Product | undefined>(
    () => products.find((item) => item.id === REMOVE_ADS_PRODUCT_ID),
    [products]
  );

  const price = product?.displayPrice ?? REMOVE_ADS_FALLBACK_PRICE;

  const purchase = useCallback(async () => {
    if (hasRemovedAds) {
      Alert.alert("Ads Removed", "AquaGrace is already ad-free on this device.");
      return;
    }

    if (!connected) {
      Alert.alert("Store Unavailable", "Please try again once the store connection is ready.");
      return;
    }

    setIsBusy(true);
    try {
      await requestPurchase({
        request: {
          apple: { sku: REMOVE_ADS_PRODUCT_ID },
          google: { skus: [REMOVE_ADS_PRODUCT_ID] },
        },
        type: "in-app",
      });
    } catch (err) {
      setIsBusy(false);
      Alert.alert(
        "Purchase Error",
        err instanceof Error ? err.message : "Unable to start the purchase."
      );
    }
  }, [connected, hasRemovedAds, requestPurchase]);

  const restore = useCallback(async () => {
    if (!connected) {
      Alert.alert("Store Unavailable", "Please try again once the store connection is ready.");
      return;
    }

    setIsBusy(true);
    try {
      await restorePurchases();
      const restoredPurchases = await fetchAvailablePurchases();
      const restored = ownsRemoveAds(restoredPurchases);
      if (restored) {
        setHasRemovedAds(true);
        Alert.alert("Restored", "Your ad-free upgrade has been restored.");
      } else {
        Alert.alert("No Purchase Found", "No Remove Ads purchase was found for this account.");
      }
    } catch (err) {
      Alert.alert(
        "Restore Error",
        err instanceof Error ? err.message : "Unable to restore purchases."
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    connected,
    restorePurchases,
    setHasRemovedAds,
  ]);

  return {
    connected: Platform.OS === "ios" || Platform.OS === "android" ? connected : false,
    hasRemovedAds,
    isBusy,
    price,
    productId: REMOVE_ADS_PRODUCT_ID,
    purchase,
    restore,
  };
}
