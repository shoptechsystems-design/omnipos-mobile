import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { height: 58 + bottom, paddingBottom: bottom, paddingTop: 6, backgroundColor: colors.surface, borderTopColor: colors.border } }}>
    <Tabs.Screen name="index" options={{ title: "Sell", tabBarIcon: ({ color }) => <IconSymbol name="sell.fill" size={24} color={color} /> }} />
    <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color }) => <IconSymbol name="orders.fill" size={24} color={color} /> }} />
    <Tabs.Screen name="customers" options={{ title: "Customers", tabBarIcon: ({ color }) => <IconSymbol name="customers.fill" size={24} color={color} /> }} />
    <Tabs.Screen name="inventory" options={{ title: "Inventory", tabBarIcon: ({ color }) => <IconSymbol name="inventory.fill" size={24} color={color} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <IconSymbol name="more.fill" size={24} color={color} /> }} />
  </Tabs>;
}
