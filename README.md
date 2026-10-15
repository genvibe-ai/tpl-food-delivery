# Spoonlet

A premium food delivery app for iPhone and Android, built with Expo SDK 57 and Expo Router. Pick an address,
browse local kitchens by category, open a restaurant, choose a dish's size and add-ons, fill your bag (tip and
promo code included), check out and watch your order travel to your door with a live map and courier card.
Orders history, favourites and a profile with rewards are included.

Runs in the Expo Go app (SDK 57) on iPhone and Android, and in the browser.

```bash
yarn install
yarn dev        # starts Expo with a tunnel; scan the QR code with Expo Go
```

## Make it yours

Everything brand-related lives in `constants/content.ts`: the app name, palette, fonts, photos (with alt text),
categories, promos and promo codes, fees, tip options, delivery options, payment methods, addresses, the courier,
tracking steps and all copy. Restaurants and menus are in `data/restaurants.ts`, past orders in `data/orders.ts`.
Photos are real JPEGs in `assets/food/` and `assets/people/`.

## How it works

- No server, accounts or payments: menus, prices and fees are local, and the bag, orders, address and favourites
  are saved on the device with AsyncStorage (localStorage on the web).
- Checkout is a demo. A placed order moves through its steps in about 80 seconds (`tracking.steps`).
- iPhone and Android show a live map (react-native-maps: Apple Maps on iOS, Google Maps on Android); the web
  shows a drawn map. Map coordinates are in `tracking.map`.
- Promo code `HELLO40` takes 40% off (up to $15). Profile → Reset demo data brings back the first launch.

Based on Crave.js Expo Storefront by Crave Up (MIT). See [NOTICE.md](NOTICE.md).
