import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import {
  createInternalMessage,
  createMessage,
  listAvailableMessageRecipients,
  listMessages,
  markMessageRead,
} from '../services/message.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function listMessagesHandler(req: Request, res: Response): Promise<Response> {
  const data = await listMessages(req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Messages fetched successfully', data);
}

export async function createMessageHandler(req: Request, res: Response): Promise<Response> {
  const data = await createMessage(req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Message created successfully', data);
}

export async function createInternalMessageHandler(req: Request, res: Response): Promise<Response> {
  const data = await createInternalMessage(req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Internal message created successfully', data);
}

export async function listMessageRecipientsHandler(req: Request, res: Response): Promise<Response> {
  const data = await listAvailableMessageRecipients(req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Message recipients fetched successfully', data);
}

export async function markMessageReadHandler(req: Request, res: Response): Promise<Response> {
  const data = await markMessageRead(String(req.params.id), req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Message updated successfully', data);
}
