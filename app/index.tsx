import { requestAllPermissions } from "@/lib/permissions";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  Pressable,
  ScrollView
} from "react-native";
import { initWhisper } from 'whisper.rn'
import type { WhisperContext } from "whisper.rn";
import { fileDir, modelHost, createDir } from "@/lib/util";


export default async function Index() {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [logs, setLogs] = useState(["Campfire mobile"])
  const whisperContextRef = useRef<WhisperContext | null>(null);
  const whisperContext = whisperContextRef.current;

  const log = useCallback((...messages: any[]) => {
    setLogs((prev) => [...prev, messages.join(' ')])
  }, [])

  useEffect(() => () => {
    whisperContextRef.current?.release()
    whisperContextRef.current = null
  }, [])

  return (
    <ScrollView>
      <View className="bg-gray-600 h-screen flex-1 items-center justify-evenly p-4">
        <Text className="text-white text-2xl">Expo Nativewind Starter</Text>

        {!permissionsGranted &&
          <Pressable
            className="h-24 w-40 rounded-lg border-2 border-black bg-black p-2"
            onPress={async () => {
              setPermissionsGranted(await requestAllPermissions())
            }}
          >
            <Text className="text-white text-2xl">Request Permissions</Text>
          </Pressable>
        }

      </View>

      <View>
        {logs.map((msg, index) => (
          <Text key={index}>
            {msg}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}
