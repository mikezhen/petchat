import { Message } from './message.entity';

export class Chat {
  id: string;
  createdBy: string;
  createdAt: Date;
  recentMessage: Message;
  members: string[];
}
