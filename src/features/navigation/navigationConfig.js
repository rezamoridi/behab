// src/features/navigation/navigationConfig.js
import {
  LayoutDashboard,
  Map as MapIcon,
  MapPinned,
  PlusCircle,
  MessageSquare,
  Users,
  Sprout,
  Satellite, // ✅ SENTINEL — آیکون ماهواره
} from "lucide-react";

export const DOCK_ITEMS = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
    path: "/",
    type: "route",
    roles: ["super_admin", "manager", "dehyar", "operator"],
  },
  {
    id: "map",
    label: "نقشه",
    icon: MapIcon,
    path: "/map",
    type: "route",
    roles: ["super_admin", "manager", "dehyar", "operator"],
  },

  // ✅ SENTINEL — بین map و lands
  {
    id: "sentinel",
    label: "ماهواره",
    icon: Satellite,
    path: "/sentinel",
    type: "route",
    roles: ["super_admin"],
  },

  {
    id: "lands",
    label: "زمین‌ها",
    icon: MapPinned,
    path: "/lands",
    type: "route",
    roles: ["super_admin", "manager", "dehyar", "operator"],
  },

  {
    id: "agri",
    label: "کشاورزی",
    icon: Sprout,
    path: "/agri",
    type: "route",
    roles: ["super_admin", "manager"],
  },

  {
    id: "farm-panel",
    label: "ثبت زمین",
    icon: PlusCircle,
    type: "action",
    actionKey: "toggleFarmPanel",
    roles: ["super_admin", "manager", "dehyar", "operator"],
  },
  {
    id: "farmers",
    label: "کاربران",
    icon: Users,
    path: "/farmers",
    type: "route",
    roles: ["super_admin", "manager", "operator"],
  },
  {
    id: "conversations",
    label: "گفتگو",
    icon: MessageSquare,
    path: "/conversations",
    type: "route",
    roles: ["super_admin"],
  },
];