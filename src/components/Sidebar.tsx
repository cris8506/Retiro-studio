import React from 'react';
import { LayoutDashboard, Compass, BookOpen, MessageSquare, Music, Star, Play, Pause, Compass as LogoIcon } from 'lucide-react';
import { MusicTrack } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  retreatName: string;
  activeTrack: MusicTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  retreatName,
  activeTrack,
  isPlaying,
  onTogglePlay
}) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard de Control', icon: LayoutDashboard },
    { id: 'designer', name: 'Diseñador de Retiros', icon: Compass },
    { id: 'library', name: 'Biblioteca de Dinámicas', icon: BookOpen },
    { id: 'assistant', name: 'Asistente IA (Mentor)', icon: MessageSquare },
    { id: 'music', name: 'Biblioteca Musical', icon: Music },
  ];

  return (
    <div id="sidebar-container" className="hidden md:flex flex-col w-72 bg-[#154539] text-white border-r border-[#1a5143] h-screen sticky top-0">
      {/* Brand Logo & Name */}
      <div id="sidebar-header" className="p-6 border-b border-[#1b5346] flex items-center space-x-3 bg-[#0f342b]">
        <div id="logo-badge" className="p-2 bg-[#C5A059] rounded-lg text-white flex items-center justify-center">
          <LogoIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 id="brand-title" className="font-serif text-lg font-bold tracking-tight text-white">RETIRO STUDIO</h1>
          <p id="brand-subtitle" className="text-[10px] tracking-widest text-[#C5A059] uppercase font-semibold">SISTEMA INTELIGENTE</p>
        </div>
      </div>

      {/* Active Retreat Info */}
      <div id="active-retreat-panel" className="px-6 py-4 border-b border-[#1b5346] bg-[#123e33]">
        <span id="active-retreat-badge" className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">
          {retreatName === "Aún no has creado un retiro" ? "Sin retiro activo" : "Retiro en curso"}
        </span>
        <h3 id="active-retreat-title" className="font-serif text-base font-medium truncate text-white leading-tight mt-1">
          {retreatName}
        </h3>
        <p id="active-retreat-facilitator" className="text-[11px] text-[#a4c5b9] mt-1 flex items-center">
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${retreatName === "Aún no has creado un retiro" ? 'bg-gray-400' : 'bg-[#C5A059] animate-pulse'}`}></span>
          {retreatName === "Aún no has creado un retiro" ? "Sin retiro activo" : "Facilitador Activo"}
        </p>
      </div>

      {/* Navigation Links */}
      <nav id="sidebar-navigation" className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#C5A059] text-white shadow-md'
                  : 'text-[#d0e0db] hover:bg-[#1b5346] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Ambient Track Status */}
      {activeTrack && (
        <div id="sidebar-player-status" className="p-4 mx-4 mb-4 bg-[#0f342b] rounded-xl border border-[#1d594b] flex flex-col space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="truncate pr-2">
              <span className="text-[9px] uppercase tracking-wider text-[#C5A059] font-semibold block">Reproduciendo</span>
              <span className="text-xs font-semibold text-white truncate block">{activeTrack.title}</span>
              <span className="text-[10px] text-[#a4c5b9] block truncate">{activeTrack.artist}</span>
            </div>
            <button
              onClick={onTogglePlay}
              className="p-2 bg-[#C5A059] hover:bg-[#b08b47] rounded-full text-white transition-colors flex items-center justify-center flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="w-full bg-[#1b5346] h-1 rounded-full overflow-hidden">
            <div className={`h-full bg-[#C5A059] rounded-full ${isPlaying ? 'w-2/3 animate-pulse' : 'w-2/3'}`}></div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div id="sidebar-footer" className="p-4 text-center border-t border-[#1b5346] bg-[#0f342b] text-[10px] text-[#a4c5b9]">
        <span>Retiro Studio AI © 2026</span>
      </div>
    </div>
  );
};
