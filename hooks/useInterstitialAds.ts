import { useCallback } from "react";

interface UseInterstitialAdsOptions {
  adsRemoved: boolean;
}

export function useInterstitialAds(_options: UseInterstitialAdsOptions) {
  return useCallback(async () => {}, []);
}
