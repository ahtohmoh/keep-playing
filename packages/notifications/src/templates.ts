/** WhatsApp template registry. Each must be approved by Meta in production. */
import type { NotificationType } from './types';

export type WhatsAppTemplateDef = {
  name: string;
  language: string;
  body: string; // {{1}}, {{2}}, ... placeholders
};

export const whatsappTemplates: Record<NotificationType, WhatsAppTemplateDef> = {
  milestone_due: {
    name: 'milestone_due',
    language: 'en',
    body: 'Hi {{1}}. Milestone "{{2}}" on "{{3}}" is due {{4}}. Open: {{5}}',
  },
  milestone_completed: {
    name: 'milestone_completed',
    language: 'en',
    body: 'Hi {{1}}. Milestone "{{2}}" on "{{3}}" is complete.',
  },
  brief_assigned: {
    name: 'brief_assigned',
    language: 'en',
    body: 'Hi {{1}}. You\'ve been added to "{{2}}". Brief is ready: {{3}}',
  },
  voice_note_received: {
    name: 'voice_note_received',
    language: 'en',
    body: 'Hi {{1}}. {{2}} left you a voice note on "{{3}}": {{4}}',
  },
  project_invited: {
    name: 'project_invited',
    language: 'en',
    body: 'Hi {{1}}. You\'ve joined "{{2}}" as {{3}}.',
  },
  comment_received: {
    name: 'comment_received',
    language: 'en',
    body: 'Hi {{1}}. {{2}} commented on "{{3}}".',
  },
  member_onboarded: {
    name: 'member_onboarded',
    language: 'en',
    body: '{{1}} just completed onboarding. Welcome them in: {{2}}',
  },
  deliverable_uploaded: {
    name: 'deliverable_uploaded',
    language: 'en',
    body: 'Hi {{1}}. {{2}} uploaded "{{3}}" to {{4}}.',
  },
  pipeline_acknowledged: {
    name: 'pipeline_acknowledged',
    language: 'en',
    body: 'Hi {{1}}. Krasumashi acknowledged your pipeline entry: {{2}}',
  },
};
