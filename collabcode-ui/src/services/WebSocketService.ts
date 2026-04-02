import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';

export interface SocketMessage {
  type: 'CODE_UPDATE';
  content: string;
  sender: string;
}

class WebSocketService {
  private stompClient: Client | null = null;
  private subscription: StompSubscription | null = null;
  private onMessageReceived: ((payload: unknown) => void) | null = null;

  connect(jwtToken: string, onMessageReceived: (payload: unknown) => void) {
    this.disconnect();
    this.onMessageReceived = onMessageReceived;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
      },
      onStompError: (frame) => {
        console.error('Broker reported error:', frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket Error:', event);
      },
    });

    this.stompClient.activate();
  }

  subscribeToRoom(roomId: string, callback?: (message: unknown) => void) {
    if (this.stompClient && this.stompClient.connected) {
      const handler = callback ?? this.onMessageReceived;

      if (!handler) return;

      this.subscription = this.stompClient.subscribe(
        `/topic/room/${roomId}`,
        (message: IMessage) => {
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
        content,
        sender: 'User', // You can pull this from JWT/Auth context
      };
      this.stompClient.publish({
        destination: `/app/editor.sendMessage/${roomId}`,
        body: JSON.stringify(message),
      });
    }
  }

  disconnect() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.stompClient) {
      void this.stompClient.deactivate();
    }
    this.subscription = null;
    this.stompClient = null;
    this.onMessageReceived = null;
  }
}

export default new WebSocketService();