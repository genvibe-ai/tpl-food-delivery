import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { palette } from "@/constants/content";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.canvas }, animation: "fade" }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
