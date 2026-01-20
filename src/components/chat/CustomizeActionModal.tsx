"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X, Sparkles, GripVertical } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCustomActionsStore } from "@/stores/customActionsStore";
import type {
  WorkType,
  CustomFieldFormData,
  CustomActionFormData,
} from "@/lib/types/custom-actions";
import {
  WORK_TYPE_LABELS,
  WORK_TYPE_DESCRIPTIONS,
  ENABLED_WORK_TYPES,
  generateId,
} from "@/lib/types/custom-actions";

interface CustomizeActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const initialFormState: CustomActionFormData = {
  title: "",
  workType: "",
  imageUrl: undefined,
  fields: [
    {
      id: generateId(),
      question: "",
      options: [
        { label: "", prompt: "" },
        { label: "", prompt: "" },
      ],
    },
  ],
};

// Componente Sortable para cada campo
function SortableFieldItem({
  field,
  fieldIndex,
  errors,
  onQuestionChange,
  onOptionLabelChange,
  onOptionPromptChange,
  onAddOption,
  onRemoveOption,
  onRemoveField,
}: {
  field: CustomFieldFormData;
  fieldIndex: number;
  errors: Record<string, string>;
  onQuestionChange: (fieldId: string, question: string) => void;
  onOptionLabelChange: (fieldId: string, optionIndex: number, label: string) => void;
  onOptionPromptChange: (fieldId: string, optionIndex: number, prompt: string) => void;
  onAddOption: (fieldId: string) => void;
  onRemoveOption: (fieldId: string, optionIndex: number) => void;
  onRemoveField: (fieldId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border border-[#2a2a5a] rounded-lg space-y-4 bg-[#1a1a4a]/30"
    >
      {/* Header do campo */}
      <div className="flex items-start justify-between gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 text-gray-400 cursor-grab active:cursor-grabbing hover:text-yellow-400 transition-colors"
        >
          <GripVertical className="size-4" />
          <span className="text-sm font-medium">Pergunta {fieldIndex + 1}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemoveField(field.id)}
          className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Input da pergunta */}
      <div className="space-y-2">
        <Input
          value={field.question}
          onChange={(e) => onQuestionChange(field.id, e.target.value)}
          placeholder="Ex: Qual o formato da arte?"
          className="bg-[#0a0a2a] border-[#2a2a5a] text-white placeholder:text-gray-500 focus:border-yellow-400/50"
        />
        {errors[`field_${field.id}_question`] && (
          <p className="text-sm text-red-400">
            {errors[`field_${field.id}_question`]}
          </p>
        )}
      </div>

      {/* Opções de resposta */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-400">Opções de Resposta</Label>
        <div className="space-y-3">
          {field.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className="space-y-2 p-3 border border-[#2a2a5a] rounded-lg bg-[#0a0a2a]/50 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-gray-500">
                  Opção {optionIndex + 1}
                </Label>
                {field.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveOption(field.id, optionIndex)}
                    className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0"
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
              
              {/* Input Label (obrigatório) */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">
                  Label <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={option.label}
                  onChange={(e) =>
                    onOptionLabelChange(field.id, optionIndex, e.target.value)
                  }
                  placeholder={`Ex: Story, Post, Reels...`}
                  className="bg-[#0a0a2a] border-[#2a2a5a] text-white placeholder:text-gray-500 focus:border-yellow-400/50"
                  required
                />
                {errors[`field_${field.id}_option_${optionIndex}_label`] && (
                  <p className="text-xs text-red-400">
                    {errors[`field_${field.id}_option_${optionIndex}_label`]}
                  </p>
                )}
              </div>
              
              {/* Input Prompt (opcional) */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">
                  Prompt (opcional)
                </Label>
                <Input
                  value={option.prompt || ""}
                  onChange={(e) =>
                    onOptionPromptChange(field.id, optionIndex, e.target.value)
                  }
                  placeholder={`Ex: Instagram Story, vertical 9:16...`}
                  className="bg-[#0a0a2a] border-[#2a2a5a] text-white placeholder:text-gray-500 focus:border-yellow-400/50"
                />
              </div>
            </div>
          ))}
        </div>

        {errors[`field_${field.id}_options`] && (
          <p className="text-sm text-red-400">
            {errors[`field_${field.id}_options`]}
          </p>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onAddOption(field.id)}
          className="w-full text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a]"
        >
          <Plus className="size-4 mr-2" />
          Adicionar Opção
        </Button>
      </div>
    </div>
  );
}

export function CustomizeActionModal({
  open,
  onOpenChange,
  onSuccess,
}: CustomizeActionModalProps) {
  const { createCustomAction } = useCustomActionsStore();

  const [formData, setFormData] = useState<CustomActionFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset form quando modal fecha
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setFormData(initialFormState);
        setErrors({});
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  // Adicionar novo campo no final
  const handleAddField = useCallback(() => {
    const newField: CustomFieldFormData = {
      id: generateId(),
      question: "",
      options: [
        { label: "", prompt: "" },
        { label: "", prompt: "" },
      ],
    };
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  }, []);

  // Remover campo
  const handleRemoveField = useCallback((fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));
  }, []);

  // Reordenar campos (drag and drop)
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.fields.findIndex((f) => f.id === active.id);
        const newIndex = prev.fields.findIndex((f) => f.id === over.id);

        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex),
        };
      });
    }
  }, []);

  // Atualizar pergunta do campo
  const handleQuestionChange = useCallback((fieldId: string, question: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, question } : f
      ),
    }));
  }, []);

  // Adicionar opção a um campo
  const handleAddOption = useCallback((fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId
          ? { ...f, options: [...f.options, { label: "", prompt: "" }] }
          : f
      ),
    }));
  }, []);

  // Remover opção de um campo
  const handleRemoveOption = useCallback(
    (fieldId: string, optionIndex: number) => {
      setFormData((prev) => ({
        ...prev,
        fields: prev.fields.map((f) =>
          f.id === fieldId
            ? { ...f, options: f.options.filter((_, i) => i !== optionIndex) }
            : f
        ),
      }));
    },
    []
  );

  // Atualizar label da opção
  const handleOptionLabelChange = useCallback(
    (fieldId: string, optionIndex: number, label: string) => {
      setFormData((prev) => ({
        ...prev,
        fields: prev.fields.map((f) =>
          f.id === fieldId
            ? {
                ...f,
                options: f.options.map((opt, i) =>
                  i === optionIndex ? { ...opt, label } : opt
                ),
              }
            : f
        ),
      }));
    },
    []
  );

  // Atualizar prompt da opção
  const handleOptionPromptChange = useCallback(
    (fieldId: string, optionIndex: number, prompt: string) => {
      setFormData((prev) => ({
        ...prev,
        fields: prev.fields.map((f) =>
          f.id === fieldId
            ? {
                ...f,
                options: f.options.map((opt, i) =>
                  i === optionIndex ? { ...opt, prompt } : opt
                ),
              }
            : f
        ),
      }));
    },
    []
  );

  // Validar formulário
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.workType) {
      newErrors.workType = "Tipo de trabalho é obrigatório";
    }

    if (formData.fields.length === 0) {
      newErrors.fields = "Adicione pelo menos uma pergunta";
    } else {
      formData.fields.forEach((field) => {
        if (!field.question.trim()) {
          newErrors[`field_${field.id}_question`] = "Pergunta é obrigatória";
        }

        // Validar que cada opção tem label preenchido
        const validOptions = field.options.filter((opt) => opt.label.trim());
        if (validOptions.length < 2) {
          newErrors[`field_${field.id}_options`] =
            "Adicione pelo menos 2 opções com label preenchido";
        }
        
        // Validar labels individuais
        field.options.forEach((opt, optIndex) => {
          if (!opt.label.trim()) {
            newErrors[`field_${field.id}_option_${optIndex}_label`] =
              "Label é obrigatório";
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Submeter formulário
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Limpar opções sem label antes de salvar
      const cleanedFields = formData.fields
        .filter((f) => f.question.trim())
        .map((f) => ({
          ...f,
          options: f.options
            .filter((opt) => opt.label.trim()) // Manter apenas opções com label
            .map((opt) => ({
              label: opt.label.trim(),
              prompt: opt.prompt?.trim() || undefined, // Prompt opcional, remove se vazio
            })),
        }));

      // Adicionar key para cada campo
      const fieldsWithKeys = cleanedFields.map((f, index) => ({
        ...f,
        key: `field_${index}`,
      }));

      createCustomAction({
        title: formData.title.trim(),
        workType: formData.workType as WorkType,
        imageUrl: formData.imageUrl, // Incluir imagem se foi adicionada
        fields: fieldsWithKeys,
      });

      // Sucesso
      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao criar Quick Action:", error);
      setErrors({ submit: "Erro ao criar Quick Action. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, createCustomAction, handleOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#010336] border-[#2a2a5a] scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-yellow-400" />
            Criar Quick Action Personalizada
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Crie um fluxo de perguntas personalizado para automatizar suas
            tarefas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-200">
              Título da Quick Action
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ex: Imagem para Landing Page"
              className="bg-[#1a1a4a] border-[#2a2a5a] text-white placeholder:text-gray-500 focus:border-yellow-400/50"
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Upload de imagem */}
          <ImageUpload
            value={formData.imageUrl}
            onChange={(imageUrl) =>
              setFormData((prev) => ({ ...prev, imageUrl }))
            }
          />

          {/* Tipo de trabalho */}
          <div className="space-y-2">
            <Label htmlFor="workType" className="text-gray-200">
              Tipo de Trabalho
            </Label>
            <Select
              value={formData.workType}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, workType: v as WorkType }))
              }
            >
              <SelectTrigger className="bg-[#1a1a4a] border-[#2a2a5a] text-white focus:border-yellow-400/50">
                <SelectValue placeholder="Selecione o tipo de trabalho" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a4a] border-[#2a2a5a]">
                {ENABLED_WORK_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-white focus:bg-[#2a2a5a] focus:text-yellow-400"
                  >
                    <div className="flex flex-col">
                      <span>{WORK_TYPE_LABELS[type]}</span>
                      <span className="text-xs text-gray-400">
                        {WORK_TYPE_DESCRIPTIONS[type]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workType && (
              <p className="text-sm text-red-400">{errors.workType}</p>
            )}
          </div>

          {/* Perguntas do Fluxo */}
          <div className="space-y-4">
            <div>
              <Label className="text-gray-200">Perguntas do Fluxo</Label>
              <p className="text-xs text-gray-400 mt-1">
                Arraste para reordenar • Cada pergunta terá opções de múltipla escolha
              </p>
            </div>

            {errors.fields && formData.fields.length === 0 && (
              <p className="text-sm text-red-400">{errors.fields}</p>
            )}

            {/* Lista de campos com drag and drop */}
            {formData.fields.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {formData.fields.map((field, fieldIndex) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        fieldIndex={fieldIndex}
                        errors={errors}
                        onQuestionChange={handleQuestionChange}
                        onOptionLabelChange={handleOptionLabelChange}
                        onOptionPromptChange={handleOptionPromptChange}
                        onAddOption={handleAddOption}
                        onRemoveOption={handleRemoveOption}
                        onRemoveField={handleRemoveField}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Placeholder quando não há campos */}
            {formData.fields.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhuma pergunta adicionada ainda
              </p>
            )}

            {/* Botão "Novo Campo" - sempre no final da lista */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
              className="w-full bg-[#1a1a4a] border-[#2a2a5a] border-dashed hover:bg-[#2a2a5a] hover:text-yellow-400 hover:border-yellow-400/50"
            >
              <Plus className="size-4 mr-2" />
              Novo Campo
            </Button>
          </div>

          {/* Erro geral */}
          {errors.submit && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a5a]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-white hover:bg-[#2a2a5a]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.workType || formData.fields.length === 0}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" />
                  Criar Quick Action
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
