import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, DollarSign, BarChart3, Target, Users, Globe } from "lucide-react";
import { Link } from "wouter";

export default function Investors() {
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
              <Link href="/gallery" className="text-foreground/80 hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link href="/investors" className="text-primary font-medium">
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
      <section className="py-20 premium-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 text-gold-foil text-shadow-luxury">
              Investment Opportunity
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join us in revolutionizing the $5+ billion stamp collecting market with blockchain technology
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  Schedule a Meeting
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Download Pitch Deck
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-serif font-bold text-foreground mb-12 text-center">
            Market Opportunity
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-4xl font-serif font-bold text-primary mb-2">$5B+</div>
                <div className="text-lg font-semibold mb-2">Annual Market Size</div>
                <p className="text-muted-foreground">
                  The global stamp collecting market represents a massive untapped opportunity for digital transformation
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
                <div className="text-4xl font-serif font-bold text-secondary mb-2">70M+</div>
                <div className="text-lg font-semibold mb-2">Global Collectors</div>
                <p className="text-muted-foreground">
                  A massive user base ready to embrace digital stamp collecting and NFT technology
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Globe className="w-12 h-12 text-accent mx-auto mb-4" />
                <div className="text-4xl font-serif font-bold text-accent mb-2">150+</div>
                <div className="text-lg font-semibold mb-2">Countries</div>
                <p className="text-muted-foreground">
                  Global reach with collectors across all continents seeking rare and valuable stamps
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Financial Projections */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-serif font-bold text-foreground mb-12 text-center">
            Financial Projections
          </h3>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Year 1</div>
                  <div className="text-3xl font-serif font-bold text-primary mb-1">$1.2M</div>
                  <div className="text-sm text-muted-foreground">Projected Revenue</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Year 2</div>
                  <div className="text-3xl font-serif font-bold text-primary mb-1">$3.5M</div>
                  <div className="text-sm text-muted-foreground">Projected Revenue</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Year 3</div>
                  <div className="text-3xl font-serif font-bold text-primary mb-1">$8.5M</div>
                  <div className="text-sm text-muted-foreground">Projected Revenue</div>
                </CardContent>
              </Card>
            </div>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h4 className="text-2xl font-serif font-semibold mb-4">Revenue Model</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <span className="font-semibold text-foreground">Transaction Fees (5%):</span> Commission on every stamp sale through the marketplace
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <span className="font-semibold text-foreground">Premium Subscriptions:</span> Advanced features for serious collectors and dealers
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <span className="font-semibold text-foreground">Authentication Services:</span> Expert verification and grading services
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <span className="font-semibold text-foreground">Limited Edition Releases:</span> Exclusive digital stamp collections
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-serif font-bold text-foreground mb-12 text-center">
            Competitive Advantage
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h4 className="text-xl font-serif font-semibold mb-3">First Mover Advantage</h4>
                <p className="text-muted-foreground">
                  No specialized NFT platform exists for stamp collectors. We're pioneering this niche market with deep domain expertise.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h4 className="text-xl font-serif font-semibold mb-3">Expert Authentication</h4>
                <p className="text-muted-foreground">
                  Partnership with leading philatelic experts ensures every stamp is properly authenticated and valued.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <Globe className="w-10 h-10 text-primary mb-4" />
                <h4 className="text-xl font-serif font-semibold mb-3">Global Network</h4>
                <p className="text-muted-foreground">
                  Strategic partnerships with postal services, museums, and collector associations worldwide.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <h4 className="text-xl font-serif font-semibold mb-3">Proven Demand</h4>
                <p className="text-muted-foreground">
                  Rare stamps have consistently appreciated in value, with some increasing 300%+ over 10 years.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-4xl font-serif font-bold mb-6">
              Investment Opportunity
            </h3>
            <div className="text-6xl font-serif font-bold mb-4">$3.5M</div>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Seeking strategic investment to scale operations, expand authentication partnerships, 
              and accelerate user acquisition
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-2xl font-serif font-bold mb-1">3-5x</div>
                <div className="text-sm text-primary-foreground/80">Expected ROI (3 years)</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold mb-1">85%</div>
                <div className="text-sm text-primary-foreground/80">Platform Completion</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold mb-1">8-12 weeks</div>
                <div className="text-sm text-primary-foreground/80">To Full Launch</div>
              </div>
            </div>
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Schedule Investment Discussion
              </Button>
            </Link>
          </div>
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
