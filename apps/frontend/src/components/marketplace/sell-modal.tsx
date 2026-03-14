"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useListingActions } from "@/hooks/use-listing-actions";
import { formatEthToWei } from "@/lib/format";
import { useCubs } from "@/hooks/use-cubs";
import { useCrates } from "@/hooks/use-crates";
import type { AssetType } from "@/types";

interface SellModalProps {
  walletAddress: string | undefined;
  onSuccess: () => void;
}

export function SellModal({ walletAddress, onSuccess }: SellModalProps) {
  const [open, setOpen] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>("CUB");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const { listItem, loading } = useListingActions();

  const { data: cubsData } = useCubs(walletAddress);
  const { data: cratesData } = useCrates();

  const handleSubmit = async () => {
    if (!selectedAssetId || !price) return;

    const priceWei = formatEthToWei(price);
    if (priceWei === "0") return;

    try {
      await listItem({
        assetType,
        assetId: selectedAssetId,
        quantity: assetType === "CUB" ? 1 : parseInt(quantity, 10) || 1,
        priceWei,
      });
      setOpen(false);
      setSelectedAssetId(null);
      setPrice("");
      setQuantity("1");
      onSuccess();
    } catch {
      // error handled by hook
    }
  };

  const cubs = cubsData?.cubs ?? [];
  const crates = cratesData ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!walletAddress}>Sell Item</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>List Item for Sale</DialogTitle>
          <DialogDescription>Choose an asset type and select the item to list.</DialogDescription>
        </DialogHeader>

        <Tabs value={assetType} onValueChange={(v) => { setAssetType(v as AssetType); setSelectedAssetId(null); }}>
          <TabsList className="w-full">
            <TabsTrigger value="CUB" className="flex-1">Cubs</TabsTrigger>
            <TabsTrigger value="TRAIT" className="flex-1">Traits</TabsTrigger>
            <TabsTrigger value="CRATE" className="flex-1">Crates</TabsTrigger>
          </TabsList>

          <TabsContent value="CUB" className="mt-4">
            <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
              {cubs.map((cub) => (
                <button
                  key={cub.id}
                  type="button"
                  onClick={() => setSelectedAssetId(cub.id)}
                  className={`rounded-lg border p-2 text-left text-xs transition-colors ${
                    selectedAssetId === cub.id ? "border-primary bg-primary/10" : "hover:bg-accent"
                  }`}
                >
                  <div className="font-medium truncate">{cub.name || `Cub #${cub.tokenId}`}</div>
                </button>
              ))}
              {cubs.length === 0 && <p className="col-span-3 text-sm text-muted-foreground">No cubs owned</p>}
            </div>
          </TabsContent>

          <TabsContent value="TRAIT" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Connect wallet and use the trait inventory to select traits for listing.
            </p>
          </TabsContent>

          <TabsContent value="CRATE" className="mt-4">
            <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
              {crates.map((crate) =>
                crate.crateDefinition ? (
                  <button
                    key={crate.crateDefinitionId}
                    type="button"
                    onClick={() => setSelectedAssetId(crate.crateDefinitionId)}
                    className={`rounded-lg border p-2 text-left text-xs transition-colors ${
                      selectedAssetId === crate.crateDefinitionId ? "border-primary bg-primary/10" : "hover:bg-accent"
                    }`}
                  >
                    <div className="font-medium truncate">{crate.crateDefinition.name}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">x{crate.quantity}</Badge>
                  </button>
                ) : null,
              )}
              {crates.length === 0 && <p className="col-span-3 text-sm text-muted-foreground">No crates owned</p>}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-3 pt-2">
          <div>
            <label className="text-sm font-medium">Price (ETH)</label>
            <Input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.05"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          {assetType !== "CUB" && (
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedAssetId || !price}>
            {loading ? "Listing..." : "List for Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
