"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ShoppingCart,
  HandCoins,
  ArrowRightLeft,
  Loader2,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { popIn, springBouncy } from "@/lib/animations";
import { MOCK_LISTINGS } from "@/lib/mock-data";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-zinc-400",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-amber-400",
};

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const listing = useMemo(() => MOCK_LISTINGS.find((l) => l.id === id), [id]);

  const [buyLoading, setBuyLoading] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

  if (!listing) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
          <Link href="/marketplace" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
          </Link>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold">Listing Not Found</h2>
              <p className="mt-2 text-muted-foreground">This listing may have been sold or cancelled.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleBuy = async () => {
    setBuyLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBuyLoading(false);
    setBuySuccess(true);
  };

  const handleOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) return;
    setOfferLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setOfferLoading(false);
    setOfferSuccess(true);
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        <Link href="/marketplace" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          {/* Asset Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card">
              <Image
                src={listing.imageUrl}
                alt={listing.name}
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {listing.type}
                </Badge>
                <Badge variant={RARITY_VARIANTS[listing.rarity] ?? "common"}>
                  {listing.rarity}
                </Badge>
              </div>
              {listing.quantity > 1 && (
                <Badge variant="secondary" className="absolute right-3 top-3">
                  x{listing.quantity}
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Details & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl tracking-tight">{listing.name}</h1>
              {listing.category && (
                <span className="mt-1 inline-block text-sm text-muted-foreground">
                  {listing.category}
                </span>
              )}
            </div>

            {/* Seller */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Listed by</span>
              <span className="font-mono font-medium text-foreground">{listing.seller}</span>
            </div>

            {/* Listed date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Listed {new Date(listing.listedAt).toLocaleDateString()}</span>
            </div>

            {/* Price Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold">{listing.price}</span>
                  <span className="text-lg text-muted-foreground">ETH</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {buySuccess ? (
              <motion.div
                variants={popIn}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center rounded-xl border border-green-500/20 bg-green-500/5 p-6"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springBouncy}>
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </motion.div>
                <h3 className="mt-3 font-semibold">Purchase Successful!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You now own <span className="font-semibold text-foreground">{listing.name}</span>
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBuy}
                  disabled={buyLoading}
                >
                  {buyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Buy Now for {listing.price} ETH
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setOfferOpen(true)}
                  >
                    <HandCoins className="mr-2 h-4 w-4" />
                    Make Offer
                  </Button>
                  <Button variant="outline" size="lg" disabled>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Propose Trade
                  </Button>
                </div>
              </div>
            )}

            {/* Offers section */}
            <div>
              <h3 className="mb-3 font-display text-lg">Offers</h3>
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No offers yet. Be the first to make an offer!
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Offer Modal */}
      <Dialog open={offerOpen} onOpenChange={(open) => {
        setOfferOpen(open);
        if (!open) {
          setTimeout(() => {
            setOfferAmount("");
            setOfferSuccess(false);
          }, 200);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence mode="wait">
            {!offerSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle>Make an Offer</DialogTitle>
                </DialogHeader>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image src={listing.imageUrl} alt={listing.name} fill unoptimized className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{listing.name}</h4>
                    <p className="text-sm text-muted-foreground">Listed at {listing.price} ETH</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium">Your Offer (PAWS)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter PAWS amount"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setOfferOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleOffer}
                    disabled={!offerAmount || parseFloat(offerAmount) <= 0 || offerLoading}
                  >
                    {offerLoading ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <HandCoins className="mr-1.5 h-4 w-4" />
                        Submit Offer
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                variants={popIn}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center py-6"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springBouncy}>
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </motion.div>
                <h3 className="mt-3 font-semibold">Offer Submitted!</h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                  Your offer of <span className="font-semibold text-foreground">{offerAmount} PAWS</span> has been placed.
                </p>
                <Button className="mt-4 w-full" onClick={() => setOfferOpen(false)}>
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
