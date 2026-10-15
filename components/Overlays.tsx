import { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, palette, radii } from "@/constants/content";
import { haptics } from "@/lib/haptics";
import { useUI } from "@/lib/ui";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { Text } from "./ui/Text";

/** App-wide toast and confirm dialog, drawn above every screen. */
export function Overlays() {
  return (
    <>
      <ConfirmDialog />
      <Toast />
    </>
  );
}

function ConfirmDialog() {
  const dialog = useUI((s) => s.dialog);
  const close = useUI((s) => s.closeDialog);

  useEffect(() => {
    if (!dialog) return;
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => back.remove();
  }, [dialog, close]);

  if (!dialog) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={[StyleSheet.absoluteFill, styles.scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={copy.common.close} />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          entering={ZoomIn.springify().damping(18).stiffness(260)}
          exiting={FadeOut.duration(120)}
          style={styles.card}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <Text variant="heading" align="center">
            {dialog.title}
          </Text>
          <Text variant="bodyMedium" color={palette.muted} align="center" style={styles.body}>
            {dialog.body}
          </Text>
          <View style={styles.actions}>
            <Button
              title={dialog.confirmLabel}
              size="md"
              variant={dialog.destructive ? "primary" : "dark"}
              onPress={() => {
                haptics.medium();
                close();
                dialog.onConfirm();
              }}
            />
            <Button title={dialog.cancelLabel ?? copy.common.cancel} size="md" variant="soft" onPress={close} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function Toast() {
  const toast = useUI((s) => s.toast);
  const hide = useUI((s) => s.hideToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hide, 2400);
    return () => clearTimeout(timer);
  }, [toast, hide]);

  if (!toast) return null;
  return (
    <View style={[styles.toastWrap, { top: insets.top + 8 }]} pointerEvents="box-none">
      <Animated.View
        key={toast.id}
        entering={SlideInUp.springify().damping(20)}
        exiting={SlideOutUp.duration(180)}
        style={styles.toast}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <Pressable onPress={hide} style={styles.toastRow} accessibilityLabel={toast.message}>
          <View style={styles.toastIcon}>
            <Icon name={toast.icon} size={16} color={palette.ink} strokeWidth={2.4} />
          </View>
          <Text variant="strong" color="#FFFFFF" style={styles.toastText} numberOfLines={2}>
            {toast.message}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: palette.scrim },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", padding: 28 },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    borderCurve: "continuous",
    padding: 24,
    paddingTop: 28,
    boxShadow: "0 24px 60px rgba(34, 27, 24, 0.25)",
  },
  body: { marginTop: 8 },
  actions: { marginTop: 22, gap: 10 },
  toastWrap: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  toast: {
    maxWidth: 420,
    backgroundColor: palette.ink,
    borderRadius: 999,
    boxShadow: "0 12px 30px rgba(34, 27, 24, 0.28)",
  },
  toastRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingLeft: 10, paddingRight: 18 },
  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.butter,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: { flexShrink: 1 },
});
