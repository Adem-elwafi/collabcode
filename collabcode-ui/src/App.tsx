import { useEffect, useState } from 'react';
import './App.css';
import JoinRoom from './components/JoinRoom';
import MainLayout from './components/MainLayout';
import type { SaveStatus } from './components/CodeEditor';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZGVtQGV4YW1wbGUuY29tIiwiaWF0IjoxNzc1NDE4MTY3LCJleHAiOjE3NzU1MDQ1Njd9.v2zE4IpDP-YTF4nFNeGkcOkMQYaGLLHbZduWyLjECII';
const USERNAME_STORAGE_KEY = 'collabcode.username';

const getStoredUsername = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(USERNAME_STORAGE_KEY) ?? '';
};

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUsername);
  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('Idle');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const trimmedUser = currentUser.trim();
    if (trimmedUser.length > 0) {
      window.localStorage.setItem(USERNAME_STORAGE_KEY, trimmedUser);
    } else {
      window.localStorage.removeItem(USERNAME_STORAGE_KEY);
    }
  }, [currentUser]);

  const handleJoin = () => {
    const trimmedUser = currentUser.trim();
    const trimmedRoomId = roomId.trim();

    if (isJoining || trimmedUser.length === 0 || trimmedRoomId.length === 0) {
      return;
    }

    setIsJoining(true);

    window.setTimeout(() => {
      setIsJoining(false);
      setIsJoined(true);
    }, 550);
  };

  if (!isJoined) {
    return (
      <div className="appShell">
        <JoinRoom
          currentUser={currentUser}
          roomId={roomId}
          isLoading={isJoining}
          onCurrentUserChange={setCurrentUser}
          onRoomIdChange={setRoomId}
          onJoin={handleJoin}
        />
      </div>
    );
  }

  return (
    <div className="appShell">
      <div className="appShell__workspace">
        <MainLayout
          roomId={roomId}
          currentUser={currentUser}
          users={users}
          saveStatus={saveStatus}
          token={TOKEN}
          onUsersChange={setUsers}
          onSaveStatusChange={setSaveStatus}
        />
      </div>
    </div>
  );
}

export default App;