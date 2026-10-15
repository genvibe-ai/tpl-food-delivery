/**
 * Font files, keyed by the family names in content.ts `fonts`. To change a
 * font, install its @expo-google-fonts package and swap the imports here.
 */
import { BricolageGrotesque_600SemiBold } from "@expo-google-fonts/bricolage-grotesque/600SemiBold";
import { BricolageGrotesque_700Bold } from "@expo-google-fonts/bricolage-grotesque/700Bold";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque/800ExtraBold";
import { Figtree_400Regular } from "@expo-google-fonts/figtree/400Regular";
import { Figtree_500Medium } from "@expo-google-fonts/figtree/500Medium";
import { Figtree_600SemiBold } from "@expo-google-fonts/figtree/600SemiBold";
import { Figtree_700Bold } from "@expo-google-fonts/figtree/700Bold";
import { fonts } from "@/constants/content";

export const fontFiles = {
  [fonts.display]: BricolageGrotesque_800ExtraBold,
  [fonts.heading]: BricolageGrotesque_700Bold,
  [fonts.headingSemi]: BricolageGrotesque_600SemiBold,
  [fonts.body]: Figtree_400Regular,
  [fonts.medium]: Figtree_500Medium,
  [fonts.semibold]: Figtree_600SemiBold,
  [fonts.bold]: Figtree_700Bold,
};
