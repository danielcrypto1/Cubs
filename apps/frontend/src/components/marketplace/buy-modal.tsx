"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { popIn, springBouncy } from "@/lib/animations";
import type { MockListing } from "@/lib/mock-data";

interface BuyModalProps {
  listing: MockListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (listingId: string) => Promise<void>;
  loading: boolean;
}

type BuyStep = "confirm" | "processing" | "success";

export function BuyModal({ listing, open, onOpenChange, onConfirm, loading }: BuyModalProps) {
  const [step, setStep] = useState<BuyStep>("confirm");
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!listing) return;
    setStep("processing");
    try {
      await onConfirm(listing.id);
      // Fake tx hash for display
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTxHash(hash);
      setStep("success");
    } catch {
      setStep("confirm");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset step on close
      setTimeout(() => {
        setStep("confirm");
        setTxHash(null);
      }, 200);
    }
    onOpenChange(open);
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle>Confirm Purchase</DialogTitle>
              </DialogHeader>

              <div className="mt-4 flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={listing.imageUrl}
                    alt={listing.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{listing.name}</h3>
                  <Badge variant="outline" className="text-[10px]">{listing.type}</Badge>
                  {listing.category && (
                    <p className="text-xs text-muted-foreground">{listing.category}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Seller: {listing.seller}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold">{listing.price} ETH</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Platform Fee (2.5%)</span>
                  <span>{(parseFloat(listing.price) * 0.025).toFixed(4)} ETH</span>
                </div>
                <div className="mt-2 border-t border-border pt-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>Total</span>
                    <span>{(parseFloat(listing.price) * 1.025).toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  <ShoppingCart className="mr-1.5 h-4 w-4" />
                  Buy Now
                </Button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="mt-4 font-semibold">Processing Transaction</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirming on the blockchain...
              </p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              variants={popIn}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springBouncy}
              >
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </motion.div>
              <h3 className="mt-4 text-lg font-bold">Purchase Successful!</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                You now own <span className="font-semibold text-foreground">{listing.name}</span>
              </p>

              {txHash && (
                <div className="mt-3 flex items-center gap-1 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="truncate max-w-[200px]">{txHash}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </div>
              )}

              <Button className="mt-4 w-full" onClick={() => handleClose(false)}>
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
