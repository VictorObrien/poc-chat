"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  Film,
  Sparkles,
  PenTool,
  X,
} from "lucide-react";
import type { QuickActionType } from "@/lib/types/fal";
import { QUICK_ACTION_CONFIGS } from "@/lib/types/fal";
import { useCustomActionsStore } from "@/stores/customActionsStore";
import type { WorkType } from "@/lib/types/custom-actions";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface QuickActionsProps {
  onActionSelect?: (actionType: string) => void;
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

// Ícones para tipos de trabalho customizados
const WORK_TYPE_ICONS: Record<WorkType, React.ReactNode> = {
  "image-generation": <ImageIcon className="size-4" />,
  "video-generation": <Video className="size-4" />,
  "document-analysis": <MessageSquare className="size-4" />,
  "voice-to-text": <MessageSquare className="size-4" />,
  "copy-writing": <PenTool className="size-4" />,
};

export function QuickActions({ onActionSelect }: QuickActionsProps) {
  const { customActions, deleteCustomAction } = useCustomActionsStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const handleActionClick = (actionType: string) => {
    onActionSelect?.(actionType);
  };

  const handleDeleteClick = (e: React.MouseEvent, actionId: string, actionTitle: string) => {
    e.stopPropagation();
    setActionToDelete({ id: actionId, title: actionTitle });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (actionToDelete) {
      deleteCustomAction(actionToDelete.id);
      setActionToDelete(null);
    }
  };

  // Filtrar configs padrão (remover "personalize" que será exibido por último)
  const defaultActions = QUICK_ACTION_CONFIGS.filter(
    (action) => action.type !== "personalize"
  );
  const personalizeAction = QUICK_ACTION_CONFIGS.find(
    (action) => action.type === "personalize"
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Grid de ações padrão */}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {/* Ações padrão */}
          {defaultActions.map((action) => (
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

          {/* Botão Personalize sempre por último */}
          {personalizeAction && (
            <Button
              variant="outline"
              className="aspect-square h-auto w-full flex-col gap-2 p-4 bg-gradient-to-br from-[#1a1a4a] to-[#2a2a5a] border-2 border-dashed border-yellow-400/30 cursor-pointer transition-all duration-500 ease-in-out hover:border-yellow-400 hover:text-yellow-400"
              onClick={() => handleActionClick(personalizeAction.type)}
            >
              <span className="transition-colors duration-500 text-yellow-400">
                {ACTION_ICONS[personalizeAction.type]}
              </span>
              <span className="text-xs font-medium transition-colors duration-500 text-yellow-400">
                {personalizeAction.label}
              </span>
            </Button>
          )}
        </div>

        {/* Seção "Minhas Quick Actions" */}
        {customActions.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-200">
              Minhas Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {customActions.map((action) => (
                <div key={action.id} className="relative group">
                  <Button
                    variant="outline"
                    className="h-auto px-4 py-3 rounded-lg bg-[#1a1a4a] border-[#2a2a5a] hover:bg-[#2a2a5a] hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-200"
                    onClick={() => handleActionClick(`custom-${action.id}`)}
                  >
                    <span className="text-yellow-400">
                      {WORK_TYPE_ICONS[action.workType]}
                    </span>
                    <span>{action.title}</span>
                  </Button>

                  {/* Botão de deletar */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 border border-yellow-400/50 bg-[#1a1a4a] text-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:border-red-500 hover:text-white"
                    onClick={(e) => handleDeleteClick(e, action.id, action.title)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {actionToDelete && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title={actionToDelete.title}
        />
      )}
    </>
  );
}
