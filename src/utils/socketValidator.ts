import { Types } from 'mongoose';
import { ValidationError } from './AppError';

type Attachment = {
  type: 'image' | 'video' | 'file' | 'audio';
  url?: string;
  name?: string;
  size?: number;
};

type SendMessagePayload = {
  chatId: string;
  content?: string;
  attachment?: Attachment;
};

export function validateSendMessagePayload(payload: any): asserts payload is SendMessagePayload {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate chatId
  if (!payload.chatId || typeof payload.chatId !== 'string') {
    errors.push({ field: 'chatId', message: 'chatId is required and must be a string' });
  } else if (!Types.ObjectId.isValid(payload.chatId)) {
    errors.push({ field: 'chatId', message: 'Invalid chatId format' });
  }

  // Validate content and attachment
  const hasContent = payload.content !== undefined && payload.content !== null && String(payload.content).trim() !== '';
  const hasAttachment = payload.attachment !== undefined && payload.attachment !== null;

  if (!hasContent && !hasAttachment) {
    errors.push({ field: 'content', message: 'content or attachment is required' });
  }

  // If content exists, validate it's a string
  if (payload.content !== undefined && typeof payload.content !== 'string') {
    errors.push({ field: 'content', message: 'content must be a string' });
  }

  // If attachment exists, validate its structure
  if (hasAttachment) {
    const attachment = payload.attachment;
    const allowedTypes = ['image', 'video', 'file', 'audio'];
    
    if (typeof attachment !== 'object' || Array.isArray(attachment)) {
      errors.push({ field: 'attachment', message: 'attachment must be an object' });
    } else {
      // Validate type
      if (!attachment.type || !allowedTypes.includes(attachment.type)) {
        errors.push({ 
          field: 'attachment.type', 
          message: `Invalid attachment type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Validate URL if provided
      if (attachment.url !== undefined && typeof attachment.url !== 'string') {
        errors.push({ field: 'attachment.url', message: 'attachment URL must be a string' });
      }

      // Validate name if provided
      if (attachment.name !== undefined && typeof attachment.name !== 'string') {
        errors.push({ field: 'attachment.name', message: 'attachment name must be a string' });
      }

      // Validate size if provided
      if (attachment.size !== undefined && 
          (typeof attachment.size !== 'number' || !Number.isInteger(attachment.size) || attachment.size < 0)) {
        errors.push({ field: 'attachment.size', message: 'attachment size must be a non-negative integer' });
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}
