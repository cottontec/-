"use client";

import { useState, useRef } from "react";
import { Camera, Type, X, Upload } from "lucide-react";

interface WritingAnswerProps {
  onAnswerChange?: (answer: { text: string; imageDataUrl: string | null }) => void;
  readOnly?: boolean;
  initialText?: string;
  initialImage?: string | null;
}

export default function WritingAnswer({
  onAnswerChange,
  readOnly = false,
  initialText = "",
  initialImage = null,
}: WritingAnswerProps) {
  const [mode, setMode] = useState<"text" | "photo">(initialImage ? "photo" : "text");
  const [text, setText] = useState(initialText);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (value: string) => {
    setText(value);
    onAnswerChange?.({ text: value, imageDataUrl });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);
      onAnswerChange?.({ text, imageDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageDataUrl(null);
    onAnswerChange?.({ text, imageDataUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="mb-3 text-lg font-bold text-[var(--foreground)]">ライティング解答</h3>

      {/* モード切替 */}
      {!readOnly && (
        <div className="mb-3 flex rounded-lg bg-[var(--surface-2)] p-1">
          <button
            onClick={() => setMode("text")}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "text" ? "bg-[var(--surface)] shadow text-[var(--foreground)]" : "text-[var(--muted)]"
            }`}
          >
            <Type size={14} /> テキスト入力
          </button>
          <button
            onClick={() => setMode("photo")}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "photo" ? "bg-[var(--surface)] shadow text-[var(--foreground)]" : "text-[var(--muted)]"
            }`}
          >
            <Camera size={14} /> 写真で撮る
          </button>
        </div>
      )}

      {/* テキスト入力 */}
      {mode === "text" && (
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          readOnly={readOnly}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm leading-relaxed"
          rows={8}
          placeholder="ここに英文を入力してください..."
        />
      )}

      {/* 写真アップロード */}
      {mode === "photo" && (
        <div>
          {imageDataUrl ? (
            <div className="relative">
              <img
                src={imageDataUrl}
                alt="解答写真"
                className="w-full rounded-md border border-[var(--border)]"
              />
              {!readOnly && (
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-[var(--border)] py-12 text-[var(--muted)] hover:border-blue-400 hover:text-blue-500"
            >
              <Upload size={32} className="mb-2" />
              <p className="text-sm">タップして写真を選択</p>
              <p className="text-xs">またはカメラで撮影</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* 文字数カウント */}
      {mode === "text" && (
        <div className="mt-2 text-right text-xs text-[var(--muted)]">
          {text.split(/\s+/).filter(Boolean).length} words
        </div>
      )}
    </div>
  );
}
