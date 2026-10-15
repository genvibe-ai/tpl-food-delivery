## What this app is
Spoonlet: a fictional local food-delivery app for iPhone and Android (Expo SDK 57, Expo Router, TypeScript) that runs in Expo Go and in the web preview. Everything runs on sample data; no backend, accounts or real payments.

## Built so far
Onboarding (welcome, delivery address), Home (address, search, category chips, promo carousel, order again, featured and filterable restaurants), Search, Restaurant page (cover, stats, sticky section tabs, menu), Dish sheet (required and optional options, note, quantity), Bag (quantities, suggestions, promo HELLO40, tip, fees), Checkout (address, drop-off, standard/priority/scheduled delivery, demo payment), Order tracking (steps, map, courier, rating), Orders, Profile (rewards, Plus, favourites, settings, reset demo). State persists with AsyncStorage.

## Design
Warm white #FFFBF7, tomato #F0502F (buttons, active states), tomato text #C8391B, charcoal #221B18, butter #FFE9A8, green #1F8A53. Bricolage Grotesque headings, Figtree text. Pill buttons, 16–32 px radii, soft warm shadows, round dish photos. Reanimated springs: floating plates on onboarding, turning plate on Home, sliding sheet, bouncing bag bar; Reduce Motion respected. Light mode only.

## Structure
- constants/content.ts: brand, palette, fonts, photos (alt, size), categories, promos, promo codes, fees, tips, delivery options, payments, addresses, courier, tracking steps and map, all copy. data/restaurants.ts (menus) and data/orders.ts (past orders) are re-exported from it.
- app/: _layout, index (redirect), onboarding, (tabs)/home, search, orders, profile, restaurant/[id] (?dish= opens a dish), bag, checkout, order/[id], address.
- components/: TabBar, BagBar, DishSheet, DishRow, RestaurantCard, PromoCarousel, MapIllustration, TrackingMap(.native), OrderProgress, AddressPicker, Totals; ui/ (Text, Icon + icons.ts, Tap, Button, Sheet, Chip, Stepper).
- lib/: store (zustand + AsyncStorage), pricing, catalog, tracking, actions, format, fonts, ui, layout.
- assets/food, assets/people (real JPEGs), assets/images (icons).

## User preferences & rules
Edit constants/content.ts first; keep the design system (palette, fonts, Text/Tap/Button/Icon); never hard-code copy, prices or colours in components. Only modules in Expo Go 57, installed with npx expo install. Keep TrackingMap.native.tsx (live map) and TrackingMap.tsx (web drawing) in step. On the web never pop and push in one tick (see checkout.tsx): replace instead. New icons go in components/ui/icons.ts as Lucide shapes. Photos must be real JPEG or PNG. Never set android.package or ios.bundleIdentifier.

## Open issues & next ideas
Connect Supabase for restaurants, orders and sign-in; real payments; GPS address lookup (expo-location); push notifications for order steps. Android store builds need a Google Maps API key for the live map. Tracking is simulated (about 80 seconds).
