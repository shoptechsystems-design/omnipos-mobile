import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName = keyof typeof MAPPING;
const MAPPING = {
  "house.fill": "home", "paperplane.fill": "send", "chevron.left.forwardslash.chevron.right": "code", "chevron.right": "chevron-right",
  "sell.fill": "shopping-bag", "orders.fill": "receipt", "customers.fill": "people-alt", "inventory.fill": "inventory-2", "more.fill": "apps", "search.fill": "search", "barcode.viewfinder": "qr-code-scanner", "cart.fill": "shopping-cart", "plus": "add", "minus": "remove", "person.fill": "person", "logout": "logout", "bell.fill": "notifications", "arrow.left": "arrow-back", "checkmark.circle.fill": "check-circle", "chevron.down": "expand-more", "adjustments": "tune", "receipt.fill": "receipt-long", "wallet": "account-balance-wallet", "package": "inventory", "eye.fill": "visibility", "eye.slash.fill": "visibility-off"
};
export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) { return <MaterialIcons color={color} size={size} name={MAPPING[name] as ComponentProps<typeof MaterialIcons>["name"]} style={style} />; }
