import React from 'react';
import { Shield, Server, Laptop, Wrench, Settings } from 'lucide-react';

export type NavTab = 'HOME' | 'SERVERS' | 'VPS MGR' | 'TOOLS' | 'CONFIG';

interface BottomNavBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'HOME' as NavTab, label: 'HOME', icon: Shield },
    { id: 'SERVERS' as NavTab, label: 'SERVERS', icon: Server },
    { id: 'VPS MGR' as NavTab, label: 'VPS MGR', icon: Laptop },
    { id: 'TOOLS' as NavTab, label: 'TOOLS', icon: Wrench },
    { id: 'CONFIG' as NavTab, label: 'CONFIG', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070c09]/95 backdrop-blur-md border-t border-[#13241a] px-2 py-1.5 flex items-center justify-around max-w-lg mx-auto shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-emerald-400 font-extrabold'
                : 'text-[#4e7a61] hover:text-[#76aa8c] active:scale-95'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]' : ''
                }`}
              />
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </div>
            <span
              className={`text-[10px] font-mono tracking-wider mt-1 transition-colors ${
                isActive ? 'text-emerald-400 font-bold' : 'text-[#48725b]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
