import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, fonts, palette, radii, type Dish, type OptionGroup, type Restaurant } from "@/constants/content";
import { addDishToBag } from "@/lib/actions";
import { getDish } from "@/lib/catalog";
import { money } from "@/lib/format";
import { missingGroup, toggleChoice, unitPrice, type Choices } from "@/lib/pricing";
import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";
import { Photo } from "./ui/Photo";
import { SelectMark } from "./ui/Select";
import { Sheet } from "./ui/Sheet";
import { Stepper } from "./ui/Stepper";
import { Tag } from "./ui/Tag";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

/** Dish details: options and add-ons, a note, quantity and "Add to bag". */
export function DishSheet({
  restaurant,
  dishId,
  onClose,
}: {
  restaurant: Restaurant;
  dishId: string | null;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const current = dishId ? getDish(restaurant.id, dishId) : undefined;
  // Keep showing the last dish while the sheet slides away.
  const [dish, setDish] = useState<Dish | undefined>(current);
  const [choices, setChoices] = useState<Choices>({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!current) return;
    setDish(current);
    setChoices({});
    setQty(1);
    setNote("");
  }, [current]);

  const missing = dish ? missingGroup(dish, choices) : undefined;
  const total = dish ? unitPrice(dish, choices) * qty : 0;
  const sheetHeight = Math.min(height - insets.top - 12, dish?.photo ? 820 : 640);

  const add = () => {
    if (!dish || missing) return;
    addDishToBag(restaurant.id, { dishId: dish.id, qty, choices, note: note.trim() || undefined }, dish.name, onClose);
  };

  return (
    <Sheet
      open={!!current}
      onClose={onClose}
      height={sheetHeight}
      label={dish?.name ?? ""}
      header={
        dish ? (
          <View>
            {dish.photo ? (
              <Photo name={dish.photo} style={styles.photo} priority="high" />
            ) : (
              <View style={styles.photoless} />
            )}
            <IconButton icon="close" label={copy.common.close} size={40} onPress={onClose} style={styles.close} />
          </View>
        ) : null
      }
      footer={
        dish ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <Stepper value={qty} onChange={(n) => setQty(Math.max(1, n))} size="lg" name={dish.name} />
            <Button
              title={missing ? copy.dish.missing(missing.title) : copy.dish.add(qty)}
              trailing={missing ? undefined : money(total)}
              disabled={!!missing}
              onPress={add}
              style={styles.addButton}
              testID="add-to-bag"
            />
          </View>
        ) : null
      }
    >
      {dish ? (
        <KeyboardAwareScrollView bottomOffset={24} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {dish.tags?.length ? (
            <View style={styles.tags}>
              {dish.tags.map((t) => (
                <Tag key={t} tag={t} />
              ))}
            </View>
          ) : null}
          <Text variant="title" accessibilityRole="header">
            {dish.name}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="price" style={styles.price}>
              {money(dish.price)}
            </Text>
            {dish.kcal ? <Text variant="caption">· {copy.dish.kcal(dish.kcal)}</Text> : null}
          </View>
          <Text variant="body" color={palette.inkSoft} style={styles.description}>
            {dish.description}
          </Text>

          {(dish.groups ?? []).map((group) => (
            <GroupPicker
              key={group.id}
              group={group}
              selected={choices[group.id] ?? []}
              onToggle={(optionId) => setChoices((c) => toggleChoice(c, group, optionId))}
            />
          ))}

          <View style={styles.group}>
            <Text variant="subheading">{copy.dish.noteTitle}</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={copy.dish.notePlaceholder}
              placeholderTextColor={palette.faint}
              style={styles.note}
              multiline
              maxLength={140}
              accessibilityLabel={copy.dish.noteTitle}
            />
          </View>
        </KeyboardAwareScrollView>
      ) : null}
    </Sheet>
  );
}

function GroupPicker({
  group,
  selected,
  onToggle,
}: {
  group: OptionGroup;
  selected: string[];
  onToggle: (optionId: string) => void;
}) {
  const required = group.min > 0;
  const done = selected.length >= group.min && required;
  const multiple = group.max > 1;
  return (
    <View style={styles.group} accessibilityRole={multiple ? undefined : "radiogroup"}>
      <View style={styles.groupHead}>
        <View style={styles.groupTitles}>
          <Text variant="subheading">{group.title}</Text>
          <Text variant="caption">{multiple ? copy.dish.upTo(group.max) : copy.dish.chooseOne}</Text>
        </View>
        <View style={[styles.badge, required ? (done ? styles.badgeDone : styles.badgeRequired) : styles.badgeOptional]}>
          <Text variant="label" color={required ? (done ? palette.success : palette.butterInk) : palette.muted} style={styles.badgeText}>
            {required ? (done ? copy.dish.done : copy.dish.required) : copy.dish.optional}
          </Text>
        </View>
      </View>
      {group.options.map((option) => {
        const on = selected.includes(option.id);
        const full = multiple && !on && selected.length >= group.max;
        return (
          <Tap
            key={option.id}
            label={`${option.label}${option.price ? `, plus ${money(option.price)}` : ""}`}
            role={multiple ? "checkbox" : "radio"}
            selected={on}
            disabled={full}
            pressedScale={0.99}
            onPress={() => onToggle(option.id)}
            style={[styles.option, full ? styles.optionFull : null]}
          >
            <SelectMark selected={on} multiple={multiple} />
            <Text variant="bodyMedium" style={styles.optionLabel}>
              {option.label}
            </Text>
            {option.price ? (
              <Animated.View entering={FadeIn}>
                <Text variant="label" color={palette.muted}>
                  +{money(option.price)}
                </Text>
              </Animated.View>
            ) : null}
          </Tap>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: "100%", height: 270 },
  photoless: { height: 64, backgroundColor: palette.tint },
  close: { position: "absolute", top: 14, right: 14 },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 32 },
  tags: { flexDirection: "row", gap: 6, marginBottom: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  price: { fontSize: 18, color: palette.primaryText },
  description: { marginTop: 10 },
  group: { marginTop: 26, gap: 4 },
  groupHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  groupTitles: { gap: 1 },
  badge: { height: 26, paddingHorizontal: 10, borderRadius: 13, justifyContent: "center" },
  badgeRequired: { backgroundColor: palette.butter },
  badgeDone: { backgroundColor: palette.successSoft },
  badgeOptional: { backgroundColor: palette.sunken },
  badgeText: { fontSize: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 54,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  optionFull: { opacity: 0.45 },
  optionLabel: { flex: 1 },
  note: {
    minHeight: 84,
    marginTop: 8,
    padding: 14,
    paddingTop: 14,
    borderRadius: radii.md,
    backgroundColor: palette.sunken,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: palette.ink,
    textAlignVertical: "top",
    outlineWidth: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  addButton: { flex: 1 },
});
