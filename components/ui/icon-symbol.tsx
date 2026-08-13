import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName = keyof typeof MAPPING;
const MAPPING = {
  "house.fill": "home", "paperplane.fill": "send", "chevron.left.forwardslash.chevron.right": "code", "chevron.right": "chevron-right",
  "sell.fill": "sell", "orders.fill": "receipt-long", "customers.fill": "groups", "inventory.fill": "inventory-2", "more.fill": "more-horiz", "search.fill": "search", "barcode.viewfinder": "qr-code-scanner", "cart.fill": "shopping-cart", "plus": "add", "minus": "remove", "person.fill": "person", "logout": "logout", "bell.fill": "notifications", "arrow.left": "arrow-back", "checkmark.circle.fill": "check-circle", "chevron.down": "expand-more", "adjustments": "tune", "wallet": "account-balance-wallet", "package": "inventory"
};
export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) { return <MaterialIcons color={color} size={size} name={MAPPING[name] as ComponentProps<typeof MaterialIcons>["name"]} style={style} />; }
