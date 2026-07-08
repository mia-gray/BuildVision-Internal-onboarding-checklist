/**
 * Icon registry — maps the string `icon` names used in content JSON to Lucide
 * components. Content authors reference icons by name; this keeps the bundle
 * tree-shakeable and gives us one place to add new icons.
 */
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  FolderUp,
  Forward,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  MailCheck,
  PlugZap,
  Rocket,
  ShieldCheck,
  UserPlus,
  Video,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  FolderUp,
  Forward,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  MailCheck,
  PlugZap,
  Rocket,
  ShieldCheck,
  UserPlus,
  Video,
  HelpCircle,
};

/** Resolve an icon by name, falling back to a neutral default. */
export function getIcon(name?: string): LucideIcon {
  if (name && ICONS[name]) return ICONS[name];
  return HelpCircle;
}
