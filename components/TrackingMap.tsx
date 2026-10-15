/**
 * Web: react-native-maps does not run in the browser, so the web preview
 * shows the drawn map. iPhone and Android use TrackingMap.native.tsx (a live map).
 */
import type { StyleProp, ViewStyle } from "react-native";
import type { Restaurant } from "@/constants/content";
import { MapIllustration } from "./MapIllustration";

export type TrackingMapProps = {
  restaurant: Restaurant;
  /** 0..1 along the ride from the restaurant to the door. */
  ride: number;
  pickedUp: boolean;
  delivered: boolean;
  style?: StyleProp<ViewStyle>;
  /** Space covered by overlays (header, bottom panel), kept clear when framing the route. */
  padding?: { top: number; bottom: number };
};

export function TrackingMap({ restaurant, ride, pickedUp, delivered, style }: TrackingMapProps) {
  return (
    <MapIllustration
      mode="route"
      restaurant={restaurant}
      ride={ride}
      pickedUp={pickedUp}
      delivered={delivered}
      style={style}
    />
  );
}
