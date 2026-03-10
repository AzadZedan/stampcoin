import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const SYSTEM_PROMPT =
  "You are a knowledgeable stamp collecting assistant for StampCoin, a digital stamp NFT marketplace. Help users with stamp identification, history, valuation, collecting tips, and anything related to philately and the StampCoin platform. Be friendly, informative, and enthusiastic about stamp collecting.";

const SUGGESTED_PROMPTS = [
  "What makes a stamp rare and valuable?",
  "How do I identify a stamp's country of origin?",
  "Tell me about the most valuable stamps in history",
  "What should I look for when buying stamps?",
];

export default function AIAssistant() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
  ]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to get a response. Please try again.");
    },
  });

  const handleSendMessage = (content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  return (
    <div className="min-h-screen bg-vintage-texture flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <h1 className="text-2xl font-serif font-bold text-primary">
                    StampCoin
                  </h1>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/marketplace"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Marketplace
              </Link>
              <Link
                href="/gallery"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/about"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="default">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="outline">Sign In</Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button variant="default">Get Started</Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-serif font-bold">AI Stamp Assistant</h2>
          </div>
          <p className="text-muted-foreground">
            Ask anything about stamp collecting, philately, or the StampCoin
            marketplace.
          </p>
        </div>

        <AIChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
          placeholder="Ask about stamps, collecting tips, valuations..."
          emptyStateMessage="Ask me anything about stamp collecting"
          suggestedPrompts={SUGGESTED_PROMPTS}
          className="flex-1"
          height="calc(100vh - 280px)"
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StampCoin. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
