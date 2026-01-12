"use client";

import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  Film,
  Sparkles,
} from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const quickActions: QuickAction[] = [
  {
    label: "Nova Conversa",
    icon: <MessageSquare className="size-6" />,
  },
  {
    label: "Imagem Instagram",
    icon: <ImageIcon className="size-6" />,
  },
  {
    label: "Reels",
    icon: <Video className="size-6" />,
  },
  {
    label: "Imagem TikTok",
    icon: <ImageIcon className="size-6" />,
  },
  {
    label: "Vídeo TikTok",
    icon: <Film className="size-6" />,
  },
  {
    label: "Personalize",
    icon: <Sparkles className="size-6" />,
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="aspect-square h-auto w-full flex-col gap-2 p-4 bg-[#1a1a4a] border-0 cursor-pointer transition-all duration-500 ease-in-out hover:bg-[#2a2a5a] hover:text-yellow-400"
          onClick={action.onClick}
        >
          <span className="transition-colors duration-500 hover:text-yellow-400">
            {action.icon}
          </span>
          <span className="text-xs font-medium transition-colors duration-500 hover:text-yellow-400">
            {action.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
