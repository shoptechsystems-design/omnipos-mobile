import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

type TabIconProps = { name: "sell.fill" | "orders.fill" | "customers.fill" | "inventory.fill" | "more.fill"; color: string; focused: boolean };
function TabIcon({ name, color, focused }: TabIconProps) {
  return <View style={{ minWidth: 44, height: 30, paddingHorizontal: 10, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: focused ? "#E6F6F7" : "transparent" }}><IconSymbol name={name} size={focused ? 22 : 21} color={color} /></View>;
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 }, tabBarItemStyle: { paddingTop: 3 }, tabBarStyle: { height: 62 + bottom, paddingBottom: bottom, paddingTop: 5, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, shadowColor: "#0E1B3A", shadowOpacity: 0.06, shadowRadius: 12, elevation: 8 } }}>
    <Tabs.Screen name="index" options={{ title: "Sell", tabBarIcon: ({ color, focused }) => <TabIcon name="sell.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color, focused }) => <TabIcon name="orders.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="customers" options={{ title: "Customers", tabBarIcon: ({ color, focused }) => <TabIcon name="customers.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="inventory" options={{ title: "Inventory", tabBarIcon: ({ color, focused }) => <TabIcon name="inventory.fill" color={color} focused={focused} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color, focused }) => <TabIcon name="more.fill" color={color} focused={focused} /> }} />
  </Tabs>;
}
