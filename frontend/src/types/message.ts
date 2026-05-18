export interface AssignedMessageUser {
  id: string;
  fullName?: string;
  email?: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface MessageRecipient extends AssignedMessageUser {
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
  summary?: string;
  status: 'unread' | 'read' | 'replied';
  messageType?: 'contact' | 'internal';
  recipientRole?: 'student' | 'teacher' | 'admin';
  readAt?: string;
  repliedAt?: string;
  createdAt?: string;
  assignedTo?: AssignedMessageUser;
  recipientUser?: AssignedMessageUser;
  senderUser?: AssignedMessageUser;
}
