"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Loader2 } from "lucide-react";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { useHover } from "./hooks/useHover";

interface GeneratedImageProps {
  imageUrl: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
  actionLabel?: string;
}

export function GeneratedImage({
  imageUrl,
  isLoading = false,
  onRegenerate,
  actionLabel = "Imagem",
}: GeneratedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const { isHovered, onMouseEnter, onMouseLeave } = useHover();
  const { copied, copy } = useCopyToClipboard();

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${actionLabel
        .toLowerCase()
        .replace(/\s/g, "-")}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
    }
  };

  const handleCopy = async () => {
    await copy(imageUrl);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-[#1a1a4a]/50 rounded-xl border border-[#2a2a5a]">
        <Loader2 className="size-12 animate-spin text-yellow-400" />
        <p className="text-gray-300 text-sm">Gerando sua imagem...</p>
        <p className="text-gray-500 text-xs">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col gap-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Container da imagem */}
      <div className="relative overflow-hidden rounded-xl border border-[#2a2a5a] bg-[#1a1a4a]/30">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a4a]/50">
            <Loader2 className="size-8 animate-spin text-yellow-400" />
          </div>
        )}
        <img
          src={imageUrl}
          alt={actionLabel}
          className={`w-full h-auto max-h-[500px] object-contain transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Container com altura fixa para evitar layout shift */}
      <div className="h-[60px] flex flex-col items-start justify-start">
        {/* Botões no hover */}
        {isHovered && (
          <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a]"
                onClick={handleCopy}
                onMouseEnter={() => setHoveredAction("copiar")}
                onMouseLeave={() => setHoveredAction(null)}
              >
                {copied ? (
                  <Check className="size-4 text-yellow-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a]"
                onClick={handleDownload}
                onMouseEnter={() => setHoveredAction("baixar")}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <Download className="size-4" />
              </Button>
            </div>

            {/* Label que aparece quando hover sobre os botões */}
            {hoveredAction && (
              <div className="mt-1 px-3 py-1.5 rounded-lg bg-[#1a1a4a] text-white text-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                {hoveredAction === "copiar" && (copied ? "Copiado" : "Copiar")}
                {hoveredAction === "baixar" && "Baixar"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
