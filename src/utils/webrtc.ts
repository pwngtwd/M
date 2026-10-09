import Peer, { MediaConnection, DataConnection } from 'peerjs';
import { Participant, WebRTCMessage } from '../types/meet';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

export interface WebRTCManagerCallbacks {
  onParticipantJoined: (participant: Participant) => void;
  onParticipantLeft: (peerId: string) => void;
  onParticipantStream: (peerId: string, stream: MediaStream) => void;
  onParticipantStateChange: (peerId: string, state: Partial<Participant>) => void;
  onMessageReceived: (message: WebRTCMessage) => void;
  onConnectionStatusChange: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected') => void;
  onError: (err: any) => void;
}

export class WebRTCManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private localUser: { id: string; name: string; avatarColor: string } | null = null;
  private roomId: string = '';
  private isAnchor: boolean = false;
  private mediaConnections: Map<string, MediaConnection> = new Map();
  private dataConnections: Map<string, DataConnection> = new Map();
  private knownPeers: Set<string> = new Set();
  private pingInterval: any = null;

  constructor(private callbacks: WebRTCManagerCallbacks) {}

  public async init(
    roomId: string,
    userName: string,
    avatarColor: string,
    localStream: MediaStream
  ): Promise<string> {
    this.roomId = roomId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    this.localStream = localStream;

    this.callbacks.onConnectionStatusChange('connecting');

    // Clean up any existing connection
    this.destroy();

    const shortId = Math.random().toString(36).substring(2, 7);
    const anchorId = `gm-${this.roomId}-hub`;
    const randomPeerId = `gm-${this.roomId}-${shortId}`;

    return new Promise((resolve) => {
      // First attempt to become the Room Hub / Anchor
      const peerOptions = {
        config: {
          iceServers: ICE_SERVERS,
        },
      };

      const tryAsAnchor = new Peer(anchorId, peerOptions);

      let anchorResolved = false;

      tryAsAnchor.on('open', (id) => {
        anchorResolved = true;
        this.peer = tryAsAnchor;
        this.isAnchor = true;
        this.localUser = { id, name: userName, avatarColor };
        this.setupPeerListeners();
        this.callbacks.onConnectionStatusChange('connected');
        this.startHeartbeat();
        resolve(id);
      });

      tryAsAnchor.on('error', (err: any) => {
        // If anchor ID is already taken, someone else is the room anchor -> connect as member
        if (!anchorResolved && (err.type === 'unavailable-id' || err.message?.includes('taken') || err.message?.includes('ID'))) {
          anchorResolved = true;
          tryAsAnchor.destroy();

          const memberPeer = new Peer(randomPeerId, peerOptions);

          memberPeer.on('open', (id) => {
            this.peer = memberPeer;
            this.isAnchor = false;
            this.localUser = { id, name: userName, avatarColor };
            this.setupPeerListeners();
            this.callbacks.onConnectionStatusChange('connected');
            this.startHeartbeat();

            // Connect to anchor hub
            this.connectToPeer(anchorId);
            resolve(id);
          });

          memberPeer.on('error', (memberErr) => {
            this.callbacks.onError(memberErr);
          });
        } else {
          this.callbacks.onError(err);
        }
      });
    });
  }

  private setupPeerListeners() {
    if (!this.peer) return;

    // Incoming Media Calls
    this.peer.on('call', (call) => {
      if (this.localStream) {
        call.answer(this.localStream);
      } else {
        call.answer();
      }

      const remotePeerId = call.peer;
      this.mediaConnections.set(remotePeerId, call);

      call.on('stream', (remoteStream) => {
        this.callbacks.onParticipantStream(remotePeerId, remoteStream);
      });

      call.on('close', () => {
        this.mediaConnections.delete(remotePeerId);
        this.handlePeerLeave(remotePeerId);
      });

      call.on('error', (err) => {
        console.warn('Call error with peer', remotePeerId, err);
      });
    });

    // Incoming Data Connections
    this.peer.on('connection', (conn) => {
      this.setupDataConnection(conn);
    });

    this.peer.on('disconnected', () => {
      this.callbacks.onConnectionStatusChange('reconnecting');
      this.peer?.reconnect();
    });

    this.peer.on('close', () => {
      this.callbacks.onConnectionStatusChange('disconnected');
    });
  }

  private setupDataConnection(conn: DataConnection) {
    const peerId = conn.peer;
    this.dataConnections.set(peerId, conn);

    conn.on('open', () => {
      // Send self user info
      if (this.localUser) {
        conn.send({
          type: 'USER_INFO',
          senderId: this.localUser.id,
          senderName: this.localUser.name,
          payload: {
            avatarColor: this.localUser.avatarColor,
            isAudioMuted: !this.localStream?.getAudioTracks().some(t => t.enabled),
            isVideoMuted: !this.localStream?.getVideoTracks().some(t => t.enabled),
          },
        } as WebRTCMessage);
      }

      // If this peer is the anchor hub, send peer discovery list
      if (this.isAnchor) {
        const otherPeers = Array.from(this.dataConnections.keys()).filter((id) => id !== peerId);
        if (otherPeers.length > 0) {
          conn.send({
            type: 'PEER_DISCOVERY',
            senderId: this.localUser?.id || '',
            senderName: this.localUser?.name || 'Hub',
            payload: { peerIds: otherPeers },
          } as WebRTCMessage);
        }

        // Notify other peers of newcomer
        this.broadcast({
          type: 'PEER_DISCOVERY',
          senderId: this.localUser?.id || '',
          senderName: this.localUser?.name || 'Hub',
          payload: { peerIds: [peerId] },
        }, [peerId]);
      }
    });

    conn.on('data', (data: any) => {
      this.handleIncomingData(data, peerId);
    });

    conn.on('close', () => {
      this.dataConnections.delete(peerId);
      this.handlePeerLeave(peerId);
    });

    conn.on('error', (err) => {
      console.warn('Data connection error with', peerId, err);
    });
  }

  public connectToPeer(remotePeerId: string) {
    if (!this.peer || remotePeerId === this.peer.id || this.knownPeers.has(remotePeerId)) return;

    this.knownPeers.add(remotePeerId);

    // 1. Data connection
    const conn = this.peer.connect(remotePeerId, { reliable: true });
    this.setupDataConnection(conn);

    // 2. Media call
    if (this.localStream) {
      const call = this.peer.call(remotePeerId, this.localStream);
      this.mediaConnections.set(remotePeerId, call);

      call.on('stream', (remoteStream) => {
        this.callbacks.onParticipantStream(remotePeerId, remoteStream);
      });

      call.on('close', () => {
        this.mediaConnections.delete(remotePeerId);
        this.handlePeerLeave(remotePeerId);
      });

      call.on('error', (err) => {
        console.warn('Call error connecting to', remotePeerId, err);
      });
    }
  }

  private handleIncomingData(data: any, peerId: string) {
    const msg = data as WebRTCMessage;
    if (!msg || !msg.type) return;

    if (msg.type === 'USER_INFO') {
      const newParticipant: Participant = {
        id: peerId,
        name: msg.senderName || 'Guest User',
        isLocal: false,
        isAudioMuted: msg.payload?.isAudioMuted ?? true,
        isVideoMuted: msg.payload?.isVideoMuted ?? true,
        isScreenSharing: false,
        isHandRaised: false,
        isSpeaking: false,
        avatarColor: msg.payload?.avatarColor || '#0494f4',
      };
      this.callbacks.onParticipantJoined(newParticipant);
    } else if (msg.type === 'STATE_UPDATE') {
      this.callbacks.onParticipantStateChange(peerId, msg.payload);
    } else if (msg.type === 'PEER_DISCOVERY') {
      const peerIds: string[] = msg.payload?.peerIds || [];
      peerIds.forEach((id) => {
        if (id && id !== this.peer?.id && !this.knownPeers.has(id)) {
          this.connectToPeer(id);
        }
      });
    } else {
      this.callbacks.onMessageReceived(msg);
    }
  }

  private handlePeerLeave(peerId: string) {
    this.knownPeers.delete(peerId);
    this.mediaConnections.delete(peerId);
    this.dataConnections.delete(peerId);
    this.callbacks.onParticipantLeft(peerId);
  }

  public updateLocalStream(newStream: MediaStream) {
    this.localStream = newStream;
    // Replace track on all active peer connections
    const videoTrack = newStream.getVideoTracks()[0];
    const audioTrack = newStream.getAudioTracks()[0];

    this.mediaConnections.forEach((call) => {
      const peerConn = (call as any).peerConnection as RTCPeerConnection | undefined;
      if (peerConn) {
        const senders = peerConn.getSenders();
        senders.forEach((sender) => {
          if (sender.track?.kind === 'video' && videoTrack) {
            sender.replaceTrack(videoTrack).catch(() => {});
          } else if (sender.track?.kind === 'audio' && audioTrack) {
            sender.replaceTrack(audioTrack).catch(() => {});
          }
        });
      }
    });
  }

  public broadcast(message: WebRTCMessage, excludePeerIds: string[] = []) {
    this.dataConnections.forEach((conn, peerId) => {
      if (!excludePeerIds.includes(peerId) && conn.open) {
        try {
          conn.send(message);
        } catch (e) {
          console.warn('Failed to send message to', peerId, e);
        }
      }
    });
  }

  public sendStateUpdate(state: Partial<Participant>) {
    if (!this.localUser) return;
    this.broadcast({
      type: 'STATE_UPDATE',
      senderId: this.localUser.id,
      senderName: this.localUser.name,
      payload: state,
    });
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.peer && !this.peer.destroyed && this.localUser) {
        this.broadcast({
          type: 'PING',
          senderId: this.localUser.id,
          senderName: this.localUser.name,
          payload: { timestamp: Date.now() },
        });
      }
    }, 15000);
  }

  public destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.mediaConnections.forEach((c) => c.close());
    this.mediaConnections.clear();
    this.dataConnections.forEach((c) => c.close());
    this.dataConnections.clear();
    this.knownPeers.clear();

    if (this.peer && !this.peer.destroyed) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
