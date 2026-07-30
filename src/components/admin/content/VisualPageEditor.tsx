"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Copy, Trash2, Code, Settings2, Save } from "lucide-react";
import { HeroEditor } from "./HeroEditor";
import { BlockEditor } from "./BlockEditor";
import {
  blockCategoryClasses,
  blockSummary,
  blockTypeCategory,
  blockTypeLabel,
} from "@/lib/cms/block-labels";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirm-toast";

export const VISUAL_PAGE_EDITOR_DND_ID = "visual-page-editor-blocks";

export function reorderBlocks<T extends { id: string; order?: number }>(
  blocks: T[],
  activeId: string,
  overId: string | null | undefined
) {
  if (!overId || activeId === overId) return blocks;

  const oldIndex = blocks.findIndex((block) => block.id === activeId);
  const newIndex = blocks.findIndex((block) => block.id === overId);
  if (oldIndex < 0 || newIndex < 0) return blocks;

  return arrayMove(blocks, oldIndex, newIndex).map((block, order) => ({ ...block, order }));
}

// Simple sortable item wrapper
function SortableBlockItem({
  block,
  onEdit,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  isActive
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg overflow-hidden flex transition-shadow ${isActive ? 'border-brand-gold ring-1 ring-brand-gold shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div
        {...attributes}
        {...listeners}
        aria-label="Drag section"
        data-drag-handle="section"
        className="w-10 bg-gray-50 border-r border-gray-100 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-brand-black"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 p-4 flex items-center justify-between">
        <div className="flex-1 cursor-pointer" onClick={() => onEdit(block)}>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{blockTypeLabel(block.blockType)}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${blockCategoryClasses(blockTypeCategory(block.blockType))}`}>
              {blockTypeCategory(block.blockType)}
            </span>
            {/* Amber, not red: a hidden section is a deliberate, reversible
                state, not an error on the page. */}
            {!block.visible && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Hidden</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate max-w-sm">{blockSummary(block)}</p>
        </div>
        {/* Edit is the primary action on the row, so it is a real button rather
            than one more grey icon, and the cluster is not dimmed until hover —
            the most-used control must not be the least visible one. */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(block)}
            className="px-3 py-1.5 mr-1 text-sm font-medium text-brand-black bg-gray-50 border border-gray-200 rounded hover:bg-brand-gold hover:border-brand-gold transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleVisibility(block.id)}
            className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded"
            aria-label={block.visible ? `Hide ${blockTypeLabel(block.blockType)}` : `Show ${blockTypeLabel(block.blockType)}`}
            title={block.visible ? "Hide section" : "Show section"}
          >
            {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDuplicate(block)}
            className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded"
            aria-label={`Duplicate ${blockTypeLabel(block.blockType)}`}
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            aria-label={`Delete ${blockTypeLabel(block.blockType)}`}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function VisualPageEditor({ initialPage }: { initialPage: any }) {
  const [page, setPage] = useState(initialPage);
  const [blocks, setBlocks] = useState(initialPage.blocks || []);
  const [activeEditor, setActiveEditor] = useState<"none" | "hero" | "block" | "json">("none");
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBlocks((items: any[]) => reorderBlocks(items, String(active.id), over?.id ? String(over.id) : null));
    }
  };

  const toggleVisibility = (id: string) => {
    setBlocks(blocks.map((b: any) => b.id === id ? { ...b, visible: !b.visible } : b));
  };

  const duplicateBlock = (block: any) => {
    const newBlock = { ...block, id: `block_${Date.now()}`, order: blocks.length };
    setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = async (id: string) => {
    if (!(await confirmToast("Delete this section?", { confirmLabel: "Delete" }))) return;
    setBlocks(blocks.filter((b: any) => b.id !== id));
    if (editingBlock?.id === id) setActiveEditor("none");
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveChanges = async () => {
    setIsSaving(true);
    const heroPayload = JSON.parse(JSON.stringify(page.hero));
    const { savePageAction } = await import("@/actions/content");
    const res = await savePageAction(
      page.id,
      page.slug,
      heroPayload,
      JSON.parse(JSON.stringify(blocks))
    );
    setIsSaving(false);
    if (res.success) {
      toast.success("Changes published successfully!");
    } else {
      toast.error(`Error publishing: ${res.error}`);
    }
  };

  return (
    <div className="min-h-[800px]">

      {/* LEFT: Editor Panel */}
      <div className="flex flex-col gap-6">

        {/* Sections List */}
        {activeEditor === "none" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold">Page Sections</h3>
              <div className="flex gap-2">
                <button onClick={() => setActiveEditor("json")} className="p-2 text-gray-400 hover:text-black bg-white border border-gray-200 rounded text-xs flex items-center gap-1" title="Advanced Developer Mode">
                  <Code className="w-3 h-3" /> JSON
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Hero Item */}
              {page.hero && (
                <div className={`bg-white border rounded-lg overflow-hidden flex transition-shadow ${editingBlock?.id === page.hero.id ? 'border-brand-gold ring-1 ring-brand-gold shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="w-10 bg-gray-50 border-r border-gray-100 flex items-center justify-center text-gray-300">
                    <GripVertical className="w-4 h-4 opacity-50" />
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => { setActiveEditor("hero"); setEditingBlock(page.hero); }}>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Hero Section</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-sm">{page.hero.eyebrow} - {page.hero.primaryCtaText}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setActiveEditor("hero"); setEditingBlock(page.hero); }} className="p-2 text-gray-500 hover:text-brand-black hover:bg-gray-100 rounded">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sortable Blocks */}
              <DndContext id={VISUAL_PAGE_EDITOR_DND_ID} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((b: any) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {blocks.map((block: any) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        isActive={editingBlock?.id === block.id}
                        onEdit={(b: any) => { setEditingBlock(b); setActiveEditor("block"); }}
                        onToggleVisibility={toggleVisibility}
                        onDuplicate={duplicateBlock}
                        onDelete={deleteBlock}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

            </div>
          </div>
        )}

        {/* Hero Editor */}
        {activeEditor === "hero" && (
          <HeroEditor
            hero={editingBlock}
            onChange={(h) => {
              setEditingBlock(h);
              setPage({ ...page, hero: h });
            }}
            onBack={() => {
              setActiveEditor("none");
              setEditingBlock(null);
            }}
          />
        )}

        {/* Block Editor */}
        {activeEditor === "block" && (
          <BlockEditor
            block={editingBlock}
            onChange={(b) => {
              setEditingBlock(b);
              setBlocks(blocks.map((block: any) => block.id === b.id ? b : block));
            }}
            onBack={() => {
              setActiveEditor("none");
              setEditingBlock(null);
            }}
          />
        )}

        {/* JSON Editor */}
        {activeEditor === "json" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-[500px]">
            <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-red-900 flex items-center gap-2"><Code className="w-4 h-4" /> Advanced Developer Mode</h3>
                <p className="text-xs text-red-700 mt-1">Warning: Invalid JSON will break the page. CEO access restricted.</p>
              </div>
              <button onClick={() => setActiveEditor("none")} className="px-3 py-1 bg-white border border-red-200 text-red-700 text-xs font-semibold rounded hover:bg-red-50">Back to Visual</button>
            </div>
            <textarea
              value={JSON.stringify(blocks, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setBlocks(parsed);
                } catch (e) { }
              }}
              className="flex-1 w-full p-4 font-mono text-xs bg-[#0d1117] text-[#c9d1d9] focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        )}

        {/* Save Bar. Sticks to the bottom of the admin `<main>` scroll container
            so Publish stays reachable on long blocks instead of sitting
            thousands of pixels below the fields being edited. */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-brand-gold/30 p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">Changes are live once published.</p>
          <button onClick={saveChanges} disabled={isSaving} className="px-6 py-2 bg-brand-black text-white font-semibold rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
            {isSaving ? "Publishing..." : <><Save className="w-4 h-4" /> Publish Changes</>}
          </button>
        </div>
      </div>

    </div>
  );
}
