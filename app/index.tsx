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
    <View className="bg-gray-600 h-screen flex-1 items-center justify-evenly p-4">
      <Text className="text-white text-2xl">Expo Nativewind Starter</Text>

      {!permissionsGranted &&
      <Pressable
        className="h-24 w-40 rounded-lg border-2 border-black bg-black p-2"
        onPress={async () => {
          setPermissionsGranted(await requestAllPermissions())
        }
      }>
        <Text className="text-white text-2xl">Request Permissions</Text>
      </Pressable>
      }

    </View>
  );
}
