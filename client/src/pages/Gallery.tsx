import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");

  // Placeholder data - will be replaced with real data from API
  const stamps = [
    {
      id: 1,
      title: "Rare Victorian Stamp 1840",
      country: "United Kingdom",
      year: 1840,
      rarity: "legendary",
      price: "25000",
      imageUrl: "/placeholder-stamp-1.jpg"
    },
    {
      id: 2,
      title: "Blue Mauritius 1847",
      country: "Mauritius",
      year: 1847,
      rarity: "legendary",
      price: "45000",
      imageUrl: "/placeholder-stamp-2.jpg"
    },
    {
      id: 3,
      title: "Inverted Jenny 1918",
      country: "United States",
      year: 1918,
      rarity: "very_rare",
      price: "18000",
      imageUrl: "/placeholder-stamp-3.jpg"
    },
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "text-gray-600",
      uncommon: "text-blue-600",
      rare: "text-purple-600",
      very_rare: "text-yellow-600",
      legendary: "text-red-600"
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
      very_rare: "Very Rare",
      legendary: "Legendary"
    };
    return labels[rarity as keyof typeof labels] || "Common";
  };

  return (
    <div className="min-h-screen bg-stamps-luxury">
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
              <Link href="/gallery" className="text-primary font-medium">
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
      <section className="py-16 premium-section text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-serif font-bold text-foreground mb-4 text-gold-foil text-shadow-luxury">
            Stamp Gallery
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Explore our curated collection of rare and valuable digital stamps from around the world
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search stamps by name, country, or year..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Rarity" />
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
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="stamps-grid-enhanced grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stamps.map((stamp) => (
              <Card key={stamp.id} className="stamp-card-hover card-premium overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center text-muted-foreground">
                      <div className="text-6xl mb-2">🎫</div>
                      <p className="text-sm">{stamp.title}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-foreground">{stamp.title}</h3>
                      <p className="text-sm text-muted-foreground">{stamp.country} • {stamp.year}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        stamp.rarity === 'legendary' ? 'rarity-legendary text-white' :
                        stamp.rarity === 'very_rare' ? 'rarity-very-rare text-white' :
                        stamp.rarity === 'rare' ? 'rarity-rare text-white' :
                        'rarity-uncommon text-white'
                      }`}>
                        {getRarityLabel(stamp.rarity)}
                      </span>
                      <span className="text-lg font-serif font-bold text-primary">${stamp.price}</span>
                    </div>
                    <Button className="w-full" variant="default">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
