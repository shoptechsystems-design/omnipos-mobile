import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";
import { usePortalGate } from "@/hooks/use-portal-gate";

type TabIconProps = { name: "sell.fill" | "orders.fill" | "customers.fill" | "inventory.fill" | "more.fill"; color: string; focused: boolean };
function TabIcon({ name, color, focused }: TabIconProps) {
  return <View style={{ minWidth: 34, height: 28, alignItems: "center", justifyContent: "center", opacity: focused ? 1 : 0.82 }}><IconSymbol name={name} size={focused ? 19 : 18} color={color} /></View>;
}

export default function TabLayout() {
  const colors = useColors();
  const { gate } = usePortalGate();
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 14);
  const tabBarHeight = 64 + bottom;
  if (gate) return gate;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarHideOnKeyboard: true, tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 0 }, tabBarItemStyle: { paddingTop: 3 }, tabBarStyle: { height: tabBarHeight, paddingBottom: bottom, paddingTop: 5, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, shadowColor: "#10203F", shadowOpacity: 0.06, shadowRadius: 10, elevation: 5 } }}>
    <Tabs.Screen name="index" options={{ title: "Sell", tabBarIcon: ({ color, focused }) => <TabIcon name="sell.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color, focused }) => <TabIcon name="orders.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="customers" options={{ title: "Customers", tabBarIcon: ({ color, focused }) => <TabIcon name="customers.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="inventory" options={{ title: "Inventory", tabBarIcon: ({ color, focused }) => <TabIcon name="inventory.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color, focused }) => <TabIcon name="more.fill" color={color} focused={focused} /> }} />
  </Tabs>;
}
