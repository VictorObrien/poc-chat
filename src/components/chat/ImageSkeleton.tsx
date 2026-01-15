"use client";

export function ImageSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Container do skeleton - alinhado à esquerda como as mensagens do sistema */}
      <div className="relative overflow-hidden rounded-xl border border-[#2a2a5a] bg-[#1a1a4a]/30 w-full max-w-[300px]">
        {/* Skeleton da imagem com shimmer effect */}
        <div className="relative w-full aspect-square bg-[#1a1a4a]">
          {/* Shimmer animation */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[#2a2a5a]/40 to-transparent" />
          {/* Ícone de imagem no centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#3a3a6a] animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
