import { requestAllPermissions } from "@/lib/permissions";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Button
} from "react-native";
import { initWhisper } from 'whisper.rn'
import type { WhisperContext } from "whisper.rn";
import { fileDir, modelHost, createDir, toTimestamp } from "@/lib/util";
import emitter from "@/lib/emitter";



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

  useEffect(() => {
    whisperContextRef.current?.release()
    whisperContextRef.current = null

    emitter.addListener("stopDetected", async () => {
      log("Stop was detected")

      const t0 = Date.now()
      await stopTranscribe?.stop()
      const t1 = Date.now()
      log('Stopped transcribing in', t1 - t0, 'ms')
      setStopTranscribe(null)

      log(transcibeResult)
    })

    return () => {
      emitter.removeAllListeners();
    }
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

  const startTranscribe = async () => {
    if (stopTranscribe?.stop) {
      const t0 = Date.now()
      await stopTranscribe?.stop()
      const t1 = Date.now()
      log('Stopped transcribing button version in', t1 - t0, 'ms')
      setStopTranscribe(null)
      return
    }
    log('Start realtime transcribing...')
    if (!whisperContext) return log('No context')
    try {
      await createDir(log)
      const { stop, subscribe } =
        await whisperContext.transcribeRealtime({
          maxLen: 1,
          language: 'en',
          realtimeAudioSec: 60,
          realtimeAudioSliceSec: 25,
          audioOutputPath: "../assets/audio/temp.wav",
        })
      setStopTranscribe({ stop })
      subscribe(async (evt) => {
        const { isCapturing, data, processTime, recordingTime } = evt

        if (data?.result.toLowerCase().includes("start")) {
          setTranscibeResult(`${data?.result}`)
        }

        if (data?.result.toLowerCase().includes("stop")) {
          emitter.emit("stopDetected", { message: "what up"})
        }

        if (!isCapturing) {
          setStopTranscribe(null)
          log('Finished realtime transcribing')
          log(transcibeResult)
        }
      })
    } catch (e) {
      log('Error:', e)
    }
  }

  return (
    <ScrollView>
      <View className="bg-gray-600 h-screen flex-1 items-center justify-evenly p-4">
        <Text className="text-white text-2xl">Expo Nativewind Starter</Text>

        {permissionsGranted &&
          <Button
            title={stopTranscribe?.stop ? 'Stop' : 'Realtime'}
            onPress={startTranscribe}
          >

          </Button>
        }
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

        {transcibeResult && (
          <View className="bg-white p-2">
            <Text className="text-black text-md">{transcibeResult}</Text>
          </View>
        )}

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
