"use client";

import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  Film,
  Sparkles,
} from "lucide-react";
import type { QuickActionType } from "@/lib/types/fal";
import { QUICK_ACTION_CONFIGS } from "@/lib/types/fal";

interface QuickActionsProps {
  onActionSelect?: (actionType: QuickActionType) => void;
}

// Mapeamento de ícones por tipo
const ACTION_ICONS: Record<QuickActionType, React.ReactNode> = {
  "new-conversation": <MessageSquare className="size-6" />,
  "instagram-image": <ImageIcon className="size-6" />,
  reels: <Video className="size-6" />,
  "tiktok-image": <ImageIcon className="size-6" />,
  "tiktok-video": <Film className="size-6" />,
  personalize: <Sparkles className="size-6" />,
};

export function QuickActions({ onActionSelect }: QuickActionsProps) {
  const handleActionClick = (actionType: QuickActionType) => {
    onActionSelect?.(actionType);
  };

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {QUICK_ACTION_CONFIGS.map((action) => (
        <Button
          key={action.type}
          variant="outline"
          className="aspect-square h-auto w-full flex-col gap-2 p-4 bg-[#1a1a4a] border-0 cursor-pointer transition-all duration-500 ease-in-out hover:bg-[#2a2a5a] hover:text-yellow-400"
          onClick={() => handleActionClick(action.type)}
        >
          <span className="transition-colors duration-500 hover:text-yellow-400">
            {ACTION_ICONS[action.type]}
          </span>
          <span className="text-xs font-medium transition-colors duration-500 hover:text-yellow-400">
            {action.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
