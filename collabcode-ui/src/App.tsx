import CodeEditor from './components/CodeEditor';

function App() {
  // In a real app, you'd get these from a login state or URL params
  const testRoomId = "dsi-project-room-1";
  const testToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZGVtQGV4YW1wbGUuY29tIiwiaWF0IjoxNzc1NDE4MTY3LCJleHAiOjE3NzU1MDQ1Njd9.v2zE4IpDP-YTF4nFNeGkcOkMQYaGLLHbZduWyLjECII"; 
  const testCurrentUser = "Adem";

  return (
    <div className="App">
      <h1>CollabCode Editor</h1>
      {/* This is the moment the WebSocket connection actually triggers! */}
      <CodeEditor roomId={testRoomId} token={testToken} currentUser={testCurrentUser} />
    </div>
  );
}

export default App;