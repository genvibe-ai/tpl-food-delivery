import { Redirect } from "expo-router";
import { useStore } from "@/lib/store";

/** First launch goes to onboarding; after that, straight to Home. */
export default function Index() {
  const onboarded = useStore((s) => s.onboarded);
  return <Redirect href={onboarded ? "/home" : "/onboarding"} />;
}
