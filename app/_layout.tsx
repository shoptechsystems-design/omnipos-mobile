import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import "../global.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 20_000 } } });
export default function RootLayout() {
  return <QueryClientProvider client={queryClient}><ThemeProvider><CartProvider><Stack screenOptions={{ headerShown: false }} /></CartProvider></ThemeProvider></QueryClientProvider>;
}
