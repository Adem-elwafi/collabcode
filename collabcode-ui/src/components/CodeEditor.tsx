import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { OnChange } from '@monaco-editor/react';
import WebSocketService from '../services/WebSocketService';

interface Props {
  roomId: string;
  token: string;
  currentUser: string; 
}

type RoomEvent =
  | { type: 'JOIN'; sender: string }
  | { type: 'LEAVE'; sender: string }
  | { type: 'CODE_UPDATE'; content: string; sender: string };

const isRoomEvent = (payload: unknown): payload is RoomEvent => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const event = payload as Partial<RoomEvent>;
  return typeof event.type === 'string' && typeof event.sender === 'string';
};

const UserList: React.FC<{ users: string[]; currentUser: string }> = ({ users, currentUser }) => {
  return (
    <aside
      style={{
        width: 220,
        padding: '16px',
        background: '#1e1e1e',
        borderRight: '1px solid #333',
        color: '#f3f3f3',
      }}
    >
      <div style={{ marginBottom: 12, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#999' }}>
        Active Users
      </div>

      <div style={{ marginBottom: 16, padding: '8px 10px', borderRadius: 6, background: '#2a2a2a' }}>
        You: {currentUser}
      </div>

      {users.length === 0 ? (
        <div style={{ color: '#999', fontSize: 14 }}>No other users online</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {users.map((user) => (
            <li
              key={user}
              style={{
                padding: '8px 10px',
                marginBottom: 8,
                borderRadius: 6,
                background: '#2a2a2a',
                color: user === currentUser ? '#7dd3fc' : '#f3f3f3',
              }}
            >
              {user === currentUser ? `${user} (you)` : user}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

const CodeEditor: React.FC<Props> = ({ roomId, token, currentUser }) => {
  const [code, setCode] = useState<string>('// Start collaborating...');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'Idle' | 'Saving' | 'Saved'>('Idle');
  const lastReceivedCode = useRef<string>('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    WebSocketService.connect(token, () => {});

    const timeout = setTimeout(() => {
      WebSocketService.subscribeToRoom(roomId, (payload: unknown) => {
        if (!isRoomEvent(payload)) {
          return;
        }

        // Handle Presence Logic
        if (payload.type === 'JOIN') {
          setActiveUsers((prev) => Array.from(new Set([...prev, payload.sender])));
        } else if (payload.type === 'LEAVE') {
          setActiveUsers((prev) => prev.filter((user) => user !== payload.sender));
        }
        
        // Handle Code Sync
        if (payload.type === 'CODE_UPDATE' && payload.content !== lastReceivedCode.current) {
          lastReceivedCode.current = payload.content;
          setCode(payload.content);
        }
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      WebSocketService.disconnect();
    };
  }, [roomId, token]);

  const handleEditorChange: OnChange = (value) => {
    const newCode = value || '';
    if (newCode !== lastReceivedCode.current) {
      // 1. Trigger Visual Save Status
      setSaveStatus('Saving');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveStatus('Saved'), 2500); // Buffer for backend save

      // 2. Sync Code
      lastReceivedCode.current = newCode;
      WebSocketService.sendCodeUpdate(roomId, newCode);
      setCode(newCode);
    }
  };

  return (
    <div style={{ display: 'flex', height: '90vh', border: '1px solid #444' }}>
      <UserList users={activeUsers} currentUser={currentUser} />
      
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
        />
        
        {/* Task C: Save Status Indicator */}
        <div style={{ 
          position: 'absolute', bottom: 10, right: 20, 
          color: '#aaa', fontSize: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px' 
        }}>
          {saveStatus === 'Saving' ? '☁️ Saving...' : '✅ Saved to Cloud'}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;