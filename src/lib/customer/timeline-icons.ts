/**
 * Icon per timeline event type — shared by the customer Activity timeline and
 * the internal notifications feed so they stay visually consistent.
 */
import {
  UserPlus,
  Send,
  Inbox,
  Flag,
  CheckCircle2,
  MessageSquare,
  PencilLine,
  PartyPopper,
  Paperclip,
  Eye,
  Gift,
  Circle,
  type LucideIcon,
} from "lucide-react";

import type { TimelineEventType } from "./types";

const ICON: Record<TimelineEventType, LucideIcon> = {
  customer_created: UserPlus,
  intake_sent: Send,
  intake_submitted: Inbox,
  intake_updated: PencilLine,
  status_changed: Flag,
  task_completed: CheckCircle2,
  section_completed: CheckCircle2,
  note_added: MessageSquare,
  checklist_finished: PartyPopper,
  document_added: Paperclip,
  document_shared: Eye,
  reward_claimed: Gift,
};

export function timelineIcon(type: TimelineEventType): LucideIcon {
  return ICON[type] ?? Circle;
}
