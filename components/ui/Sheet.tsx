import { useEffect, useState, type ReactNode } from "react";
import { BackHandler, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { copy, palette, radii } from "@/constants/content";
import { EASE_OUT, SHEET, SNAP } from "@/lib/motion";

/**
 * Bottom sheet drawn inside the screen (not a native modal), so it looks the
 * same on iPhone, Android and the web. Drag the top part down, tap the
 * backdrop, press Escape (web) or Back (Android) to close.
 */
export function Sheet({
  open,
  onClose,
  header,
  children,
  footer,
  height,
  label,
}: {
  open: boolean;
  onClose: () => void;
  /** Draggable top part (photo, title). */
  header?: ReactNode;
  children: ReactNode;
  /** Pinned to the bottom of the sheet. */
  footer?: ReactNode;
  /** Fixed height; the content scrolls inside. */
  height: number;
  label: string;
}) {
  const { height: screen } = useWindowDimensions();
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      drag.set(0);
      progress.set(withSpring(1, SHEET));
    } else {
      progress.set(
        withTiming(0, { duration: 230, easing: EASE_OUT }, (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [open, progress, drag]);

  useEffect(() => {
    if (!open) return;
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (Platform.OS === "web") window.addEventListener("keydown", onKey);
    return () => {
      back.remove();
      if (Platform.OS === "web") window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const pan = Gesture.Pan()
    .activeOffsetY(6)
    .onUpdate((e) => {
      drag.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 900) scheduleOnRN(onClose);
      else drag.set(withSpring(0, SNAP));
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * (height + 40) + drag.get() }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.get() * interpolate(drag.get(), [0, height], [1, 0.3]),
  }));

  if (!mounted) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? "box-none" : "none"}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={copy.common.close} />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={label}
        style={[styles.sheet, { height: Math.min(height, screen - 24) }, sheetStyle]}
      >
        <GestureDetector gesture={pan}>
          <View>
            <View style={styles.grabberRow}>
              <View style={styles.grabber} />
            </View>
            {header}
          </View>
        </GestureDetector>
        <View style={styles.body}>{children}</View>
        {footer}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: palette.scrim },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderCurve: "continuous",
    overflow: "hidden",
    boxShadow: "0 -12px 40px rgba(34, 27, 24, 0.18)",
  },
  grabberRow: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", paddingTop: 8, zIndex: 3 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" },
  body: { flex: 1 },
});
