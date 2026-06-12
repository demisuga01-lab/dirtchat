import { KeyRound, ShieldCheck, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProviderFormPlaceholder } from "@/components/providers/provider-form-placeholder";

export const metadata = {
  title: "Providers",
};

const plannedProviders = [
  {
    name: "TokenRouter",
    description:
      "The OpenAI-compatible router used to talk to multiple model families from one endpoint.",
    protocol: "OpenAI-compatible",
  },
  {
    name: "OpenRouter",
    description:
      "Multi-provider routing with a uniform interface, useful for fallbacks and cost control.",
    protocol: "OpenAI-compatible",
  },
  {
    name: "OpenAI",
    description: "Direct OpenAI access for production traffic.",
    protocol: "OpenAI-compatible",
  },
  {
    name: "Anthropic",
    description: "Direct Anthropic access for Claude models.",
    protocol: "Anthropic-compatible",
  },
  {
    name: "Custom router",
    description:
      "A self-hosted or third-party router. Wire up via base URL + API key in a later prompt.",
    protocol: "OpenAI-compatible",
  },
];

export default function ProvidersPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-3xl font-semibold tracking-tight">Providers</h1>
          <Badge variant="outline">Prompt 2</Badge>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Provider connections are stubbed in Prompt 1. The form below shows
          the planned shape &mdash; nothing you type here is saved or sent
          anywhere.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Your keys stay yours</CardTitle>
            <CardDescription>
              When provider storage ships, keys will be encrypted at rest and
              only used to call providers on your behalf.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
              <Zap className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Test connection</CardTitle>
            <CardDescription>
              A future &ldquo;Test connection&rdquo; action will validate base URLs and
              surface a sample model list.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
              <KeyRound className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Refresh models</CardTitle>
            <CardDescription>
              Once a provider is connected, model discovery will be
              one-click &mdash; no manual list-keeping.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Provider connection (preview)</CardTitle>
          <CardDescription>
            All fields below are disabled. They illustrate the shape of the
            real form, which will be added in Prompt 2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderFormPlaceholder />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plannedProviders.map((p) => (
          <Card key={p.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <Badge variant="outline">{p.protocol}</Badge>
              </div>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
