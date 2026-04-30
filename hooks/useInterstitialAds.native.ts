import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";

import { ADMOB_INTERSTITIAL_AD_UNIT_ID } from "@/constants/monetization";

interface UseInterstitialAdsOptions {
  adsRemoved: boolean;
}

export function useInterstitialAds({ adsRemoved }: UseInterstitialAdsOptions) {
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef<boolean>(false);
  const [hasRequestedTracking, setHasRequestedTracking] = useState<boolean>(false);

  useEffect(() => {
    if (adsRemoved) {
      interstitialRef.current = null;
      loadedRef.current = false;
      return;
    }

    const interstitial = InterstitialAd.createForAdRequest(
      ADMOB_INTERSTITIAL_AD_UNIT_ID,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );
    interstitialRef.current = interstitial;

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        loadedRef.current = true;
      }
    );
    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        loadedRef.current = false;
        interstitial.load();
      }
    );
    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      () => {
        loadedRef.current = false;
      }
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      interstitialRef.current = null;
      loadedRef.current = false;
    };
  }, [adsRemoved]);

  return useCallback(async () => {
    if (!adsRemoved && !hasRequestedTracking) {
      setHasRequestedTracking(true);
      try {
        const permission = await getTrackingPermissionsAsync();
        if (permission.status === "undetermined") {
          await requestTrackingPermissionsAsync();
        }
      } catch (err) {
        console.log("[AquaGrace] ATT request error", err);
      }
    }

    const interstitial = interstitialRef.current;
    if (adsRemoved || !interstitial || !loadedRef.current) {
      return;
    }

    loadedRef.current = false;
    interstitial.show();
  }, [adsRemoved, hasRequestedTracking]);
}
