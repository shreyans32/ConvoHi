import React, { useState } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import GroupInfoModal from '../components/chat/GroupInfoModal';
import { useChat } from '../context/ChatContext';
const Dashboard = () => {
  const { activeChat } = useChat();
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="flex h-full w-full relative">
        
        {/* Left Sidebar */}
        <Sidebar />
        {/* Right Chat Flow View */}
        <ChatWindow onOpenGroupInfo={() => setShowGroupInfo(true)} />
        {/* Group Metadata Info Modal Overlay */}
        {showGroupInfo && activeChat && (
          <GroupInfoModal onClose={() => setShowGroupInfo(false)} />
        )}
      </div>
    </div>
  );
};
export default Dashboard;
