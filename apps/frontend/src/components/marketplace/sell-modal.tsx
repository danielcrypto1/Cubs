"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, Loader2 } from "lucide-react";
import { MOCK_CUBS, MOCK_CRATES, MOCK_TRAIT_DEFINITIONS } from "@/lib/mock-data";
import { popIn, springBouncy } from "@/lib/animations";
import type { MockListing } from "@/lib/mock-data";

type AssetTab = "CUB" | "TRAIT" | "CRATE";
type SellStep = "select" | "processing" | "success";

interface SellModalProps {
  onSuccess: (listing: MockListing) => void;
}

export function SellModal({ onSuccess }: SellModalProps) {
  const [open, setOpen] = useState(false);
  const [assetType, setAssetType] = useState<AssetTab>("CUB");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("COMMON");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [price, setPrice] = useState("");
  const [step, setStep] = useState<SellStep>("select");

  const handleSelect = (id: string, name: string, image: string, rarity: string, category?: string) => {
    setSelectedId(id);
    setSelectedName(name);
    setSelectedImage(image);
    setSelectedRarity(rarity);
    setSelectedCategory(category);
  };

  const handleSubmit = async () => {
    if (!selectedId || !price || parseFloat(price) <= 0) return;

    setStep("processing");
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newListing: MockListing = {
      id: `l-${Date.now()}`,
      type: assetType,
      name: selectedName,
      imageUrl: selectedImage,
      rarity: selectedRarity,
      price,
      seller: "0xYOU...rWallet",
      category: selectedCategory,
      listedAt: new Date().toISOString(),
      quantity: 1,
    };

    setStep("success");

    // Delay before calling onSuccess so user sees confirmation
    setTimeout(() => {
      onSuccess(newListing);
    }, 500);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("select");
        setSelectedId(null);
        setPrice("");
      }, 200);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Sell Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle>List Item for Sale</DialogTitle>
                <DialogDescription>Choose an asset and set your price.</DialogDescription>
              </DialogHeader>

              <Tabs
                value={assetType}
                onValueChange={(v) => {
                  setAssetType(v as AssetTab);
                  setSelectedId(null);
                }}
              >
                <TabsList className="mt-4 w-full">
                  <TabsTrigger value="CUB" className="flex-1">Cubs</TabsTrigger>
                  <TabsTrigger value="TRAIT" className="flex-1">Traits</TabsTrigger>
                  <TabsTrigger value="CRATE" className="flex-1">Crates</TabsTrigger>
                </TabsList>

                <TabsContent value="CUB" className="mt-4">
                  <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
                    {MOCK_CUBS.map((cub) => (
                      <button
                        key={cub.id}
                        type="button"
                        onClick={() => handleSelect(cub.id, cub.name, cub.imageUrl, "EPIC")}
                        className={`overflow-hidden rounded-lg border text-left transition-all ${
                          selectedId === cub.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image src={cub.imageUrl} alt={cub.name} fill unoptimized className="object-cover" />
                        </div>
                        <p className="truncate px-2 py-1 text-xs font-medium">{cub.name}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="TRAIT" className="mt-4">
                  <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
                    {MOCK_TRAIT_DEFINITIONS.slice(0, 12).map((trait) => (
                      <button
                        key={trait.id}
                        type="button"
                        onClick={() => handleSelect(trait.id, trait.name, trait.imageUrl, trait.rarity, trait.category)}
                        className={`overflow-hidden rounded-lg border text-left transition-all ${
                          selectedId === trait.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image src={trait.imageUrl} alt={trait.name} fill unoptimized className="object-cover" />
                        </div>
                        <div className="px-2 py-1">
                          <p className="truncate text-xs font-medium">{trait.name}</p>
                          <Badge variant="outline" className="mt-0.5 text-[8px]">{trait.rarity}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="CRATE" className="mt-4">
                  <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
                    {MOCK_CRATES.filter((c) => c.quantity > 0).map((crate) => (
                      <button
                        key={crate.id}
                        type="button"
                        onClick={() => handleSelect(crate.id, crate.name, crate.imageUrl, crate.rarity)}
                        className={`overflow-hidden rounded-lg border text-left transition-all ${
                          selectedId === crate.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image src={crate.imageUrl} alt={crate.name} fill unoptimized className="object-cover" />
                        </div>
                        <div className="px-2 py-1">
                          <p className="truncate text-xs font-medium">{crate.name}</p>
                          <Badge variant="secondary" className="mt-0.5 text-[8px]">x{crate.quantity}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">Price (ETH)</label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.05"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedId || !price || parseFloat(price) <= 0}
                >
                  List for Sale
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="mt-4 font-semibold">Creating Listing</h3>
              <p className="mt-1 text-sm text-muted-foreground">Confirming transaction...</p>
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springBouncy}>
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </motion.div>
              <h3 className="mt-4 text-lg font-bold">Listed Successfully!</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedName}</span> is now listed for{" "}
                <span className="font-semibold text-foreground">{price} ETH</span>
              </p>
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
