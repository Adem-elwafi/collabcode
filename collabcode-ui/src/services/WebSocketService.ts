import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import type { Client, Message, Subscription } from 'stompjs';

class WebSocketService {
  private stompClient: Client | null = null;
  private subscription: Subscription | null = null;
  private onMessageReceived: ((payload: unknown) => void) | null = null;

  connect(jwtToken: string, onMessageReceived: (payload: unknown) => void) {
    this.onMessageReceived = onMessageReceived;

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    const headers = {
      Authorization: `Bearer ${jwtToken}`,
    };

    this.stompClient.connect(headers, () => {
      console.log('Connected to WebSocket');
    }, (error) => {
      console.error('WebSocket Error:', error);
    });
  }

  subscribeToRoom(roomId: string, callback?: (message: unknown) => void) {
    if (this.stompClient && this.stompClient.connected) {
      const handler = callback ?? this.onMessageReceived;

      if (!handler) return;

      this.subscription = this.stompClient.subscribe(
        `/topic/room/${roomId}`,
        (message: Message) => {
          const payload: unknown = JSON.parse(message.body);
          handler(payload);
        }
      );
    }
  }

  sendCodeUpdate(roomId: string, content: string) {
    if (this.stompClient && this.stompClient.connected) {
      const message = {
        type: 'CODE_UPDATE',
        content: content,
        sender: 'User', // You can pull this from JWT/Auth context
      };
      this.stompClient.send(
        `/app/editor.sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
    }
  }

  disconnect() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.stompClient) this.stompClient.disconnect(() => {});
    this.subscription = null;
    this.stompClient = null;
    this.onMessageReceived = null;
  }
}

export default new WebSocketService();