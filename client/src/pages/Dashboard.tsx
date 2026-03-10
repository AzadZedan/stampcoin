import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Heart, ShoppingBag, User } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: favorites, isLoading: favoritesLoading } =
    trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: transactions, isLoading: transactionsLoading } =
    trpc.transactions.myTransactions.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  return (
    <DashboardLayout>
      {/* User Info Card */}
      <Card className="mb-8 border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">
                {user?.name || "User"}
              </h2>
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
                <p className="text-2xl font-bold">
                  {transactions?.length || 0}
                </p>
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
                  $
                  {transactions
                    ?.reduce((sum, t) => sum + Number(t.price), 0)
                    .toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
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
                <p className="text-center text-muted-foreground py-8">
                  Loading favorites...
                </p>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(favorite => (
                    <Card key={favorite.id} className="border-border/30">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg mb-3 flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-primary/20" />
                        </div>
                        <p className="font-medium mb-1">
                          Stamp #{favorite.stampId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Added{" "}
                          {new Date(favorite.createdAt).toLocaleDateString()}
                        </p>
                        <Link href={`/stamp/${favorite.stampId}`}>
                          <Button size="sm" className="w-full mt-3">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No favorites yet</p>
                  <p className="text-muted-foreground mb-4">
                    Start adding stamps to your favorites from the marketplace
                  </p>
                  <Link href="/marketplace">
                    <Button>Explore Marketplace</Button>
                  </Link>
                </div>
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
                <p className="text-center text-muted-foreground py-8">
                  Loading transactions...
                </p>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map(transaction => (
                    <Card key={transaction.id} className="border-border/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium mb-1">
                              Stamp #{transaction.stampId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}{" "}
                              •{" "}
                              <span className="capitalize">
                                {transaction.status}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              ${transaction.price}
                            </p>
                            <Link href={`/stamp/${transaction.stampId}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
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
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No purchases yet</p>
                  <p className="text-muted-foreground mb-4">
                    Start collecting digital stamps from our marketplace
                  </p>
                  <Link href="/marketplace">
                    <Button>Browse Stamps</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
