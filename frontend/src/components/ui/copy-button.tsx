"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonVariantProps } from "./button";

interface CopyButtonProps extends ButtonVariantProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", variant = "secondary", size = "sm", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; the text stays selectable as a fallback.
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleCopy} className={className} aria-live="polite">
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
