export interface Room {
  id: string;
  isPrivate: boolean;
  chatOnly: boolean;
  isStreamOnly: boolean;
  isTransmitting: boolean;
  userCount: number;
  userName?: string;
  hasCamera: boolean;
} 