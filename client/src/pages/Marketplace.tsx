import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Search, Filter, Heart } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");

  const { data: stamps, isLoading } = trpc.stamps.list.useQuery({
    search: searchQuery || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    rarity: selectedRarity || undefined,
  });

  const { data: categories } = trpc.categories.list.useQuery();

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
              <Link href="/marketplace" className="text-primary font-medium">
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
            <Link href="/dashboard">
              <Button variant="default">Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 premium-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-serif font-bold text-foreground mb-4 text-shadow-luxury">
            Digital Stamp Marketplace
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover, collect, and trade authenticated digital stamps from around the world
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search Stamps</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, country, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Rarity</label>
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Rarities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="very_rare">Very Rare</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stamps Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading stamps...</p>
            </div>
          ) : stamps && stamps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stamps.map((stamp) => (
                <Card
                  key={stamp.id}
                  className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center overflow-hidden">
                    {stamp.imageUrl ? (
                      <img
                        src={stamp.imageUrl}
                        alt={stamp.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Sparkles className="w-24 h-24 text-primary/20" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/80 backdrop-blur-sm hover:bg-background"
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm">
                        {stamp.rarity}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-serif font-semibold text-lg mb-1 line-clamp-1">
                      {stamp.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {stamp.country} • {stamp.year}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-xl font-bold text-primary">${stamp.price}</p>
                      </div>
                      <Link href={`/stamp/${stamp.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-medium text-foreground mb-2">No stamps found</p>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/80">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 StampCoin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
