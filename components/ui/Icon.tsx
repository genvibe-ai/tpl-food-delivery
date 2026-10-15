/**
 * Line icons drawn with react-native-svg, so they look the same on iPhone,
 * Android and the web. The shapes live in icons.ts (Lucide, ISC license).
 */
import type { ComponentType } from "react";
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";
import { palette } from "@/constants/content";
import { ICONS, type IconName } from "./icons";

export type { IconName };

const SHAPES: Record<string, ComponentType<Record<string, unknown>>> = {
  path: Path,
  circle: Circle,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
  rect: Rect,
};

export function Icon({
  name,
  size = 22,
  color = palette.ink,
  strokeWidth = 2,
  fill = "none",
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Fill colour for solid variants (heart, star). */
  fill?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
    >
      {ICONS[name].map(([tag, attributes], i) => {
        const Shape = SHAPES[tag];
        return Shape ? <Shape key={i} {...attributes} /> : null;
      })}
    </Svg>
  );
}
