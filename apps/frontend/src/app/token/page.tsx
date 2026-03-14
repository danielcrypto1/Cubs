import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TokenPage() {
  return (
    <div>
      <PageHeader
        title="Token Dashboard"
        description="Track your CUBS token balance and activity"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 CUBS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Staking Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 CUBS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Token Price</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$--</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Connect wallet to view token activity</p>
        </CardContent>
      </Card>
    </div>
  );
}
