import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function MyCubsPage() {
  return (
    <div>
      <PageHeader
        title="My Cubs"
        description="View and manage your Cubs collection"
      />

      <EmptyState
        title="No Cubs Yet"
        description="Connect your wallet and mint some Cubs to see them here."
        action={
          <Button asChild>
            <a href="/mint">Mint Cubs</a>
          </Button>
        }
      />
    </div>
  );
}
