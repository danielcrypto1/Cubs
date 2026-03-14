import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StakingPage() {
  return (
    <div>
      <PageHeader
        title="Staking"
        description="Stake your Cubs to earn CUBS tokens"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 Cubs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Rewards Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 CUBS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">APY</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Connect wallet to view staking positions</p>
        </CardContent>
      </Card>
    </div>
  );
}
