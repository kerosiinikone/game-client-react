export interface Card {
  Suit: string;
  Value: string;
}

export type ScoreCardTuple = [Card, number];

export interface Message {
  Typ?: number;
  Data?: string;
  PlayerId?: number;
  Card?: Card;
  Won?: boolean;
  War?: boolean;
  Config?: Config;
}

// Later when new features are added, this will be updated
type Config = {};

export enum MessageType {
  RoomClosed,
  Handshake,
  PlayerJoined,
  GameStarted,
  RoomDestroyed,
  Player1Turn,
  Player2Turn,
  Player1Played,
  Player2Played,
  GameOver,
}
