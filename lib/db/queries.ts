import 'server-only';

import type {
  User,
  Chat,
  Document,
  Vote,
  DBMessage,
  Suggestion,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';

// Import local cache functions instead of database
import {
  saveChat as cacheSaveChat,
  getChatById as cacheGetChatById,
  getChatsByUserId as cacheGetChatsByUserId,
  deleteChatById as cacheDeleteChatById,
  updateChatVisiblityById as cacheUpdateChatVisiblityById,
  saveMessages as cacheSaveMessages,
  getMessagesByChatId as cacheGetMessagesByChatId,
  getMessageById as cacheGetMessageById,
  deleteMessagesByChatIdAfterTimestamp as cacheDeleteMessagesByChatIdAfterTimestamp,
  getMessageCountByUserId as cacheGetMessageCountByUserId,
  voteMessage as cacheVoteMessage,
  getVotesByChatId as cacheGetVotesByChatId,
  saveDocument as cacheSaveDocument,
  getDocumentsById as cacheGetDocumentsById,
  getDocumentById as cacheGetDocumentById,
  deleteDocumentsByIdAfterTimestamp as cacheDeleteDocumentsByIdAfterTimestamp,
  createStreamId as cacheCreateStreamId,
  getStreamIdsByChatId as cacheGetStreamIdsByChatId,
  getUser as cacheGetUser,
  createUser as cacheCreateUser,
  createGuestUser as cacheCreateGuestUser,
} from '../cache/local-cache';

// User operations
export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await cacheGetUser(email);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  try {
    return await cacheCreateUser(email, password);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  try {
    return await cacheCreateGuestUser();
  } catch (error) {
    console.error('❌ Failed to create guest user:', error);
    return null;
  }
}

// Chat operations
export async function saveChat({
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
  try {
    return await cacheSaveChat({ id, userId, title, visibility });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await cacheDeleteChatById({ id });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
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
  try {
    return await cacheGetChatsByUserId({ id, limit, startingAfter, endingBefore });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await cacheGetChatById({ id });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await cacheUpdateChatVisiblityById({ chatId, visibility });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

// Message operations
export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await cacheSaveMessages({ messages });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await cacheGetMessagesByChatId({ id });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await cacheGetMessageById({ id });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await cacheDeleteMessagesByChatIdAfterTimestamp({ chatId, timestamp });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function getMessageCountByUserId({ userId }: { userId: string }) {
  try {
    return await cacheGetMessageCountByUserId({ userId });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

// Vote operations
export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    return await cacheVoteMessage({ chatId, messageId, type });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await cacheGetVotesByChatId({ id });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

// Document operations
export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await cacheSaveDocument({ id, title, kind, content, userId });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return await cacheGetDocumentsById({ id });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    return await cacheGetDocumentById({ id });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    return await cacheDeleteDocumentsByIdAfterTimestamp({ id, timestamp });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

// Stream operations
export async function createStreamId({ streamId, chatId }: { streamId: string; chatId: string }) {
  try {
    return await cacheCreateStreamId({ streamId, chatId });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    return await cacheGetStreamIdsByChatId({ chatId });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

// Suggestion operations (simplified for local cache)
export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<{
    chatId: string;
    originalMessageId: string;
    suggestedMessageId: string;
  }>;
}) {
  // For local cache, we'll skip suggestions for now
  return Promise.resolve();
}

export async function getSuggestionsByChatId({ chatId }: { chatId: string }) {
  // For local cache, return empty suggestions
  return Promise.resolve([]);
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  // For local cache, return empty suggestions
  return Promise.resolve([]);
}
