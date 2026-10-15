import { Redirect } from "expo-router";

/** Unknown links open Home. */
export default function NotFound() {
  return <Redirect href="/" />;
}
