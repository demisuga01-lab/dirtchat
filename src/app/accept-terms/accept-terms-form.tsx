"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

type PendingDoc = {
  id: string;
  document_type: string;
  version: string;
  title: string;
  content: string;
  published_at: string;
};

export function AcceptTermsForm({
  pendingDocs,
}: {
  pendingDocs: PendingDoc[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [accepting, setAccepting] = useState<string | null>(null);

  async function handleAccept(documentId: string) {
    setAccepting(documentId);
    try {
      const res = await fetch("/api/legal/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legalDocumentId: documentId }),
      });
      const data = await res.json();
      if (!data.ok) {
        push({
          title: "Failed to accept",
          description: data.error ?? "Something went wrong.",
          variant: "destructive",
        });
        return;
      }
      push({
        title: "Accepted",
        description: "Your acceptance has been recorded.",
        variant: "success",
      });
      router.refresh();
    } catch {
      push({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccepting(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {pendingDocs.map((doc) => (
        <section
          key={doc.id}
          className="rounded-lg border border-border bg-card"
        >
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">{doc.title}</h2>
            <p className="text-xs text-muted-foreground">
              Version {doc.version} &middot; Published{" "}
              {new Date(doc.published_at).toLocaleDateString()}
            </p>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none px-6 py-4 text-sm leading-relaxed whitespace-pre-line">
            {doc.content}
          </div>
          <div className="border-t border-border px-6 py-4">
            <Button
              onClick={() => handleAccept(doc.id)}
              disabled={accepting !== null}
            >
              {accepting === doc.id ? "Accepting…" : `Accept ${doc.title}`}
            </Button>
          </div>
        </section>
      ))}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            fetch("/api/auth/sign-out", { method: "POST" }).then(() => {
              router.replace("/sign-in");
              router.refresh();
            });
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
