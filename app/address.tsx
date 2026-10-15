import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddressPicker } from "@/components/AddressPicker";
import { MapIllustration } from "@/components/MapIllustration";
import { ScreenHeader } from "@/components/ScreenHeader";
import { copy, palette, radii } from "@/constants/content";
import { haptics } from "@/lib/haptics";
import { GUTTER } from "@/lib/layout";
import { useStore } from "@/lib/store";

/** Change the delivery address (from Home's header, checkout or Profile). */
export default function AddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const address = useStore((s) => s.address);
  const setAddress = useStore((s) => s.setAddress);
  const close = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  return (
    <View style={styles.screen}>
      <ScreenHeader title={copy.address.title} onBack={close} backIcon="chevronDown" />
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <MapIllustration mode="pin" style={styles.map} />
        <AddressPicker
          selectedId={address.id}
          onPick={(a) => {
            setAddress(a);
            haptics.success();
            close();
          }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 16 },
  map: { height: 180, borderRadius: radii.xl, borderWidth: 1, borderColor: palette.line },
});
