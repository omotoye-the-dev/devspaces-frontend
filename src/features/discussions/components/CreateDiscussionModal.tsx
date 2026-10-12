import { useState, type JSX, type FormEvent, type KeyboardEvent } from "react";
import { HiPlus } from "react-icons/hi2";
import { Modal, Input, Textarea, Button, Tag } from "@/components/common";
import { toast } from "@/hooks/useToast";

export interface CreateDiscussionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void;
}

const SUGGESTED_TAGS = [
  "react",
  "typescript",
  "javascript",
  "nodejs",
  "nextjs",
  "tailwind",
  "css",
  "architecture",
  "api",
  "performance",
  "python",
  "database",
];

export function CreateDiscussionModal({
  open,
  onClose,
  onSubmit,
}: CreateDiscussionModalProps): JSX.Element | null {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string; tags?: string }>({});

  const handleAddTag = (tagToAdd: string): void => {
    const formatted = tagToAdd.trim().toLowerCase().replace(/^[#\s]+/, "");
    if (!formatted) return;

    if (tags.includes(formatted)) {
      toast.error(`Tag "${formatted}" is already added`);
      return;
    }

    if (tags.length >= 5) {
      toast.error("You can add up to 5 tags maximum");
      return;
    }

    setTags([...tags, formatted]);
    setTagInput("");
    if (errors.tags) {
      setErrors((prev) => ({ ...prev, tags: undefined }));
    }
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const resetForm = (): void => {
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setErrors({});
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const newErrors: { title?: string; content?: string; tags?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Question title is required";
    } else if (title.trim().length < 8) {
      newErrors.title = "Title must be at least 8 characters long";
    }

    if (!content.trim()) {
      newErrors.content = "Question details are required";
    } else if (content.trim().length < 15) {
      newErrors.content = "Please provide more details (at least 15 characters)";
    }

    if (tags.length === 0) {
      newErrors.tags = "Please add at least one relevant tag";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      size="lg"
      title="Ask a Question"
      description="Start a community discussion by asking a clear and specific question."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Question Title"
          placeholder="e.g. How do you handle optimistic UI updates with React Query?"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          errorMessage={errors.title}
          helperText="Be clear and specific so other developers know how to help."
          autoFocus
        />

        {/* Tags Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text block">
            Tags (up to 5)
          </label>

          {/* Active Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  size="sm"
                  variant="primary"
                  onRemove={() => handleRemoveTag(tag)}
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          )}

          {/* Tag input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddTag(tagInput)}
              disabled={!tagInput.trim()}
              leftIcon={<HiPlus />}
            >
              Add
            </Button>
          </div>

          {errors.tags && (
            <p className="text-xs text-red-500 font-medium">{errors.tags}</p>
          )}

          {/* Suggested tags */}
          <div className="pt-1">
            <span className="text-[11px] text-text/50 block mb-1">Suggested topics:</span>
            <div className="flex flex-wrap items-center gap-1">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
                .slice(0, 8)
                .map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddTag(suggested)}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-border/40 hover:bg-primary/10 hover:text-primary text-text/60 transition-colors cursor-pointer"
                  >
                    +{suggested}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Content / Question Details */}
        <Textarea
          label="Question Details & Context"
          placeholder="Describe your situation, what you've tried, code snippets or error messages, and what outcome you're looking for..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value)}
          }
          errorMessage={errors.content}
          rows={5}
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Post Question
          </Button>
        </div>
      </form>
    </Modal>
  );
}
