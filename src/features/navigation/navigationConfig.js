// src/features/navigation/navigationConfig.js
import {
  LayoutDashboard,
  Map as MapIcon,
  PlusCircle,
  MessageSquare,   // ✅ جدید
} from 'lucide-react';

export const DOCK_ITEMS = [
  {
    id: 'dashboard',
    label: 'داشبورد',
    icon: LayoutDashboard,
    path: '/',
    type: 'route',
  },
  {
    id: 'map',
    label: 'نقشه',
    icon: MapIcon,
    path: '/map',
    type: 'route',
  },
  {
    id: 'conversations',   // ✅ جدید
    label: 'گفتگو',
    icon: MessageSquare,
    path: '/conversations',
    type: 'route',
  },
  {
    id: 'farm-panel',
    label: 'ثبت زمین',
    icon: PlusCircle,
    type: 'action',
    actionKey: 'toggleFarmPanel',
  },
];