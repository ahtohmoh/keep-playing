/**
 * Notifications.
 *
 * Two surfaces:
 *  - In-app: `notifications` table, visible at /notifications and as a counter in the header.
 *  - WhatsApp: critical events trigger Meta Cloud API messages. Stubbed in dev.
 *
 * Templates (the "what gets sent") are declared in `templates.ts`. Each template
 * is named and parameterised. WhatsApp templates must be pre-approved by Meta
 * before they can be used in production. In dev (no WHATSAPP_TOKEN set), sends
 * are logged but not sent.
 */
export * from './types';
export * from './templates';
export * from './send';
export * from './whatsapp';
