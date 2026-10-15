/**
 * iPhone and Android: a live map (Apple Maps on iOS, Google Maps on Android,
 * both built into Expo Go). Coordinates are in content.ts `tracking.map`.
 * The web uses TrackingMap.tsx (a drawn map) instead.
 */
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { palette, tracking } from "@/constants/content";
import { bendPoint, pointOnCurve, sampleCurve } from "@/lib/route";
import { CourierPin, HomePin, RestaurantPin } from "./MapPins";
import type { TrackingMapProps } from "./TrackingMap";

export type { TrackingMapProps };

const { restaurant: R, home: H } = tracking.map;
const A = { x: R.longitude, y: R.latitude };
const B = { x: H.longitude, y: H.latitude };
const C = bendPoint(A, B, -0.2);
const toLatLng = (p: { x: number; y: number }) => ({ latitude: p.y, longitude: p.x });
const ROUTE = sampleCurve(A, C, B, 40).map(toLatLng);

/** A warm, quiet Google Maps style (Android). Apple Maps uses its muted style. */
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f6efe7" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a7d74" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fffbf7" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#dcedd2" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fde7da" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d3e6ef" }] },
];

export function TrackingMap({ restaurant, ride, pickedUp, delivered, style, padding }: TrackingMapProps) {
  const map = useRef<MapView>(null);
  const region = useMemo(
    () => ({
      latitude: (R.latitude + H.latitude) / 2,
      longitude: (R.longitude + H.longitude) / 2,
      latitudeDelta: Math.abs(R.latitude - H.latitude) * 2.6,
      longitudeDelta: Math.abs(R.longitude - H.longitude) * 2.6,
    }),
    [],
  );
  const courierAt = toLatLng(pointOnCurve(A, C, B, ride));

  return (
    <MapView
      ref={map}
      style={style}
      initialRegion={region}
      onMapReady={() =>
        map.current?.fitToCoordinates([toLatLng(A), toLatLng(B)], {
          edgePadding: { top: (padding?.top ?? 0) + 60, bottom: (padding?.bottom ?? 0) + 40, left: 60, right: 60 },
          animated: false,
        })
      }
      customMapStyle={MAP_STYLE}
      mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
      userInterfaceStyle="light"
      showsPointsOfInterests={false}
      showsBuildings={false}
      showsCompass={false}
      toolbarEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      accessibilityLabel={`Map from ${restaurant.name} to your address`}
    >
      <Polyline coordinates={ROUTE} strokeColor="#FFFFFF" strokeWidth={9} />
      <Polyline
        coordinates={ROUTE}
        strokeColor={palette.primary}
        strokeWidth={4}
        lineDashPattern={delivered ? undefined : [2, 10]}
      />
      <PinMarker coordinate={toLatLng(A)}>
        <RestaurantPin restaurant={restaurant} />
      </PinMarker>
      <PinMarker coordinate={toLatLng(B)}>
        <HomePin pulsing={false} />
      </PinMarker>
      {pickedUp && !delivered ? (
        <PinMarker coordinate={courierAt}>
          <CourierPin />
        </PinMarker>
      ) : null}
    </MapView>
  );
}

/** A marker drawn from a view; it is snapshotted once it has drawn (smoother on Android). */
function PinMarker({ coordinate, children }: PropsWithChildren<{ coordinate: { latitude: number; longitude: number } }>) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 1200);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={!settled}>
      {children}
    </Marker>
  );
}
