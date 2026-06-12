import {
  Eye,
  FileText,
  Wrench,
  Code2,
  Braces,
  Sparkles,
  Brain,
  Headphones,
  Video,
  Layers,
  CheckCircle2,
  HelpCircle,
  Square,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ModelCapabilities } from "@/lib/models/types";

type Tri = boolean | null;

interface BadgeDef {
  key: keyof ModelCapabilities;
  label: string;
  icon: React.ReactNode;
}

const BADGES: BadgeDef[] = [
  { key: "supports_image_input", label: "Vision", icon: <Eye className="h-3 w-3" /> },
  { key: "supports_file_input", label: "Files", icon: <FileText className="h-3 w-3" /> },
  { key: "supports_audio_input", label: "Audio in", icon: <Headphones className="h-3 w-3" /> },
  { key: "supports_audio_output", label: "Audio out", icon: <Headphones className="h-3 w-3" /> },
  { key: "supports_video_input", label: "Video", icon: <Video className="h-3 w-3" /> },
  { key: "supports_streaming", label: "Streaming", icon: <Layers className="h-3 w-3" /> },
  { key: "supports_tool_calling", label: "Tools", icon: <Wrench className="h-3 w-3" /> },
  { key: "supports_function_calling", label: "Functions", icon: <Code2 className="h-3 w-3" /> },
  { key: "supports_json_mode", label: "JSON", icon: <Braces className="h-3 w-3" /> },
  { key: "supports_structured_outputs", label: "Structured", icon: <Sparkles className="h-3 w-3" /> },
  { key: "supports_reasoning", label: "Reasoning", icon: <Brain className="h-3 w-3" /> },
];

export function ModelCapabilityBadges({
  capabilities,
  showUnknown = true,
}: {
  capabilities: ModelCapabilities | null;
  showUnknown?: boolean;
}) {
  if (!capabilities) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <HelpCircle className="h-3 w-3" /> Unknown
      </span>
    );
  }
  const items = BADGES.filter((b) => {
    const v = capabilities[b.key] as Tri;
    return v === true;
  });
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.length === 0 ? (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <HelpCircle className="h-3 w-3" />
          {showUnknown ? "Unknown" : "No positive signals"}
        </span>
      ) : (
        items.map((b) => (
          <Badge key={b.key} variant="outline" className="gap-1 text-[10px]">
            {b.icon}
            {b.label}
          </Badge>
        ))
      )}
      {capabilities.capability_confidence === "manual" ? (
        <Badge variant="outline" className="gap-1 text-[10px]">
          <CheckCircle2 className="h-3 w-3" /> Manual
        </Badge>
      ) : null}
    </div>
  );
}

export function CapabilityConfidenceLabel({
  capabilities,
}: {
  capabilities: ModelCapabilities | null;
}) {
  if (!capabilities) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <HelpCircle className="h-3 w-3" /> Unknown
      </span>
    );
  }
  const conf = capabilities.capability_confidence;
  if (conf === "high" || conf === "medium") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-foreground/80">
        <CheckCircle2 className="h-3 w-3 text-success" />
        {conf === "high" ? "High confidence" : "Medium confidence"}
      </span>
    );
  }
  if (conf === "manual") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-foreground/80">
        <CheckCircle2 className="h-3 w-3 text-success" /> Manual
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <HelpCircle className="h-3 w-3" />
      {conf === "low" ? "Low confidence" : "Unknown"}
    </span>
  );
}

export function UnavailableBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <Square className="h-3 w-3" /> Unavailable
    </span>
  );
}
