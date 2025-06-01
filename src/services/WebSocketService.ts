import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessage {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string;
}

class WebSocketService {
  private client: Client;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private onConnectCallbacks: (() => void)[] = [];

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8080/ws?user=${localStorage.getItem('userEmail')}`),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = this.onConnect.bind(this);
    this.client.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };
  }

  public connect(userEmail: string): void {
    this.client.activate();
  }

  public disconnect(): void {
    this.client.deactivate();
  }

  private onConnect(): void {
    console.log('Connected to WebSocket');
    
    // Subscribe to public topic
    this.client.subscribe('/topic/public', (message) => {
      this.handleMessage(message);
    });

    // Subscribe to user's private queue
    if (this.client.connected) {
      this.client.subscribe('/user/queue/messages', (message) => {
        console.log('Received on private queue:', message.body);
        this.handleMessage(message);
      });
    }
    this.onConnectCallbacks.forEach(cb => cb());
    this.onConnectCallbacks = [];
  }

  public sendMessage(message: any): void {
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    });
  }

  public addUser(userEmail: string): void {
    const message: ChatMessage = {
      senderId: -1,
      receiverId: -1,
      content: '',
    };
    this.client.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify(message),
    });
  }

  private handleMessage(message: Message): void {
    const chatMessage: ChatMessage = JSON.parse(message.body);
    this.messageHandlers.forEach((handler) => handler(chatMessage));
  }

  public onMessage(handler: (message: ChatMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(handler: (message: ChatMessage) => void): void {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  public onConnectCallback(cb: () => void) {
    this.onConnectCallbacks.push(cb);
  }
}

export const webSocketService = new WebSocketService(); 