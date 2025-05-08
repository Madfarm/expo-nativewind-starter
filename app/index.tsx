import { requestAllPermissions } from "@/lib/permissions";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Button,
  GestureResponderEvent
} from "react-native";
import { initWhisper } from 'whisper.rn'
import type { WhisperContext } from "whisper.rn";
import { fileDir, modelHost, createDir, toTimestamp } from "@/lib/util";
import emitter from "@/lib/emitter";




export default function Index() {
  const whisperContextRef = useRef<WhisperContext | null>(null)
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false)
  const [logs, setLogs] = useState(["Campfire mobile"])
  const [transcibeResult, setTranscibeResult] = useState<string | null>(null)
  const transcribeResultRef = useRef<string | null>(null);
  const stopTranscribeRef = useRef<{ stop: () => void } | null>(null)
  const btnRef = useRef<Button | null>(null);
  const stopInProgressRef = useRef(false);
  const activeSubscriptionRef = useRef<((evt: any) => void) | null>(null);

  const log = useCallback((...messages: any[]) => {
    setLogs((prev) => [...prev, messages.join(' ')])
  }, [])

  const callback = async (evt: any) => {
    if (!activeSubscriptionRef.current) {
      return; // We've manually disabled the subscription
    }
  
    const { isCapturing, data } = evt;
  
    if (data?.result.toLowerCase().includes("start")) {
      updateTranscribeResult(data.result);
    }
  
    if (data?.result.toLowerCase().includes("stop")) {
      if (stopInProgressRef.current) {
        log("Stop already in progress, ignoring...");
        return;
      }
      stopInProgressRef.current = true;
  
      log("Stop was detected");
  
      activeSubscriptionRef.current = null;
      stopInProgressRef.current = false;
      emitter.emit("stop", {message: "stop"})
    }
  };

  useEffect(() => {
    whisperContextRef.current?.release()
    whisperContextRef.current = null

    emitter.addListener("stop", async () => {
      log("Stop event emitted")
      
      log(transcribeResultRef.current)
      
      
      setTimeout(async () => {
        if(whisperContextRef.current) {
          log("whisper context still exists")
        }
        
        if(btnRef.current?.props.onPress) {
          await btnRef?.current?.props?.onPress({} as GestureResponderEvent);
          stopTranscribeRef.current = null
        }
      }, 10000);
    })
  }, [])

  const updateTranscribeResult = useCallback((result: string) => {
    transcribeResultRef.current = result;
    setTranscibeResult(result);
  }, []);

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

  const startTranscribe = async (_event?: GestureResponderEvent) => {
    if (stopTranscribeRef?.current) {
      const t0 = Date.now()
      await stopTranscribeRef.current?.stop()
      const t1 = Date.now()
      log('Stopped transcribing in', t1 - t0, 'ms')
      return
    }

    if (!whisperContextRef?.current) return log('No context')

    log('Start realtime transcribing...')
    try {
      await createDir(log)
      const { stop, subscribe } =
        await whisperContextRef.current.transcribeRealtime({
          maxLen: 1,
          language: 'en',
          realtimeAudioSec: 60,
          realtimeAudioSliceSec: 25,
          audioOutputPath: "../assets/audio/temp.wav",
        })
      stopTranscribeRef.current = { stop }
      activeSubscriptionRef.current = callback;
      subscribe(callback);
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
            title={stopTranscribeRef.current?.stop ? 'Stop' : 'Realtime'}
            onPress={startTranscribe}
            ref={btnRef}
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

              if (whisperContextRef.current) {
                log('Found previous context')
                await whisperContextRef.current.release()
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
