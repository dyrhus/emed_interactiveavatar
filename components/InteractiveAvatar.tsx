import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import { DEMO_PLAYER_SCRIPT, QA_PERMISSION_SCRIPT } from "@/app/lib/demoScripts";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";

import { STT_LANGUAGE_LIST } from "@/app/lib/constants";

interface InteractiveAvatarProps {
  initialScript?: string;
  outroScript?: string;
  includeQA?: boolean;
}

export default function InteractiveAvatar({
  initialScript,
  outroScript,
  includeQA = false
}: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>("");
  
  const logDebug = (message: string) => {
    console.log(message);
    setDebug(message);
  };
  const knowledgeId = "046b4e319f334715a246e6b9977e42ca";
  const avatarId = "Elenora_FitnessCoach_public";
  const [language, setLanguage] = useState<string>("en");

  const [, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      return token;
    } catch (error) {
      setDebug(`Error fetching access token: ${error}`);
    }

    return "";
  }

  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });

    // Set up event listeners
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
      setDebug("Avatar started talking");
    });

    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      setDebug("Avatar stopped talking");
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      setDebug("Stream disconnected");
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      setDebug("Stream ready");
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, () => {
      setDebug("User started talking");
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, () => {
      setDebug("User stopped talking");
      setIsUserTalking(false);
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeId: knowledgeId, // Or use a custom `knowledgeBase`.
        voice: {
          rate: 1.5, // 0.5 ~ 1.5
          emotion: VoiceEmotion.EXCITED,
          // elevenlabsSettings: {
          //   stability: 1,
          //   similarity_boost: 1,
          //   style: 1,
          //   use_speaker_boost: false,
          // },
        },
        language: language,
        disableIdleTimeout: true,
      });

      setData(res);

      // Initialize with custom script if provided
      const initialGreeting = initialScript || 
        "Hi, my name is Emmy, do you have any questions about eMed's Weightloss program? I'm here to help.";

      // Ensure voice chat is disabled initially
      await avatar.current?.closeVoiceChat();
      setChatMode("text_mode");
      logDebug("[Session Start] Voice chat disabled, text mode active");

      // Play the complete script sequence without Q&A setup
      await playCompleteScript(initialGreeting, false);

    } catch (error) {
      setDebug(`Error starting avatar session: ${error}`);
    } finally {
      setIsLoadingSession(false);
    }
  }
  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    // speak({ text: text, task_type: TaskType.REPEAT })
    await avatar.current
      .speak({ text: text, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC })
      .catch((e) => {
        setDebug(e.message);
      });
    setIsLoadingRepeat(false);
  }
  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    if (v === "text_mode") {
      avatar.current?.closeVoiceChat();
    } else {
      await avatar.current?.startVoiceChat();
    }
    setChatMode(v);
  });

  const previousText = usePrevious(text);

  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);


  // Function to play the complete script sequence
  const playCompleteScript = async (initialGreeting: string, includeQASetup: boolean = true) => {
    if (!avatar.current) return;

    try {
      // Play initial greeting
      setDebug("[Script Flow] Playing initial greeting");
      await avatar.current.speak({
        text: initialGreeting,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });

      // Play demo script
      setDebug("[Script Flow] Playing demo script");
      await avatar.current.speak({
        text: DEMO_PLAYER_SCRIPT,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
      setDebug("[Script Flow] Demo script completed");

      // Play outro if provided
      if (outroScript) {
        setDebug("[Script Flow] Starting outro sequence");
        await playOutroScript(includeQASetup);
      }
    } catch (error) {
      setDebug(`Error playing complete script: ${error}`);
    }
  };

  // Function to play outro script and handle Q&A setup
  const playOutroScript = async (setupQA: boolean = true) => {
    if (!avatar.current || !outroScript) return;
    
    try {
      logDebug("[Outro Flow] Starting outro sequence");
      
      // Ensure voice chat is closed before starting
      await avatar.current?.closeVoiceChat();
      logDebug("[Outro Flow] Voice chat closed");
      
      // Play outro script
      logDebug("[Outro Flow] Playing outro script");
      await avatar.current.speak({
        text: outroScript,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
      logDebug("[Outro Flow] Outro script completed");

      // Brief pause after outro
      await new Promise(resolve => setTimeout(resolve, 1000));
      logDebug("[Outro Flow] Post-outro pause completed");

      // If Q&A is enabled and setup is requested, handle the Q&A setup
      if (includeQA && setupQA) {
        logDebug("[Outro Flow] Q&A is enabled, proceeding with setup");
        logDebug("[Q&A Flow] Starting Q&A permission sequence");
        
        // Ensure voice chat is disabled before permission message
        await avatar.current?.closeVoiceChat();
        logDebug("[Q&A Flow] Voice chat explicitly disabled before permission message");
        
        // Play Q&A permission message first
        logDebug("[Q&A Flow] Playing permission message");
        await avatar.current.speak({
          text: QA_PERMISSION_SCRIPT,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC
        });
        logDebug("[Q&A Flow] Permission message completed");
        
        // Important pause to ensure the message is fully delivered
        logDebug("[Q&A Flow] Starting post-permission-message pause");
        await new Promise(resolve => setTimeout(resolve, 3000));
        logDebug("[Q&A Flow] Post-permission-message pause completed");
        
        // Now handle microphone permissions
        logDebug("[Q&A Flow] Beginning microphone permission sequence");
        try {
          // Check current permission status
          const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          logDebug(`[Q&A Flow] Initial permission status: ${permissionResult.state}`);
          
          // Request microphone access
          logDebug("[Q&A Flow] Requesting microphone access");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          logDebug("[Q&A Flow] Microphone access granted successfully");
          
          // Clean up test stream
          stream.getTracks().forEach(track => {
            track.stop();
            logDebug("[Q&A Flow] Test stream cleaned up");
          });
          
          // Initialize voice chat
          logDebug("[Q&A Flow] Starting voice chat initialization");
          await avatar.current?.startVoiceChat({
            useSilencePrompt: false,
          });
          logDebug("[Q&A Flow] Voice chat initialized successfully");
          setChatMode("voice_mode");
          logDebug("[Q&A Flow] Chat mode set to voice");
          
          // Automatically start Q&A interaction
          logDebug("[Q&A Flow] Starting Q&A interaction");
          await avatar.current.speak({
            text: "I'm ready to answer any questions you have about eMed's GLP-1 program. What would you like to know?",
            taskType: TaskType.REPEAT,
            taskMode: TaskMode.SYNC
          });
          logDebug("[Q&A Flow] Q&A interaction started");
        } catch (error) {
          logDebug(`[Q&A Flow] Error during microphone setup: ${error}`);
          console.error("[Q&A Flow] Microphone setup error:", error);
        }
      }
    } catch (error) {
      logDebug(`Error playing outro script: ${error}`);
      console.error("Outro script error:", error);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-center w-full py-8">
        <div className="relative w-[280px] h-[580px] bg-white rounded-[35px] shadow-xl border-[10px] border-black overflow-hidden">
          {/* iPhone Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[20px] w-[100px] bg-black rounded-b-[15px] z-10"></div>
          
          <Card className="w-full h-full rounded-none">
            <CardBody className="p-0 flex flex-col">
              {stream ? (
                <div className="w-full h-[480px] justify-center items-center flex overflow-hidden">
                  <video
                    ref={mediaStream}
                    autoPlay
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  >
                    <track kind="captions" />
                  </video>
                  <div className="absolute top-8 right-6 z-10">
                    <Button
                      className="bg-black text-white rounded-lg hover:bg-gray-900"
                      size="sm"
                      variant="shadow"
                      onClick={endSession}
                    >
                      End session
                    </Button>
                  </div>
                </div>
              ) : !isLoadingSession ? (
                <div className="h-full justify-center items-center flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2 w-full max-w-[260px]">
                  <Select
                    className="max-w-xs"
                    label="Select language"
                    placeholder="Select language"
                    selectedKeys={[language]}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                    }}
                  >
                    {STT_LANGUAGE_LIST.map((lang) => (
                      <SelectItem key={lang.key}>{lang.label}</SelectItem>
                    ))}
                  </Select>
                </div>
                <Button
                  className="bg-black w-full text-white hover:bg-gray-900"
                  size="md"
                  variant="shadow"
                  onClick={startSession}
                >
                  Start session
                </Button>
              </div>
            ) : (
              <Spinner color="default" size="lg" />
            )}
          </CardBody>
          <Divider />
            <CardFooter className="flex flex-col gap-3 relative border-t">
              {includeQA && (
                <Tabs
                  aria-label="Options"
                  selectedKey={chatMode}
                  onSelectionChange={(v) => {
                    handleChangeChatMode(v);
                  }}
                >
                  <Tab key="text_mode" title="Text mode" />
                  <Tab key="voice_mode" title="Voice mode" />
                </Tabs>
              )}
              {chatMode === "text_mode" ? (
                <div className="w-full flex relative">
                  <InteractiveAvatarTextInput
                    disabled={!stream}
                    input={text}
                    label="Chat"
                    loading={isLoadingRepeat}
                    placeholder="Type something for the avatar to respond"
                    setInput={setText}
                    onSubmit={handleSpeak}
                  />
                  {text && (
                    <Chip className="absolute right-16 top-3">Listening</Chip>
                  )}
                </div>
              ) : (
                <div className="w-full flex justify-center items-center">
                  <Button
                    className="bg-black text-white hover:bg-gray-900"
                    isDisabled={!isUserTalking}
                    size="md"
                    variant="shadow"
                  >
                    {isUserTalking ? "Listening" : "Voice chat"}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
          <p className="font-mono text-right">
            <span className="font-bold">Console:</span>
            <br />
            {debug}
          </p>
        </div>
      </div>
    </div>
    );
}
