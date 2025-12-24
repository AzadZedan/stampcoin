import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ArrowRight, Shield, TrendingUp, Users, Sparkles, Globe, Award } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-vintage-texture">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">StampCoin</h1>
            </div>
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
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="default">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="outline">Sign In</Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button variant="default">Get Started</Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Premium Background */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                The Future of
                <span className="text-gold-foil block text-shadow-luxury">Stamp Collecting</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join 70+ million stamp collectors worldwide in the digital revolution. 
                Buy, sell, and trade authenticated digital stamps with blockchain technology.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/marketplace">
                  <Button size="lg" className="gap-2">
                    Explore Marketplace <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <div>
                  <div className="text-3xl font-serif font-bold text-primary">70M+</div>
                  <div className="text-sm text-muted-foreground">Collectors Worldwide</div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-primary">$5B+</div>
                  <div className="text-sm text-muted-foreground">Annual Market</div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8 shadow-elegant-lg">
                <div className="w-full h-full bg-card rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-24 h-24 text-primary mx-auto mb-4" />
                    <p className="text-lg font-serif text-muted-foreground">Featured Stamp Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-serif font-bold text-foreground mb-4">
              Why Choose StampCoin?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The first specialized NFT platform designed exclusively for stamp collectors
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-4">Authenticated</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Every stamp is verified and authenticated by experts, ensuring the 
                  authenticity and value of your digital collection.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-secondary" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-4">Global Marketplace</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with collectors from 150+ countries. Buy, sell, and trade 
                  stamps from around the world in one platform.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-accent" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-4">Investment Potential</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Rare stamps appreciate in value over time. Track market trends and 
                  build a valuable digital collection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-12 md:p-16 text-primary-foreground shadow-elegant-lg">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <Users className="w-10 h-10 mx-auto mb-4 opacity-90" />
                <div className="text-4xl font-serif font-bold mb-2">70M+</div>
                <div className="text-primary-foreground/80">Active Collectors</div>
              </div>
              <div>
                <Award className="w-10 h-10 mx-auto mb-4 opacity-90" />
                <div className="text-4xl font-serif font-bold mb-2">10K+</div>
                <div className="text-primary-foreground/80">Rare Stamps</div>
              </div>
              <div>
                <Globe className="w-10 h-10 mx-auto mb-4 opacity-90" />
                <div className="text-4xl font-serif font-bold mb-2">150+</div>
                <div className="text-primary-foreground/80">Countries</div>
              </div>
              <div>
                <TrendingUp className="w-10 h-10 mx-auto mb-4 opacity-90" />
                <div className="text-4xl font-serif font-bold mb-2">$5B+</div>
                <div className="text-primary-foreground/80">Market Value</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Start Your Digital Collection Today
            </h3>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of collectors who have already made the transition to digital stamp collecting
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link href="/marketplace">
                <Button size="lg" variant="outline">
                  Browse Stamps
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/80">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h4 className="text-lg font-serif font-bold">StampCoin</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                The world's first specialized NFT marketplace for digital stamp collecting.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/investors" className="hover:text-primary transition-colors">For Investors</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 StampCoin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
