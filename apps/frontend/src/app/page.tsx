import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    title: "Mint Cubs",
    description: "Mint unique Cubs NFTs with randomized traits",
    href: "/mint",
  },
  {
    title: "Cub Editor",
    description: "Customize and edit your Cubs with new traits",
    href: "/editor",
  },
  {
    title: "Marketplace",
    description: "Buy and sell Cubs on the open marketplace",
    href: "/marketplace",
  },
  {
    title: "Staking",
    description: "Stake your Cubs to earn CUBS tokens",
    href: "/staking",
  },
  {
    title: "Token Dashboard",
    description: "Track your CUBS token balance and rewards",
    href: "/token",
  },
  {
    title: "My Cubs",
    description: "View and manage your Cubs collection",
    href: "/my-cubs",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to <span className="text-primary">CUBS</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          The complete NFT ecosystem on Ethereum. Mint, customize, trade, and
          stake your Cubs.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <a key={feature.href} href={feature.href}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary">Explore &rarr;</span>
              </CardContent>
            </Card>
          </a>
        ))}
      </section>
    </div>
  );
}
