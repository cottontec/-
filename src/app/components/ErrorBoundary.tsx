"use client";

import { Component, type ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
          <AlertOctagon className="text-red-600 dark:text-red-400" size={28} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-[var(--foreground)]">エラーが発生しました</h1>
        <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
          画面の表示に問題が発生しました。再読み込みするか、ホームへ戻ってください。
        </p>
        <pre className="mt-3 max-w-sm overflow-x-auto rounded-md bg-[var(--surface-2)] p-2 text-left text-[11px] text-[var(--muted)]">
          {this.state.error.message}
        </pre>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => { this.reset(); window.location.reload(); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} /> 再読み込み
          </button>
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          >
            <Home size={16} /> ホームへ
          </a>
        </div>
      </div>
    );
  }
}
