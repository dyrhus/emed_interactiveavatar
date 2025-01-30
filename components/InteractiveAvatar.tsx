import type { StartAvatarResponse } from "@heygen/streaming-avatar";

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
}

interface DemoConfig {
  customerName: string;
  introScript: string;
  outroScript: string;
  password?: string;
  demoUrl?: string;
}

export default function InteractiveAvatar({ 
  initialScript,
  outroScript 
}: InteractiveAvatarProps) {
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
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

    // Initialize with custom script if provided
    const initialGreeting = initialScript || 
      "Hi, my name is Emmy, do you have any questions about eMed's Weightloss program? I'm here to help.";
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

      // Add the greeting after session creation
      await avatar.current?.speak({
        text: initialGreeting,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });

      // default to voice mode
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false,
      });
      setChatMode("voice_mode");
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

  const handleDemoGeneration = async (formData: DemoConfig) => {
    setIsGeneratingDemo(true);
    try {
      // Here you would typically make an API call to save the demo configuration
      // and generate a unique URL
      const demoUrl = `${window.location.origin}/demo/${Date.now()}`;
      setDemoConfig({ ...formData, demoUrl });
    } catch (error) {
      setDebug(`Error generating demo: ${error}`);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Custom Demo</h2>
        <DemoCustomizationForm 
          onSubmit={handleDemoGeneration}
          isLoading={isGeneratingDemo}
        />
        {demoConfig?.demoUrl && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Demo URL:</p>
            <p className="text-blue-600">{demoConfig.demoUrl}</p>
          </div>
        )}
      </div>
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
          <div className="flex justify-center mt-4">
            <QAButton
              isDisabled={!stream}
              onStartQA={async () => {
                if (!avatar.current) return;
                await avatar.current.speak({
                  text: "I'm ready to answer any questions you have about eMed's GLP-1 program. What would you like to know?",
                  taskType: TaskType.REPEAT,
                  taskMode: TaskMode.SYNC
                });
              }}
            />
          </div>
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
