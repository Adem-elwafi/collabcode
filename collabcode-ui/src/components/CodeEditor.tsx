import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { OnChange } from '@monaco-editor/react';
import WebSocketService from '../services/WebSocketService';

interface Props {
  roomId: string;
  token: string;
}

interface CodeUpdatePayload {
  type: 'CODE_UPDATE';
  content: string;
}

function isCodeUpdatePayload(payload: unknown): payload is CodeUpdatePayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const maybePayload = payload as { type?: unknown; content?: unknown };
  return maybePayload.type === 'CODE_UPDATE' && typeof maybePayload.content === 'string';
}

const CodeEditor: React.FC<Props> = ({ roomId, token }) => {
  const [code, setCode] = useState<string>('// Start collaborating...');
  const lastReceivedCode = useRef<string>('');

  useEffect(() => {
    // 1. Connect and Subscribe
    WebSocketService.connect(token, () => {});

    // Small delay to ensure connection is established before subscribing
    const timeout = setTimeout(() => {
      WebSocketService.subscribeToRoom(roomId, (payload) => {
        if (isCodeUpdatePayload(payload) && payload.content !== lastReceivedCode.current) {
          lastReceivedCode.current = payload.content;
          setCode(payload.content);
        }
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
      WebSocketService.disconnect();
    };
  }, [roomId, token]);

  const handleEditorChange: OnChange = (value) => {
    const newCode = value || '';
    
    // Only send if the change didn't come from the server
    if (newCode !== lastReceivedCode.current) {
      lastReceivedCode.current = newCode;
      WebSocketService.sendCodeUpdate(roomId, newCode);
      setCode(newCode);
    }
  };

  return (
    <div style={{ height: '90vh', border: '1px solid #444' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        options={{
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
};

export default CodeEditor;