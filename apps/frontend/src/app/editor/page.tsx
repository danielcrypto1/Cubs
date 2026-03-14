import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function EditorPage() {
  return (
    <div>
      <PageHeader
        title="Cub Editor"
        description="Customize your Cubs with new traits and accessories"
      />

      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg font-semibold">Cub Editor</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Coming soon. Select a Cub to customize its traits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
