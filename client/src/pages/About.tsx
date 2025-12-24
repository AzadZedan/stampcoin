import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Shield, Globe, TrendingUp, Users, Award, Target } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-vintage-texture">
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
              <Link href="/about" className="text-primary font-medium">
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
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 text-gold-foil text-shadow-luxury">
            About StampCoin
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing stamp collecting through blockchain technology and NFTs
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-serif font-bold text-foreground mb-6 text-center">
              Our Vision
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              StampCoin is the world's first specialized NFT marketplace designed exclusively for stamp collectors. 
              We're bridging the traditional $5+ billion stamp collecting market with cutting-edge blockchain technology 
              to create a secure, transparent, and accessible platform for collectors worldwide.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our mission is to preserve cultural heritage while making stamp collecting more accessible to the next 
              generation. By digitizing rare and valuable stamps as NFTs, we ensure their preservation for future 
              generations while creating new opportunities for collectors and investors.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-serif font-bold text-foreground mb-12 text-center">
            Our Core Values
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-4">Authenticity</h4>
                <p className="text-muted-foreground">
                  Every stamp is verified and authenticated by expert philatelists, ensuring the integrity of your collection.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-4">Accessibility</h4>
                <p className="text-muted-foreground">
                  Making rare stamps accessible to collectors worldwide, breaking down geographical and financial barriers.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-4">Preservation</h4>
                <p className="text-muted-foreground">
                  Preserving cultural and historical heritage through digital archiving and blockchain technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-serif font-bold text-foreground mb-6 text-center">
              Our Technology
            </h3>
            <div className="space-y-6">
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                <h4 className="text-xl font-serif font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Blockchain Security
                </h4>
                <p className="text-muted-foreground">
                  Built on secure blockchain infrastructure, every transaction and ownership record is immutable 
                  and transparent, providing collectors with complete peace of mind.
                </p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                <h4 className="text-xl font-serif font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  NFT Authentication
                </h4>
                <p className="text-muted-foreground">
                  Each digital stamp is minted as a unique NFT with detailed provenance, authentication certificates, 
                  and high-resolution imagery verified by philatelic experts.
                </p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                <h4 className="text-xl font-serif font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Global Marketplace
                </h4>
                <p className="text-muted-foreground">
                  Our platform connects collectors from 150+ countries, facilitating secure transactions with 
                  multiple payment options and instant settlement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-primary-foreground">
            <div>
              <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-serif font-bold mb-2">70M+</div>
              <div className="text-primary-foreground/80">Global Collectors</div>
            </div>
            <div>
              <Award className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-serif font-bold mb-2">10K+</div>
              <div className="text-primary-foreground/80">Authenticated Stamps</div>
            </div>
            <div>
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-serif font-bold mb-2">150+</div>
              <div className="text-primary-foreground/80">Countries Served</div>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-serif font-bold mb-2">$5B+</div>
              <div className="text-primary-foreground/80">Market Opportunity</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-4xl font-serif font-bold text-foreground mb-6">
              Join the Revolution
            </h3>
            <p className="text-xl text-muted-foreground mb-8">
              Be part of the future of stamp collecting. Start your digital collection today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
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
