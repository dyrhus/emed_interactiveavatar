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
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";


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
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>("");
  const [eventCounter, setEventCounter] = useState(0);
  const [currentScript, setCurrentScript] = useState<string>("");
  
  const logDebug = (message: string) => {
    setDebug(prev => prev + '\n' + message);
    // eslint-disable-next-line no-console
    console.log(message);
  };

  const incrementEventCounter = () => {
    setEventCounter(prev => prev + 1);
  };
  const knowledgeId = "046b4e319f334715a246e6b9977e42ca";
  const avatarId = "Elenora_FitnessCoach_public";
  const [language, setLanguage] = useState<string>("en");

  const [, setData] = useState<StartAvatarResponse>();
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [showQAButton, setShowQAButton] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);

  const activateQA = async () => {
    try {
      // Initialize voice chat capabilities
      setDebug("[Q&A Flow] Initializing voice chat capabilities");
      await avatar.current?.closeVoiceChat();
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false,
      });
      setDebug("[Q&A Flow] Voice chat capabilities initialized");

      // Request microphone permissions
      setDebug("[Q&A Flow] Requesting microphone access");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setDebug("[Q&A Flow] Microphone access granted");
      
      // Hide the activation button
      setShowQAButton(false);
      
      // Start Q&A
      await avatar.current?.speak({
        text: "Great! Now that we have voice chat set up, I'm ready to answer any questions you have about eMed's GLP-1 program. What would you like to know?",
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
    } catch (error) {
      setDebug(`[Q&A Flow] Error during setup: ${error}`);
    }
  };

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
      const timestamp = new Date().toISOString();
      const message = `[${timestamp}] Avatar started talking ${eventCounter + 1}${currentScript ? `: ${currentScript}` : ''}`;
      logDebug(message);
      
      // Show Q&A button only when QA Permission Script starts
      if (currentScript === "QA Permission Script") {
        setShowQAButton(true);
      }
      
      incrementEventCounter();
    });

    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      const timestamp = new Date().toISOString();
      incrementEventCounter();
      const message = `[${timestamp}] Avatar stopped talking ${eventCounter + 1}`;
      logDebug(message);
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
      setIsVoiceChatActive(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, () => {
      setDebug("User stopped talking");
      setIsVoiceChatActive(false);
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeId: knowledgeId,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.EXCITED,
        },
        language: language,
        disableIdleTimeout: true,
      });

      setData(res);

      // Initialize with custom script if provided
      const initialGreeting = initialScript || 
        "Hi, my name is Emmy, do you have any questions about eMed's Weightloss program? I'm here to help.";

      logDebug("[Session Start] Starting script sequence");
      await playCompleteScript(initialGreeting);

    } catch (error) {
      setDebug(`Error starting avatar session: ${error}`);
    } finally {
      setIsLoadingSession(false);
    }
  }
  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }


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
  const playCompleteScript = async (initialGreeting: string) => {
    if (!avatar.current) return;

    try {
      setCurrentScript("Intro Script");
      setDebug("[Script Flow] Playing initial greeting");
      await avatar.current.speak({
        text: initialGreeting,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });

      setCurrentScript("Demo Player Script");
      setDebug("[Script Flow] Playing demo script");
      await avatar.current.speak({
        text: DEMO_PLAYER_SCRIPT,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
      setDebug("[Script Flow] Demo script completed");

      // Play outro if provided
      if (outroScript) {
        setCurrentScript("Outro Script");
        setDebug("[Script Flow] Starting outro sequence");
        await avatar.current.speak({
          text: outroScript,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC
        });
        setDebug("[Script Flow] Outro script completed");

        // If Q&A is enabled, start Q&A setup
        if (includeQA) {
          try {
            // Brief pause after outro
            await new Promise(resolve => setTimeout(resolve, 1000));
            setDebug("[Q&A Flow] Brief pause completed");
            
            // Play permission message and show button
            setDebug("[Q&A Flow] Playing permission message");
            const handleSpeechStart = () => {
              setShowQAButton(true);
              avatar.current?.off(StreamingEvents.AVATAR_START_TALKING, handleSpeechStart);
            };
            avatar.current.on(StreamingEvents.AVATAR_START_TALKING, handleSpeechStart);
            
            setCurrentScript("QA Permission Script");
            await avatar.current.speak({
              text: QA_PERMISSION_SCRIPT,
              taskType: TaskType.REPEAT,
              taskMode: TaskMode.SYNC
            });
          } catch (error) {
            setDebug(`[Q&A Flow] Error during Q&A setup: ${error}`);
          }
        }
      }
    } catch (error) {
      setDebug(`Error playing complete script: ${error}`);
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
              <div className="w-full flex justify-center items-center">
                {showQAButton ? (
                  <Button
                    className="bg-black text-white hover:bg-gray-900"
                    onClick={activateQA}
                    size="md"
                    variant="shadow"
                  >
                    Activate Q&A
                  </Button>
                ) : isVoiceChatActive ? (
                  <Button
                    className="bg-black text-white hover:bg-gray-900"
                    size="md"
                    variant="shadow"
                  >
                    Listening...
                  </Button>
                ) : (
                  <Image
                    src="/eMed Logo 200x100.png"
                    alt="eMed Logo"
                    width={100}
                    height={50}
                  />
                )}
              </div>
            </CardFooter>
          </Card>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="font-bold mb-2">Avatar Speech Events:</p>
            <div className="font-mono text-sm h-40 overflow-y-auto">
              {debug}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}
