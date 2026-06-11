/** Notification types — keep this set small and meaningful. */
export const NOTIFICATION_TYPES = [
  'milestone_due',
  'milestone_completed',
  'brief_assigned',
  'voice_note_received',
  'project_invited',
  'comment_received',
  'member_onboarded',
  'deliverable_uploaded',
  'pipeline_acknowledged',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationPayload = {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  /** Deliver via email (the proactive channel of record). */
  sendEmail?: boolean;
  /** Deliver via WhatsApp too, if the member opted in. Optional, never load-bearing. */
  sendWhatsApp?: boolean;
};
