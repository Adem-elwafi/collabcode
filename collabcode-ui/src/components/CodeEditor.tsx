import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { OnChange } from '@monaco-editor/react';
import WebSocketService from '../services/WebSocketService';
import type { SocketMessage } from '../services/WebSocketService';
// ...existing code...
interface Props {
  roomId: string;
  token: string;
}

function isCodeUpdatePayload(payload: unknown): payload is SocketMessage {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  if (!('type' in payload) || !('content' in payload) || !('sender' in payload)) {
    return false;
  }

  const candidate = payload as {
    type: unknown;
    content: unknown;
    sender: unknown;
  };

  return (
    candidate.type === 'CODE_UPDATE' &&
    typeof candidate.content === 'string' &&
    typeof candidate.sender === 'string'
  );
}

const CodeEditor: React.FC<Props> = ({ roomId, token }) => {
  const [code, setCode] = useState<string>('// Start collaborating...');
  const lastReceivedCode = useRef<string>('');
  // Use a ref for the editor instance to avoid unnecessary re-renders
  const editorRef = useRef<unknown>(null);

  useEffect(() => {
    // 1. Establish Connection
    WebSocketService.connect(token, () => {});

    // 2. Subscribe with a small delay to ensure connection is ready
    const timeout = setTimeout(() => {
      WebSocketService.subscribeToRoom(roomId, (payload) => {
        if (isCodeUpdatePayload(payload)) {
          if (payload.content !== lastReceivedCode.current) {
            lastReceivedCode.current = payload.content;
            setCode(payload.content);
          }
        }
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      WebSocketService.disconnect();
    };
  }, [roomId, token]);

  const handleEditorChange: OnChange = (value) => {
    const newCode = value || '';
    if (newCode !== lastReceivedCode.current) {
      lastReceivedCode.current = newCode;
      WebSocketService.sendCodeUpdate(roomId, newCode);
      setCode(newCode);
    }
  };

  return (
    <div style={{ height: '90vh', width: '100%', border: '1px solid #444' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        options={{
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;