import {
  BookOpen, Briefcase, Building2, ChartColumn, ChartLine, ClipboardCheck, Compass, FileCheck, FileText, Files,
  FolderOpen, Gauge, Handshake, HeartHandshake, Layers, Leaf, Map, Recycle, Scale, Search, Settings2, ShieldCheck,
  Sprout, Target, Trees, Users, Workflow, Droplets, Lightbulb, Factory, Landmark, Sun, type LucideIcon,
} from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  'book-open': BookOpen, briefcase: Briefcase, 'building-2': Building2, 'chart-column': ChartColumn,
  'chart-line': ChartLine, 'clipboard-check': ClipboardCheck, compass: Compass, 'file-check': FileCheck,
  'file-text': FileText, files: Files, 'folder-open': FolderOpen, gauge: Gauge, handshake: Handshake,
  'heart-handshake': HeartHandshake, layers: Layers, leaf: Leaf, map: Map, recycle: Recycle, scale: Scale,
  search: Search, 'settings-2': Settings2, 'shield-check': ShieldCheck, sprout: Sprout, target: Target,
  trees: Trees, users: Users, workflow: Workflow, droplets: Droplets, lightbulb: Lightbulb, factory: Factory,
  landmark: Landmark, sun: Sun,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Leaf;
  return <Cmp className={className} aria-hidden="true" strokeWidth={1.6} />;
}
