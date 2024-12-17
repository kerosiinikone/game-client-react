export interface Card {
  Suit: string;
  Value: string;
}

export type ScoreCardTuple = [Card, number];

export interface Message {
  Typ: number;
  Data?: string;
  PlayerId?: number;
  Card?: Card;
  Won?: boolean;
  War?: boolean;
}
