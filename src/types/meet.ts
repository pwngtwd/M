export interface Participant {
  id: string; // Peer ID
  name: string;
  stream?: MediaStream;
  isLocal: boolean;
  isHost?: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  handRaisedAt?: number;
  isSpeaking: boolean;
  audioLevel?: number;
  avatarColor: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isLocal: boolean;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
}

export interface LiveCaption {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // array of participant IDs
}

export interface Poll {
  id: string;
  question: string;
  creatorId: string;
  creatorName: string;
  options: PollOption[];
  isActive: boolean;
  createdAt: number;
}

export interface HostSettings {
  quickAccess: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowMic: boolean;
  allowCam: boolean;
}

export type LayoutMode = 'auto' | 'tiled' | 'spotlight' | 'sidebar';

export type BackgroundEffect = 'none' | 'slight-blur' | 'heavy-blur' | 'office' | 'gradient' | 'beach';

export interface WebRTCMessage {
  type:
    | 'USER_INFO'
    | 'STATE_UPDATE'
    | 'CHAT_MESSAGE'
    | 'EMOJI_REACTION'
    | 'HAND_RAISE'
    | 'LIVE_CAPTION'
    | 'POLL_CREATE'
    | 'POLL_VOTE'
    | 'HOST_SETTINGS_UPDATE'
    | 'HOST_MUTE_ALL'
    | 'WHITEBOARD_DRAW'
    | 'WHITEBOARD_CLEAR'
    | 'NOTES_UPDATE'
    | 'PEER_DISCOVERY'
    | 'PING';
  payload: any;
  senderId: string;
  senderName: string;
}

export interface DeviceSettings {
  audioInputId: string;
  videoInputId: string;
  audioOutputId: string;
  mirrorVideo: boolean;
  blurBackground: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

export interface WhiteboardPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  isNewStroke?: boolean;
}
