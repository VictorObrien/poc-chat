"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  value?: string; // base64 string
  onChange: (value: string | undefined) => void;
  accept?: string;
}

export function ImageUpload({ value, onChange, accept = "image/jpeg,image/png,image/webp" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const validExtensions = [".jpeg", ".jpg", ".png", ".webp"];
    
    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValidType && !isValidExtension) {
      setError("Apenas arquivos .jpeg, .png ou .webp são permitidos");
      return false;
    }

    // Limitar tamanho (ex: 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError("A imagem deve ter no máximo 2MB");
      return false;
    }

    setError(null);
    return true;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Erro ao converter imagem"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const base64 = await convertToBase64(file);
      onChange(base64);
      setError(null);
    } catch (err) {
      setError("Erro ao processar a imagem");
      console.error(err);
    }
  }, [onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange(undefined);
    setError(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-gray-200">Imagem da Quick Action (opcional)</Label>
      
      {value ? (
        // Preview da imagem
        <div className="relative group">
          <div className="relative w-full h-32 rounded-lg border border-[#2a2a5a] bg-[#1a1a4a]/30 overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="absolute top-2 right-2 h-8 w-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Área de upload
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-all
            ${isDragging
              ? "border-yellow-400 bg-yellow-400/10"
              : "border-[#2a2a5a] bg-[#1a1a4a]/30 hover:border-yellow-400/50 hover:bg-[#1a1a4a]/50"
            }
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            id="image-upload-input"
          />
          
          <label
            htmlFor="image-upload-input"
            className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2a2a5a] text-gray-400">
              {isDragging ? (
                <Upload className="size-6 text-yellow-400" />
              ) : (
                <ImageIcon className="size-6" />
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-300">
                {isDragging ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para selecionar"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG ou WebP (máx. 2MB)
              </p>
            </div>
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
