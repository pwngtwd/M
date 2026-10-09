export interface Participant {
  id: string; // Peer ID
  name: string;
  stream?: MediaStream;
  isLocal: boolean;
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

export interface WebRTCMessage {
  type:
    | 'USER_INFO'
    | 'STATE_UPDATE'
    | 'CHAT_MESSAGE'
    | 'EMOJI_REACTION'
    | 'HAND_RAISE'
    | 'WHITEBOARD_DRAW'
    | 'WHITEBOARD_CLEAR'
    | 'PEER_DISCOVERY'
    | 'PING';
  payload: any;
  senderId: string;
  senderName: string;
}

export type MeetingViewMode = 'grid' | 'spotlight' | 'sidebar';

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
