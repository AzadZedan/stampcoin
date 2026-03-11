import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Heart, ShoppingBag, User, LogOut, ArrowLeft, Coins, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { data: favorites, isLoading: favoritesLoading } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: transactions, isLoading: transactionsLoading } = trpc.transactions.myTransactions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: tokenInfo } = trpc.blockchain.getInfo.useQuery();
  const { data: tokenSupply } = trpc.blockchain.getSupply.useQuery();

  if (loading) {
    return (
      <div className="min-h-screen bg-rare-stamps flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-rare-stamps flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please sign in to access your dashboard
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full">Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rare-stamps">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">StampCoin</h1>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-foreground/80 hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link href="/gallery" className="text-foreground/80 hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link href="/investors" className="text-foreground/80 hover:text-primary transition-colors">
                For Investors
              </Link>
              <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-foreground/80 hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
            <Button onClick={() => logout()} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Dashboard Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* User Info Card */}
          <Card className="mb-8 border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold">{user?.name || "User"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                    <p className="text-2xl font-bold">{favorites?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchases</p>
                    <p className="text-2xl font-bold">{transactions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">
                      ${transactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0).toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
              <TabsTrigger value="favorites">My Favorites</TabsTrigger>
              <TabsTrigger value="purchases">Purchase History</TabsTrigger>
              <TabsTrigger value="token">STP Token</TabsTrigger>
            </TabsList>

            <TabsContent value="favorites">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Favorite Stamps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoritesLoading ? (
                    <p className="text-center text-muted-foreground py-8">Loading favorites...</p>
                  ) : favorites && favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map((fav) => (
                        <Card key={fav.id} className="border-border/30">
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg mb-3 flex items-center justify-center">
                              <Sparkles className="w-12 h-12 text-primary/20" />
                            </div>
                            <p className="font-medium mb-1">Stamp #{fav.stampId}</p>
                            <p className="text-sm text-muted-foreground">
                              Added {new Date(fav.createdAt).toLocaleDateString()}
                            </p>
                            <Link href={`/stamp/${fav.stampId}`}>
                              <Button size="sm" className="w-full mt-3">View Details</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Heart />
                        </EmptyMedia>
                        <EmptyTitle>No favorites yet</EmptyTitle>
                        <EmptyDescription>
                          Start adding stamps to your favorites from the
                          marketplace
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Link href="/marketplace">
                          <Button>Explore Marketplace</Button>
                        </Link>
                      </EmptyContent>
                    </Empty>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <p className="text-center text-muted-foreground py-8">Loading transactions...</p>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction: any) => (
                        <Card key={transaction.id} className="border-border/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium mb-1">Stamp #{transaction.stampId}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(transaction.createdAt).toLocaleDateString()} •{" "}
                                  <span className="capitalize">{transaction.status}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-primary">${transaction.amount}</p>
                                <Link href={`/stamp/${transaction.stampId}`}>
                                  <Button size="sm" variant="outline" className="mt-2">
                                    View Stamp
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ShoppingBag />
                        </EmptyMedia>
                        <EmptyTitle>No purchases yet</EmptyTitle>
                        <EmptyDescription>
                          Start collecting digital stamps from our marketplace
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Link href="/marketplace">
                          <Button>Browse Stamps</Button>
                        </Link>
                      </EmptyContent>
                    </Empty>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="token">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    STP Token Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Token Details</h4>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border/30">
                          <dt className="text-muted-foreground">Token Name</dt>
                          <dd className="font-medium">{tokenInfo?.name ?? "StampCoin"}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/30">
                          <dt className="text-muted-foreground">Symbol</dt>
                          <dd className="font-bold text-primary">{tokenInfo?.symbol ?? "STP"}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/30">
                          <dt className="text-muted-foreground">Standard</dt>
                          <dd className="font-medium">{tokenInfo?.standard ?? "BEP-20"}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/30">
                          <dt className="text-muted-foreground">Blockchain</dt>
                          <dd className="font-medium">{tokenInfo?.blockchain ?? "BNB Smart Chain"}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/30">
                          <dt className="text-muted-foreground">Network</dt>
                          <dd className="font-medium">{tokenInfo?.network ?? "BSC Mainnet"}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/30">
                          <dt className="text-muted-foreground">Decimals</dt>
                          <dd className="font-medium">{tokenInfo?.decimals ?? 18}</dd>
                        </div>
                        <div className="flex justify-between py-2">
                          <dt className="text-muted-foreground">Chain ID</dt>
                          <dd className="font-medium">{tokenInfo?.chainId ?? 56}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Supply Metrics</h4>
                      <div className="space-y-4">
                        <Card className="border-border/30 bg-primary/5">
                          <CardContent className="p-4 text-center">
                            <div className="text-sm text-muted-foreground mb-1">Total Supply</div>
                            <div className="text-3xl font-serif font-bold text-primary">
                              {tokenSupply ? (tokenSupply.totalSupply / 1_000_000).toFixed(0) + "M" : "421M"}
                            </div>
                            <div className="text-xs text-muted-foreground">STP tokens</div>
                          </CardContent>
                        </Card>
                        <Card className="border-border/30 bg-secondary/5">
                          <CardContent className="p-4 text-center">
                            <div className="text-sm text-muted-foreground mb-1">In Circulation</div>
                            <div className="text-3xl font-serif font-bold text-secondary">
                              {tokenSupply ? tokenSupply.mintedSupply.toLocaleString() : "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">from completed transactions</div>
                          </CardContent>
                        </Card>
                        <Card className="border-border/30 bg-accent/5">
                          <CardContent className="p-4 text-center">
                            <div className="text-sm text-muted-foreground mb-1">Remaining Supply</div>
                            <div className="text-3xl font-serif font-bold text-accent">
                              {tokenSupply
                                ? (tokenSupply.remainingSupply / 1_000_000).toFixed(2) + "M"
                                : "421M"}
                            </div>
                            <div className="text-xs text-muted-foreground">STP tokens available</div>
                          </CardContent>
                        </Card>
                      </div>
                      {tokenInfo?.contractAddress && tokenInfo.contractAddress !== "Pending mainnet deployment" && (
                        <a
                          href={`https://bscscan.com/token/${tokenInfo.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" className="w-full gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View on BscScan
                          </Button>
                        </a>
                      )}
                      <Link href="/investors">
                        <Button variant="outline" className="w-full">
                          Learn More About STP Token
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/80 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 StampCoin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
