import { Stack } from "expo-router";
import "../global.css"
import 'expo-dev-client';


export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false}} />;
}
