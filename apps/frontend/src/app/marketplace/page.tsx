import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function MarketplacePage() {
  return (
    <div>
      <PageHeader
        title="Marketplace"
        description="Buy and sell Cubs on the open marketplace"
      />

      <EmptyState
        title="No Listings"
        description="There are no Cubs listed for sale yet. Check back soon."
      />
    </div>
  );
}
