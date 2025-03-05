import { requestAllPermissions } from "@/lib/permissions";
import { useState } from "react";
import {
  Text,
  View,
  Pressable
} from "react-native";


export default function Index() {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);

  return (
    <View className="bg-gray-600 h-screen flex-1 items-center justify-between p-4">
      <Text className="text-white text-2xl">Expo Nativewind Starter</Text>

      {!permissionsGranted &&
      <Pressable
        className="h-24 w-36 round-sm text-white text-2xl border-2 border-black"
        onPress={async () => {
          setPermissionsGranted(await requestAllPermissions())
        }
      }>
        Request Permissions
      </Pressable>
      }
      
    </View>
  );
}
