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


export default function Index() {
  const whisperContextRef = useRef<WhisperContext | null>(null);
  const whisperContext = whisperContextRef.current;
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [logs, setLogs] = useState(["Campfire mobile"])
  const [transcibeResult, setTranscibeResult] = useState<string | null>(null)
  const [stopTranscribe, setStopTranscribe] = useState<{
    stop: () => void
  } | null>(null)

  const log = useCallback((...messages: any[]) => {
    setLogs((prev) => [...prev, messages.join(' ')])
  }, [])

  useEffect(() => () => {
    whisperContextRef.current?.release()
    whisperContextRef.current = null
  }, [])

  const progress = useCallback(
    ({
      contentLength,
      bytesWritten,
    }: {
      contentLength: number
      bytesWritten: number
    }) => {
      const written = bytesWritten >= 0 ? bytesWritten : 0
      log(`Download progress: ${Math.round((written / contentLength) * 100)}%`)
    },
    [log],
  )

  return (
    <ScrollView>
      <View className="bg-gray-600 h-screen flex-1 items-center justify-evenly p-4">
        <Text className="text-white text-2xl">Expo Nativewind Starter</Text>

        {!permissionsGranted &&
          <Pressable
            className="h-24 w-40 rounded-lg border-2 border-black bg-black p-2"
            onPress={async () => {
              const perms = await requestAllPermissions()
              log(`Permissions granted? - ${perms}`)
              setPermissionsGranted(perms)

              if (whisperContext) {
                log('Found previous context')
                await whisperContext.release()
                whisperContextRef.current = null
                log('Released previous context')
              }
              log('Initialize context...')
              const startTime = Date.now()
              const ctx = await initWhisper({
                filePath: require('../assets/model/ggml-small.bin'),
              })
              const endTime = Date.now()
              log('Loaded model, ID:', ctx.id)
              log('Loaded model in', endTime - startTime, "ms")
              whisperContextRef.current = ctx
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
