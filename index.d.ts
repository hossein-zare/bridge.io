import { IncomingMessage } from "http";
export as namespace BridgeIOLib
export = BridgeIO;

declare class BridgeIO {
  constructor(app: typeof import("express") | any, server: any, config: BridgeIO.Config)
 
  auth(callback: BridgeIO.AuthCallback): void;
  on(event: BridgeIO.IOEventName, callback: BridgeIO.IOCallback): void;
  to(id: string): BridgeIO.Cast;
  broadcast(event: string, data: string | object | boolean | number): void;
  channel(channel: string | string[], except?: string[]): BridgeIO.Cast;

  clients: BridgeIO.Client;
  channels: BridgeIO.Channel;
}

declare namespace BridgeIO {
  export interface Config {
    noServer: boolean;
  }

  export type AuthCallback = (socket: Socket, request: IncomingMessage) => Promise<boolean> | boolean;

  export type IOEventName = "connection";
  export type IOCallback = (socket: Socket, request: IncomingMessage) => void;

  type SocketCallback<DT = any> = (io: BridgeIO, socket: Socket, data: DT, response: SocketCallbackResponse) => void;
  type SocketCallbackDisconnected = (io: BridgeIO, socket: Socket, e: number) => void;

  type Socket<T = any> = T & {
    on(event: string, callback: SocketCallback): void;
    on(event: "disconnected", callback: SocketCallbackDisconnected): void;
    cast(event: string, data: string | object | boolean | number): void;
    broadcast(event: string, data: string | object | boolean | number): void;
    channel(channel: ChannelName | string[], except?: string[]): Cast;
    subscribe(channel: ChannelName): void;
    unsubscribe(channel: ChannelName): void;
    close(code?: Number, reason?: string): void;

    id: ClientID;
    channels: ClientID[];
  }

  type SocketCallbackResponse = (data: string | object | boolean | number) => void;

  export interface Cast {
    cast(event: string, data: string | object | boolean | number): void;
  }

  export interface Client {
    all(): Map<ClientID, any>;
    get(id: string): any;
    has(id: string): boolean;
  }

  export interface Channel {
    all(): Map<ChannelName, Set<ClientID>>;
    get(channel: ChannelName): Set<ClientID>;
    has(channel: ChannelName): boolean;
    subscribers(channel: ChannelName | ChannelName[]): ClientID[];
  }

  type ChannelName = string;
  type ClientID = string;
}