// Local in-memory cache to replace database functionality
import type { Chat, DBMessage, Vote, Document } from '@/lib/db/schema';
import type { VisibilityType } from '@/components/visibility-selector';

// In-memory storage
const cache = {
  chats: new Map<string, Chat>(),
  messages: new Map<string, DBMessage[]>(),
  votes: new Map<string, Vote[]>(),
  documents: new Map<string, Document[]>(),
  streams: new Map<string, string[]>(),
};

// Chat operations
export function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  const chat: Chat = {
    id,
    createdAt: new Date(),
    userId,
    title,
    visibility,
  };
  
  cache.chats.set(id, chat);
  return Promise.resolve(chat);
}

export function getChatById({ id }: { id: string }) {
  const chat = cache.chats.get(id);
  return Promise.resolve(chat || null);
}

export function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  const allChats = Array.from(cache.chats.values())
    .filter(chat => chat.userId === id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  let filteredChats = allChats;

  if (startingAfter) {
    const startChat = cache.chats.get(startingAfter);
    if (startChat) {
      const startIndex = allChats.findIndex(chat => chat.createdAt.getTime() < startChat.createdAt.getTime());
      if (startIndex >= 0) {
        filteredChats = allChats.slice(startIndex);
      }
    }
  } else if (endingBefore) {
    const endChat = cache.chats.get(endingBefore);
    if (endChat) {
      const endIndex = allChats.findIndex(chat => chat.createdAt.getTime() > endChat.createdAt.getTime());
      if (endIndex >= 0) {
        filteredChats = allChats.slice(0, endIndex);
      }
    }
  }

  const hasMore = filteredChats.length > limit;
  const chats = hasMore ? filteredChats.slice(0, limit) : filteredChats;

  return Promise.resolve({
    chats,
    hasMore,
  });
}

export function deleteChatById({ id }: { id: string }) {
  const chat = cache.chats.get(id);
  if (chat) {
    cache.chats.delete(id);
    cache.messages.delete(id);
    cache.votes.delete(id);
    // Also delete any streams associated with this chat
    const streamKeys = Array.from(cache.streams.keys()).filter(key => key.startsWith(id));
    streamKeys.forEach(key => cache.streams.delete(key));
  }
  return Promise.resolve(chat || null);
}

export function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  const chat = cache.chats.get(chatId);
  if (chat) {
    chat.visibility = visibility;
    cache.chats.set(chatId, chat);
  }
  return Promise.resolve();
}

// Message operations
export function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  messages.forEach(message => {
    const chatMessages = cache.messages.get(message.chatId) || [];
    const existingIndex = chatMessages.findIndex(m => m.id === message.id);
    
    if (existingIndex >= 0) {
      chatMessages[existingIndex] = message;
    } else {
      chatMessages.push(message);
    }
    
    // Sort messages by creation time
    chatMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    cache.messages.set(message.chatId, chatMessages);
  });
  
  return Promise.resolve();
}

export function getMessagesByChatId({ id }: { id: string }) {
  const messages = cache.messages.get(id) || [];
  return Promise.resolve(messages);
}

export function getMessageById({ id }: { id: string }) {
  for (const messages of cache.messages.values()) {
    const message = messages.find(m => m.id === id);
    if (message) {
      return Promise.resolve([message]);
    }
  }
  return Promise.resolve([]);
}

export function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  const messages = cache.messages.get(chatId) || [];
  const filteredMessages = messages.filter(m => m.createdAt.getTime() <= timestamp.getTime());
  cache.messages.set(chatId, filteredMessages);
  return Promise.resolve();
}

export function getMessageCountByUserId({ userId }: { userId: string }) {
  let count = 0;
  for (const [chatId, messages] of cache.messages.entries()) {
    const chat = cache.chats.get(chatId);
    if (chat && chat.userId === userId) {
      count += messages.length;
    }
  }
  return Promise.resolve(count);
}

// Vote operations
export function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  const votes = cache.votes.get(chatId) || [];
  const existingVoteIndex = votes.findIndex(v => v.messageId === messageId);
  
  const newVote: Vote = {
    messageId,
    chatId,
    isUpvoted: type === 'up',
  };
  
  if (existingVoteIndex >= 0) {
    votes[existingVoteIndex] = newVote;
  } else {
    votes.push(newVote);
  }
  
  cache.votes.set(chatId, votes);
  return Promise.resolve();
}

export function getVotesByChatId({ id }: { id: string }) {
  const votes = cache.votes.get(id) || [];
  return Promise.resolve(votes);
}

// Document operations
export function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: any;
  content: string;
  userId: string;
}) {
  const document: Document = {
    id,
    title,
    kind,
    content,
    userId,
    createdAt: new Date(),
  };
  
  const userDocs = cache.documents.get(userId) || [];
  const existingIndex = userDocs.findIndex(d => d.id === id);
  
  if (existingIndex >= 0) {
    userDocs[existingIndex] = document;
  } else {
    userDocs.push(document);
  }
  
  cache.documents.set(userId, userDocs);
  return Promise.resolve();
}

export function getDocumentsById({ id }: { id: string }) {
  const docs = cache.documents.get(id) || [];
  return Promise.resolve(docs);
}

export function getDocumentById({ id }: { id: string }) {
  for (const docs of cache.documents.values()) {
    const doc = docs.find(d => d.id === id);
    if (doc) {
      return Promise.resolve(doc);
    }
  }
  return Promise.resolve(null);
}

export function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  for (const [userId, docs] of cache.documents.entries()) {
    const filteredDocs = docs.filter(d => 
      d.id !== id || d.createdAt.getTime() <= timestamp.getTime()
    );
    cache.documents.set(userId, filteredDocs);
  }
  return Promise.resolve();
}

// Stream operations
export function createStreamId({ streamId, chatId }: { streamId: string; chatId: string }) {
  const streams = cache.streams.get(chatId) || [];
  if (!streams.includes(streamId)) {
    streams.push(streamId);
    cache.streams.set(chatId, streams);
  }
  return Promise.resolve();
}

export function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  const streams = cache.streams.get(chatId) || [];
  return Promise.resolve(streams);
}

// User operations (simplified for guest users)
export function getUser(email: string) {
  // For guest users, we don't need persistent user storage
  return Promise.resolve([]);
}

export function createUser(email: string, password: string) {
  // For guest users, we don't need persistent user storage
  return Promise.resolve([]);
}

export function createGuestUser() {
  // For guest users, we don't need persistent user storage
  return Promise.resolve([]);
}

// Clear cache (useful for development/testing)
export function clearCache() {
  cache.chats.clear();
  cache.messages.clear();
  cache.votes.clear();
  cache.documents.clear();
  cache.streams.clear();
}
