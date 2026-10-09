import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeLobby, generateMeetingCode } from './components/HomeLobby';
import { GreenRoom } from './components/GreenRoom';
import { MeetingRoom } from './components/MeetingRoom';
import { CallEnded } from './components/CallEnded';
import { CloudflareGuideModal } from './components/CloudflareGuideModal';
import { SettingsModal } from './components/SettingsModal';

type AppScreen = 'home' | 'green-room' | 'meeting' | 'ended';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCamOn, setIsCamOn] = useState<boolean>(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Theme state: dark (#212121) by default as requested
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('gothwad_meet_theme');
    if (saved !== null) return saved === 'dark';
    return true; // default dark #212121
  });

  const [mirrorVideo, setMirrorVideo] = useState<boolean>(true);
  const [isCloudflareGuideOpen, setIsCloudflareGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Check URL query parameters or hash on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomFromQuery = searchParams.get('room');

    if (roomFromQuery) {
      const cleanCode = roomFromQuery.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanCode.length >= 3) {
        setRoomId(cleanCode);
        setCurrentScreen('green-room');
      }
    } else if (window.location.hash.startsWith('#/room/')) {
      const hashRoom = window.location.hash.replace('#/room/', '').split('?')[0];
      const cleanCode = hashRoom.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanCode.length >= 3) {
        setRoomId(cleanCode);
        setCurrentScreen('green-room');
      }
    }
  }, []);

  // Update theme classes on body
  useEffect(() => {
    localStorage.setItem('gothwad_meet_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      document.body.style.backgroundColor = '#212121';
      document.body.style.color = '#ffffff';
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#1f2937';
    }
  }, [isDark]);

  // Handle start/join meeting from Home
  const handleStartMeeting = (targetRoomId: string) => {
    setRoomId(targetRoomId);
    // Update URL query string without reloading
    const newUrl = `${window.location.pathname}?room=${targetRoomId}`;
    window.history.pushState({ room: targetRoomId }, '', newUrl);
    setCurrentScreen('green-room');
  };

  const [selectedEffect, setSelectedEffect] = useState<any>('none');

  // Handle joining from GreenRoom
  const handleJoinMeeting = (
    name: string,
    mic: boolean,
    cam: boolean,
    stream: MediaStream,
    effect: any = 'none'
  ) => {
    setUserName(name);
    setIsMicOn(mic);
    setIsCamOn(cam);
    setLocalStream(stream);
    setSelectedEffect(effect);
    setCurrentScreen('meeting');
  };

  // Leave call
  const handleLeaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setCurrentScreen('ended');
  };

  // Rejoin room
  const handleRejoin = () => {
    setCurrentScreen('green-room');
  };

  // Back to home
  const handleGoHome = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    // Clean URL
    window.history.pushState({}, '', window.location.pathname);
    setRoomId('');
    setCurrentScreen('home');
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#212121] text-white' : 'bg-white text-neutral-900'
      }`}
    >
      {/* Top Navigation */}
      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCloudflareGuide={() => setIsCloudflareGuideOpen(true)}
        roomId={roomId}
        inMeeting={currentScreen === 'meeting'}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {currentScreen === 'home' && (
          <HomeLobby
            isDark={isDark}
            onStartMeeting={handleStartMeeting}
            onOpenCloudflareGuide={() => setIsCloudflareGuideOpen(true)}
          />
        )}

        {currentScreen === 'green-room' && (
          <GreenRoom
            roomId={roomId}
            isDark={isDark}
            onJoinMeeting={handleJoinMeeting}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onBackToHome={handleGoHome}
          />
        )}

        {currentScreen === 'meeting' && localStream && (
          <MeetingRoom
            roomId={roomId}
            userName={userName}
            initialMicOn={isMicOn}
            initialCamOn={isCamOn}
            localStream={localStream}
            isDark={isDark}
            onLeaveCall={handleLeaveCall}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenCloudflareGuide={() => setIsCloudflareGuideOpen(true)}
            mirrorVideo={mirrorVideo}
            initialEffect={selectedEffect}
          />
        )}

        {currentScreen === 'ended' && (
          <CallEnded
            roomId={roomId}
            onRejoin={handleRejoin}
            onGoHome={handleGoHome}
            onOpenCloudflareGuide={() => setIsCloudflareGuideOpen(true)}
            isDark={isDark}
          />
        )}
      </main>

      {/* Cloudflare Pages vs Workers Deployment Guide Modal */}
      <CloudflareGuideModal
        isOpen={isCloudflareGuideOpen}
        onClose={() => setIsCloudflareGuideOpen(false)}
        isDark={isDark}
      />

      {/* Audio / Video Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        mirrorVideo={mirrorVideo}
        onToggleMirror={() => setMirrorVideo((v) => !v)}
      />
    </div>
  );
}
