import React, { useState, useEffect, useRef } from 'react';
import {
  Participant,
  ChatMessage,
  FloatingReaction,
  WhiteboardPoint,
  WebRTCMessage,
  LiveCaption,
  Poll,
  HostSettings,
  LayoutMode,
  BackgroundEffect,
} from '../types/meet';
import { VideoTile } from './VideoTile';
import { ControlBar } from './ControlBar';
import { ChatPanel } from './ChatPanel';
import { PeoplePanel } from './PeoplePanel';
import { InfoPanel } from './InfoPanel';
import { ActivitiesPanel } from './ActivitiesPanel';
import { ReactionsOverlay } from './ReactionsOverlay';
import { CaptionsOverlay } from './CaptionsOverlay';
import { WhiteboardModal } from './WhiteboardModal';
import { ChangeLayoutModal } from './ChangeLayoutModal';
import { VisualEffectsModal } from './VisualEffectsModal';
import { HostControlsModal } from './HostControlsModal';
import { WebRTCManager } from '../utils/webrtc';
import { StreamAudioAnalyser } from '../utils/audioAnalyser';
import { LiveSpeechRecognizer } from '../utils/speechRecognition';
import { sounds } from '../utils/sounds';

interface Props {
  roomId: string;
  userName: string;
  initialMicOn: boolean;
  initialCamOn: boolean;
  localStream: MediaStream;
  isDark: boolean;
  onLeaveCall: () => void;
  onOpenSettings: () => void;
  onOpenCloudflareGuide: () => void;
  mirrorVideo: boolean;
  initialEffect?: BackgroundEffect;
}

const AVATAR_COLORS = [
  '#0494f4',
  '#0f9d58',
  '#db4437',
  '#f4b400',
  '#ab47bc',
  '#00acc1',
  '#ff7043',
];

export const MeetingRoom: React.FC<Props> = ({
  roomId,
  userName,
  initialMicOn,
  initialCamOn,
  localStream,
  isDark,
  onLeaveCall,
  onOpenSettings,
  onOpenCloudflareGuide,
  mirrorVideo,
  initialEffect = 'none',
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(initialMicOn);
  const [isCamOn, setIsCamOn] = useState(initialCamOn);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [captions, setCaptions] = useState<LiveCaption[]>([]);

  // Panels & Modals
  const [activePanel, setActivePanel] = useState<'none' | 'chat' | 'people' | 'info' | 'activities'>('none');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);

  // Layout & Effects State
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>('auto');
  const [maxTiles, setMaxTiles] = useState(16);
  const [currentEffect, setCurrentEffect] = useState<BackgroundEffect>(initialEffect);

  // Host Settings
  const [hostSettings, setHostSettings] = useState<HostSettings>({
    quickAccess: true,
    allowScreenShare: true,
    allowChat: true,
    allowMic: true,
    allowCam: true,
  });

  // Messages, Polls, Notes, Reactions
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [whiteboardPoints, setWhiteboardPoints] = useState<WhiteboardPoint[]>([]);
  const [whiteboardClearTs, setWhiteboardClearTs] = useState<number>(0);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [notesText, setNotesText] = useState('');
  const [isDemoBotActive, setIsDemoBotActive] = useState(false);

  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const localStreamRef = useRef<MediaStream>(localStream);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const localAnalyserRef = useRef<StreamAudioAnalyser | null>(null);
  const speechRecognizerRef = useRef<LiveSpeechRecognizer | null>(null);
  const demoBotIntervalRef = useRef<any>(null);

  const localAvatarColor = useRef(
    AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  ).current;

  // Initialize WebRTC and Speech Recognizer
  useEffect(() => {
    // 1. Setup local participant
    const localPart: Participant = {
      id: 'local-user',
      name: userName,
      stream: localStreamRef.current,
      isLocal: true,
      isHost: true,
      isAudioMuted: !initialMicOn,
      isVideoMuted: !initialCamOn,
      isScreenSharing: false,
      isHandRaised: false,
      isSpeaking: false,
      avatarColor: localAvatarColor,
    };
    setParticipants([localPart]);

    // 2. Setup audio analyser
    localAnalyserRef.current = new StreamAudioAnalyser(localStreamRef.current, (level, isSpeaking) => {
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, audioLevel: level, isSpeaking } : p))
      );
    });

    // 3. Setup speech recognition for live captions
    speechRecognizerRef.current = new LiveSpeechRecognizer((transcript, isFinal) => {
      if (!isMicOn) return;
      const newCaption: LiveCaption = {
        id: Math.random().toString(),
        senderId: 'local-user',
        senderName: userName,
        text: transcript,
        timestamp: Date.now(),
        isFinal,
      };

      setCaptions((prev) => [...prev.slice(-3), newCaption]);

      webrtcManagerRef.current?.broadcast({
        type: 'LIVE_CAPTION',
        senderId: 'local-user',
        senderName: userName,
        payload: newCaption,
      });
    });

    // 4. Initialize WebRTC connection
    const manager = new WebRTCManager({
      onParticipantJoined: (newParticipant) => {
        sounds.playJoinSound();
        setParticipants((prev) => {
          if (prev.some((p) => p.id === newParticipant.id)) return prev;
          return [...prev, newParticipant];
        });
      },
      onParticipantLeft: (peerId) => {
        sounds.playLeaveSound();
        setParticipants((prev) => prev.filter((p) => p.id !== peerId));
        if (pinnedId === peerId) setPinnedId(null);
      },
      onParticipantStream: (peerId, remoteStream) => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === peerId ? { ...p, stream: remoteStream } : p))
        );
      },
      onParticipantStateChange: (peerId, state) => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === peerId ? { ...p, ...state } : p))
        );
      },
      onMessageReceived: (msg: WebRTCMessage) => {
        handleIncomingPeerMessage(msg);
      },
      onConnectionStatusChange: (status) => {
        console.log('WebRTC Connection Status:', status);
      },
      onError: (err) => {
        console.warn('WebRTC Manager Error:', err);
      },
    });

    webrtcManagerRef.current = manager;
    manager.init(roomId, userName, localAvatarColor, localStreamRef.current).then((myPeerId) => {
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, id: myPeerId } : p))
      );
    });

    return () => {
      if (localAnalyserRef.current) localAnalyserRef.current.destroy();
      if (speechRecognizerRef.current) speechRecognizerRef.current.stop();
      if (manager) manager.destroy();
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (demoBotIntervalRef.current) clearInterval(demoBotIntervalRef.current);
    };
  }, [roomId, userName]);

  // Handle live captions start/stop
  useEffect(() => {
    if (isCaptionsOn) {
      speechRecognizerRef.current?.start();
    } else {
      speechRecognizerRef.current?.stop();
      setCaptions([]);
    }
  }, [isCaptionsOn]);

  const handleIncomingPeerMessage = (msg: WebRTCMessage) => {
    if (msg.type === 'CHAT_MESSAGE') {
      sounds.playMessageSound();
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          senderId: msg.senderId,
          senderName: msg.senderName,
          text: msg.payload?.text || '',
          timestamp: msg.payload?.timestamp || Date.now(),
          isLocal: false,
        },
      ]);
      if (activePanel !== 'chat') {
        setUnreadMessagesCount((c) => c + 1);
      }
    } else if (msg.type === 'EMOJI_REACTION') {
      triggerFloatingReaction(msg.payload?.emoji || '👍', msg.senderName);
    } else if (msg.type === 'HAND_RAISE') {
      sounds.playHandRaiseSound();
    } else if (msg.type === 'LIVE_CAPTION') {
      setCaptions((prev) => [...prev.slice(-3), msg.payload]);
    } else if (msg.type === 'POLL_CREATE') {
      setPolls((prev) => [...prev, msg.payload]);
      sounds.playMessageSound();
    } else if (msg.type === 'POLL_VOTE') {
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== msg.payload.pollId) return p;
          return {
            ...p,
            options: p.options.map((opt) => {
              if (opt.id === msg.payload.optionId) {
                return {
                  ...opt,
                  votes: Array.from(new Set([...opt.votes, msg.senderId])),
                };
              }
              return {
                ...opt,
                votes: opt.votes.filter((id) => id !== msg.senderId),
              };
            }),
          };
        })
      );
    } else if (msg.type === 'HOST_SETTINGS_UPDATE') {
      setHostSettings(msg.payload);
    } else if (msg.type === 'HOST_MUTE_ALL') {
      setIsMicOn(false);
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, isAudioMuted: true } : p))
      );
    } else if (msg.type === 'WHITEBOARD_DRAW') {
      setWhiteboardPoints((prev) => [...prev, msg.payload]);
    } else if (msg.type === 'WHITEBOARD_CLEAR') {
      setWhiteboardClearTs(Date.now());
    } else if (msg.type === 'NOTES_UPDATE') {
      setNotesText(msg.payload.text || '');
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (!hostSettings.allowMic && !participants.find((p) => p.isLocal)?.isHost) {
      alert('The host has disabled microphone for participants.');
      return;
    }

    const newState = !isMicOn;
    setIsMicOn(newState);
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = newState));

    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isAudioMuted: !newState } : p))
    );

    webrtcManagerRef.current?.sendStateUpdate({ isAudioMuted: !newState });
  };

  // Toggle Camera
  const toggleCam = () => {
    const newState = !isCamOn;
    setIsCamOn(newState);
    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = newState));

    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isVideoMuted: !newState } : p))
    );

    webrtcManagerRef.current?.sendStateUpdate({ isVideoMuted: !newState });
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!hostSettings.allowScreenShare && !participants.find((p) => p.isLocal)?.isHost) {
      alert('The host has disabled screen sharing for participants.');
      return;
    }

    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      webrtcManagerRef.current?.updateLocalStream(localStreamRef.current);

      setParticipants((prev) =>
        prev.map((p) =>
          p.isLocal ? { ...p, stream: localStreamRef.current, isScreenSharing: false } : p
        )
      );
      webrtcManagerRef.current?.sendStateUpdate({ isScreenSharing: false });
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = displayStream;
        setIsScreenSharing(true);

        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          webrtcManagerRef.current?.updateLocalStream(localStreamRef.current);
          setParticipants((prev) =>
            prev.map((p) =>
              p.isLocal ? { ...p, stream: localStreamRef.current, isScreenSharing: false } : p
            )
          );
          webrtcManagerRef.current?.sendStateUpdate({ isScreenSharing: false });
        };

        webrtcManagerRef.current?.updateLocalStream(displayStream);

        setParticipants((prev) =>
          prev.map((p) =>
            p.isLocal ? { ...p, stream: displayStream, isScreenSharing: true } : p
          )
        );
        webrtcManagerRef.current?.sendStateUpdate({ isScreenSharing: true });
      } catch (err) {
        console.warn('Screen share canceled or failed', err);
      }
    }
  };

  // Toggle Hand Raise
  const toggleHandRaise = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    if (newState) sounds.playHandRaiseSound();

    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isHandRaised: newState } : p))
    );

    webrtcManagerRef.current?.sendStateUpdate({ isHandRaised: newState });
    if (newState) {
      webrtcManagerRef.current?.broadcast({
        type: 'HAND_RAISE',
        senderId: '',
        senderName: userName,
        payload: {},
      });
    }
  };

  // Send Reaction
  const handleSendReaction = (emoji: string) => {
    triggerFloatingReaction(emoji, userName);
    webrtcManagerRef.current?.broadcast({
      type: 'EMOJI_REACTION',
      senderId: '',
      senderName: userName,
      payload: { emoji },
    });
  };

  const triggerFloatingReaction = (emoji: string, sender: string) => {
    const reaction: FloatingReaction = {
      id: Math.random().toString(),
      emoji,
      senderName: sender,
      x: 20 + Math.random() * 60,
    };
    setFloatingReactions((prev) => [...prev, reaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 3000);
  };

  // Chat message
  const handleSendMessage = (text: string) => {
    if (!hostSettings.allowChat && !participants.find((p) => p.isLocal)?.isHost) {
      alert('The host has disabled chat for participants.');
      return;
    }

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      senderId: 'local-user',
      senderName: userName,
      text,
      timestamp: Date.now(),
      isLocal: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    webrtcManagerRef.current?.broadcast({
      type: 'CHAT_MESSAGE',
      senderId: 'local-user',
      senderName: userName,
      payload: { text, timestamp: Date.now() },
    });

    if (isDemoBotActive) {
      setTimeout(() => {
        const botReply: ChatMessage = {
          id: Math.random().toString(),
          senderId: 'demo-bot',
          senderName: 'Echo Bot (Demo)',
          text: `Got your message: "${text}"! WebRTC data connection is live. 🚀`,
          timestamp: Date.now(),
          isLocal: false,
        };
        sounds.playMessageSound();
        setMessages((prev) => [...prev, botReply]);
      }, 1200);
    }
  };

  // Polls
  const handleCreatePoll = (question: string, options: string[]) => {
    const newPoll: Poll = {
      id: Math.random().toString(),
      question,
      creatorId: 'local-user',
      creatorName: userName,
      options: options.map((opt, i) => ({ id: `opt-${i}`, text: opt, votes: [] })),
      isActive: true,
      createdAt: Date.now(),
    };

    setPolls((prev) => [...prev, newPoll]);

    webrtcManagerRef.current?.broadcast({
      type: 'POLL_CREATE',
      senderId: 'local-user',
      senderName: userName,
      payload: newPoll,
    });
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          options: p.options.map((opt) => {
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: Array.from(new Set([...opt.votes, 'local-user'])),
              };
            }
            return {
              ...opt,
              votes: opt.votes.filter((id) => id !== 'local-user'),
            };
          }),
        };
      })
    );

    webrtcManagerRef.current?.broadcast({
      type: 'POLL_VOTE',
      senderId: 'local-user',
      senderName: userName,
      payload: { pollId, optionId },
    });
  };

  // Shared Notes
  const handleChangeNotes = (text: string) => {
    setNotesText(text);
    webrtcManagerRef.current?.broadcast({
      type: 'NOTES_UPDATE',
      senderId: 'local-user',
      senderName: userName,
      payload: { text },
    });
  };

  // Host Controls Update
  const handleUpdateHostSettings = (newSettings: HostSettings) => {
    setHostSettings(newSettings);
    webrtcManagerRef.current?.broadcast({
      type: 'HOST_SETTINGS_UPDATE',
      senderId: 'local-user',
      senderName: userName,
      payload: newSettings,
    });
  };

  const handleMuteAll = () => {
    webrtcManagerRef.current?.broadcast({
      type: 'HOST_MUTE_ALL',
      senderId: 'local-user',
      senderName: userName,
      payload: {},
    });
  };

  // Whiteboard broadcast handlers
  const handleBroadcastDraw = (point: WhiteboardPoint) => {
    webrtcManagerRef.current?.broadcast({
      type: 'WHITEBOARD_DRAW',
      senderId: 'local-user',
      senderName: userName,
      payload: point,
    });
  };

  const handleBroadcastClear = () => {
    webrtcManagerRef.current?.broadcast({
      type: 'WHITEBOARD_CLEAR',
      senderId: 'local-user',
      senderName: userName,
      payload: {},
    });
  };

  // Toggle Demo Bot
  const toggleDemoBot = () => {
    if (isDemoBotActive) {
      setIsDemoBotActive(false);
      setParticipants((prev) => prev.filter((p) => p.id !== 'demo-bot'));
      if (demoBotIntervalRef.current) clearInterval(demoBotIntervalRef.current);
    } else {
      setIsDemoBotActive(true);
      sounds.playJoinSound();

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      let angle = 0;

      const drawBotFrame = () => {
        if (!ctx) return;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.strokeStyle = '#0494f4';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 1.5);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤖 ECHO BOT', 0, 0);
        ctx.restore();

        angle += 0.04;
      };

      const timer = setInterval(drawBotFrame, 50);
      demoBotIntervalRef.current = timer;

      const botStream = canvas.captureStream(30);

      const botParticipant: Participant = {
        id: 'demo-bot',
        name: 'Echo Bot (Demo)',
        stream: botStream,
        isLocal: false,
        isAudioMuted: false,
        isVideoMuted: false,
        isScreenSharing: false,
        isHandRaised: false,
        isSpeaking: true,
        avatarColor: '#10b981',
      };

      setParticipants((prev) => [...prev, botParticipant]);
    }
  };

  const togglePin = (id: string) => {
    setPinnedId((prev) => (prev === id ? null : id));
  };

  const togglePanel = (panel: 'chat' | 'people' | 'info' | 'activities') => {
    setActivePanel((prev) => {
      const next = prev === panel ? 'none' : panel;
      if (next === 'chat') setUnreadMessagesCount(0);
      return next;
    });
  };

  // Determine active speaker / spotlight
  const pinnedParticipant = participants.find((p) => p.id === pinnedId);
  const screenSharingParticipant = participants.find((p) => p.isScreenSharing);
  const activeSpeaker = participants.find((p) => p.isSpeaking && !p.isAudioMuted);

  const isSpotlightMode =
    currentLayout === 'spotlight' ||
    (currentLayout === 'auto' && (pinnedParticipant || screenSharingParticipant));

  const isSidebarMode =
    currentLayout === 'sidebar' ||
    (currentLayout === 'auto' && screenSharingParticipant);

  const mainTileParticipant =
    pinnedParticipant || screenSharingParticipant || activeSpeaker || participants[0];

  return (
    <div
      className={`min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden relative transition-colors duration-200 ${
        isDark ? 'bg-[#212121]' : 'bg-[#181818]'
      }`}
    >
      {/* Floating Reactions */}
      <ReactionsOverlay reactions={floatingReactions} />

      {/* Live Captions (CC) Overlay */}
      <CaptionsOverlay captions={captions} isEnabled={isCaptionsOn} />

      {/* Main Video Stage & Side Panels Container */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-4 gap-3">
        {/* Video Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Spotlight Mode */}
          {isSpotlightMode && mainTileParticipant ? (
            <div className="flex-1 min-h-0 h-full max-w-5xl mx-auto w-full">
              <VideoTile
                participant={mainTileParticipant}
                isPinned={pinnedId === mainTileParticipant.id}
                onTogglePin={togglePin}
                isDark={isDark}
                mirrorLocal={mirrorVideo}
              />
            </div>
          ) : isSidebarMode && mainTileParticipant ? (
            /* Sidebar Mode */
            <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
              <div className="flex-1 min-h-0 h-full">
                <VideoTile
                  participant={mainTileParticipant}
                  isPinned={pinnedId === mainTileParticipant.id}
                  onTogglePin={togglePin}
                  isDark={isDark}
                  mirrorLocal={mirrorVideo}
                />
              </div>

              {/* Side strip */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto w-full lg:w-64 max-h-40 lg:max-h-full shrink-0">
                {participants
                  .filter((p) => p.id !== mainTileParticipant.id)
                  .map((p) => (
                    <div key={p.id} className="w-48 lg:w-full h-28 lg:h-36 shrink-0">
                      <VideoTile
                        participant={p}
                        isPinned={pinnedId === p.id}
                        onTogglePin={togglePin}
                        isDark={isDark}
                        mirrorLocal={mirrorVideo}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* Tiled / Auto Grid Mode */
            <div
              className={`flex-1 grid gap-3 min-h-0 w-full h-full ${
                participants.length === 1
                  ? 'grid-cols-1 max-w-4xl max-h-[75vh] mx-auto my-auto'
                  : participants.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : participants.length <= 4
                  ? 'grid-cols-1 sm:grid-cols-2 grid-rows-2'
                  : participants.length <= 6
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-4'
              }`}
            >
              {participants.slice(0, maxTiles).map((p) => (
                <div key={p.id} className="w-full h-full min-h-[160px]">
                  <VideoTile
                    participant={p}
                    isPinned={pinnedId === p.id}
                    onTogglePin={togglePin}
                    isDark={isDark}
                    mirrorLocal={mirrorVideo}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Drawer Panels */}
        {activePanel === 'chat' && (
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onClose={() => setActivePanel('none')}
            isDark={isDark}
          />
        )}

        {activePanel === 'people' && (
          <PeoplePanel
            participants={participants}
            pinnedId={pinnedId}
            onTogglePin={togglePin}
            onClose={() => setActivePanel('none')}
            roomId={roomId}
            onToggleDemoBot={toggleDemoBot}
            isDemoBotActive={isDemoBotActive}
            isDark={isDark}
          />
        )}

        {activePanel === 'info' && (
          <InfoPanel
            roomId={roomId}
            onClose={() => setActivePanel('none')}
            isDark={isDark}
            onOpenCloudflareGuide={onOpenCloudflareGuide}
          />
        )}

        {activePanel === 'activities' && (
          <ActivitiesPanel
            onClose={() => setActivePanel('none')}
            onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
            polls={polls}
            onCreatePoll={handleCreatePoll}
            onVotePoll={handleVotePoll}
            localUserId="local-user"
            notesText={notesText}
            onChangeNotes={handleChangeNotes}
            isDark={isDark}
          />
        )}
      </div>

      {/* Floating Bottom Control Bar */}
      <ControlBar
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        isCaptionsOn={isCaptionsOn}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleScreenShare={toggleScreenShare}
        onToggleHandRaise={toggleHandRaise}
        onToggleCaptions={() => setIsCaptionsOn((c) => !c)}
        onSendReaction={handleSendReaction}
        onLeaveCall={onLeaveCall}
        activePanel={activePanel}
        onTogglePanel={togglePanel}
        unreadMessagesCount={unreadMessagesCount}
        participantsCount={participants.length}
        onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
        onOpenSettings={onOpenSettings}
        onOpenHostControls={() => setIsHostControlsOpen(true)}
        onOpenChangeLayout={() => setIsLayoutModalOpen(true)}
        onOpenVisualEffects={() => setIsEffectsModalOpen(true)}
        onToggleDemoBot={toggleDemoBot}
        isDemoBotActive={isDemoBotActive}
        roomId={roomId}
        isDark={isDark}
      />

      {/* Whiteboard Modal */}
      <WhiteboardModal
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        onBroadcastDraw={handleBroadcastDraw}
        onBroadcastClear={handleBroadcastClear}
        incomingPoints={whiteboardPoints}
        incomingClearTimestamp={whiteboardClearTs}
        isDark={isDark}
      />

      {/* Change Layout Modal */}
      <ChangeLayoutModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        currentLayout={currentLayout}
        onSelectLayout={(mode) => {
          setCurrentLayout(mode);
          setIsLayoutModalOpen(false);
        }}
        maxTiles={maxTiles}
        onChangeMaxTiles={setMaxTiles}
        isDark={isDark}
      />

      {/* Visual Effects Modal */}
      <VisualEffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        currentEffect={currentEffect}
        onSelectEffect={(eff) => setCurrentEffect(eff)}
        isDark={isDark}
      />

      {/* Host Controls Modal */}
      <HostControlsModal
        isOpen={isHostControlsOpen}
        onClose={() => setIsHostControlsOpen(false)}
        settings={hostSettings}
        onUpdateSettings={handleUpdateHostSettings}
        onMuteAll={handleMuteAll}
        isDark={isDark}
      />
    </div>
  );
};
