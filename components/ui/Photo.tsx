import { Image, type ImageStyle } from "expo-image";
import type { StyleProp } from "react-native";
import { palette, photos, type PhotoKey } from "@/constants/content";

/** A photo from content.ts `photos`, cropped to fill `style`. */
export function Photo({
  name,
  style,
  priority = "normal",
  decorative = false,
}: {
  name: PhotoKey;
  style?: StyleProp<ImageStyle>;
  priority?: "low" | "normal" | "high";
  /** Hide from screen readers when the text next to it says the same. */
  decorative?: boolean;
}) {
  const photo = photos[name];
  return (
    <Image
      source={photo.source}
      alt={decorative ? "" : photo.alt}
      accessible={!decorative}
      contentFit="cover"
      transition={220}
      priority={priority}
      style={[{ backgroundColor: palette.sunken }, style]}
    />
  );
}
