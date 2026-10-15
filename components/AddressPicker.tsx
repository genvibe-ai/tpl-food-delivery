import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { addresses, copy, fonts, palette, radii, type Address } from "@/constants/content";
import { Button } from "./ui/Button";
import { Icon, type IconName } from "./ui/Icon";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

const iconFor = (a: Address): IconName => (a.label === "Home" ? "home" : a.label === "Work" ? "briefcase" : "pin");

/**
 * "Use my current location", a search field with suggestions, and saved
 * addresses. The demo has no GPS or geocoding: the current location is
 * content.ts `addresses.current` and suggestions come from content.ts.
 */
export function AddressPicker({ onPick, selectedId }: { onPick: (address: Address) => void; selectedId?: string }) {
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = q ? addresses.suggestions.filter((a) => `${a.line1} ${a.line2}`.toLowerCase().includes(q)) : [];

  const locate = () => {
    setLocating(true);
    timer.current = setTimeout(() => {
      setLocating(false);
      onPick(addresses.current);
    }, 900);
  };

  return (
    <View style={styles.wrap}>
      <Button
        title={locating ? copy.address.locating : copy.address.useLocation}
        icon="locate"
        variant="dark"
        size="md"
        loading={locating}
        onPress={locate}
        testID="use-location"
      />
      <View style={styles.field}>
        <Icon name="search" size={19} color={palette.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={copy.address.searchPlaceholder}
          placeholderTextColor={palette.faint}
          autoCorrect={false}
          style={styles.input}
          accessibilityLabel={copy.address.searchPlaceholder}
        />
      </View>

      {q ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.list}>
          <Text variant="micro" style={styles.label}>
            {copy.address.suggestions}
          </Text>
          {matches.length === 0 ? <Text variant="caption">{copy.address.noMatches}</Text> : null}
          {matches.map((a) => (
            <Row key={a.id} address={a} title={a.line1} subtitle={a.line2} onPress={() => onPick(a)} />
          ))}
        </Animated.View>
      ) : (
        <View style={styles.list}>
          <Text variant="micro" style={styles.label}>
            {copy.address.saved}
          </Text>
          {addresses.saved.map((a) => (
            <Row
              key={a.id}
              address={a}
              title={a.label}
              subtitle={`${a.line1} · ${a.line2}`}
              selected={a.id === selectedId}
              onPress={() => onPick(a)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function Row({
  address,
  title,
  subtitle,
  selected,
  onPress,
}: {
  address: Address;
  title: string;
  subtitle: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Tap label={`${title}, ${subtitle}`} onPress={onPress} pressedScale={0.99} selected={selected} style={[styles.row, selected ? styles.rowOn : null]}>
      <View style={[styles.rowIcon, selected ? styles.rowIconOn : null]}>
        <Icon name={iconFor(address)} size={18} color={selected ? palette.primary : palette.ink} />
      </View>
      <View style={styles.flex}>
        <Text variant="strong">{title}</Text>
        <Text variant="caption" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {selected ? (
        <View style={styles.check}>
          <Icon name="check" size={14} color="#FFFFFF" strokeWidth={3} />
        </View>
      ) : (
        <Icon name="chevronRight" size={18} color={palette.faint} />
      )}
    </Tap>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  flex: { flex: 1 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 26,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  input: { flex: 1, height: "100%", fontFamily: fonts.medium, fontSize: 15, color: palette.ink, outlineWidth: 0 },
  list: { marginTop: 8, gap: 8 },
  label: { marginBottom: 2, marginLeft: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  rowOn: { borderColor: palette.primary, backgroundColor: palette.tint },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.sunken, alignItems: "center", justifyContent: "center" },
  rowIconOn: { backgroundColor: "#FFFFFF" },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: palette.primary, alignItems: "center", justifyContent: "center" },
});
