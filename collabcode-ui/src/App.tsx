import CodeEditor from './components/CodeEditor';

function App() {
  // In a real app, you'd get these from a login state or URL params
  const testRoomId = "dsi-project-room-1";
  const testToken = "your_actual_jwt_here"; 

  return (
    <div className="App">
      <h1>CollabCode Editor</h1>
      {/* This is the moment the WebSocket connection actually triggers! */}
      <CodeEditor roomId={testRoomId} token={testToken} />
    </div>
  );
}

export default App;