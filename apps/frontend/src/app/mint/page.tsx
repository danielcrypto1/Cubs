import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MintPage() {
  return (
    <div>
      <PageHeader
        title="Mint Cubs"
        description="Mint your unique Cubs NFT with randomized traits"
      />

      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Cubs Mint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Mint Preview</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold">0.05 ETH</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Supply</span>
              <span className="font-semibold">0 / 10,000</span>
            </div>
            <Button className="w-full" disabled>
              Connect Wallet to Mint
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
