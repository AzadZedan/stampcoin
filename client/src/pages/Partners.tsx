import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Award, TrendingUp, Users, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Partners() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [formData, setFormData] = useState({
    companyName: "",
    companyNameAr: "",
    description: "",
    descriptionAr: "",
    website: "",
    tier: "bronze" as const,
    totalInvestment: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });

  const { data: partners } = trpc.partners.list.useQuery({
    status: "active",
    tier: selectedTier !== "all" ? selectedTier : undefined,
  });

  const { data: myPartner } = trpc.partners.getMyPartner.useQuery(undefined, {
    enabled: !!user,
  });

  const createPartner = trpc.partners.create.useMutation({
    onSuccess: () => {
      toast.success("Partnership application submitted successfully!");
      setFormData({
        companyName: "",
        companyNameAr: "",
        description: "",
        descriptionAr: "",
        website: "",
        tier: "bronze",
        totalInvestment: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit partnership application");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.totalInvestment) {
      toast.error("Please fill in all required fields");
      return;
    }
    await createPartner.mutateAsync(formData);
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: "from-amber-600 to-amber-700",
      silver: "from-slate-400 to-slate-500",
      gold: "from-yellow-400 to-yellow-600",
      platinum: "from-blue-300 to-blue-500",
      diamond: "from-purple-400 to-purple-600",
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getTierBenefits = (tier: string) => {
    const benefits = {
      bronze: ["$1,000+ investment", "5% commission on referrals", "Basic branding", "Email support"],
      silver: ["$5,000+ investment", "10% commission on referrals", "Premium branding", "Priority support"],
      gold: ["$10,000+ investment", "15% commission on referrals", "Featured placement", "Dedicated account manager"],
      platinum: ["$25,000+ investment", "20% commission on referrals", "Premium features", "24/7 support"],
      diamond: ["$50,000+ investment", "25% commission on referrals", "All features", "Executive support"],
    };
    return benefits[tier as keyof typeof benefits] || benefits.bronze;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
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
              <Link href="/gallery" className="text-foreground/80 hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link href="/partners" className="text-primary font-medium">
                Partners
              </Link>
              <Link href="/investors" className="text-foreground/80 hover:text-primary transition-colors">
                For Investors
              </Link>
              <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors">
                About
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
            Partner With StampCoin
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join our growing community of partners and supporters. Invest in the future of digital stamp collecting and earn exclusive benefits and commissions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="default">Become a Partner</Button>
            <Button size="lg" variant="outline">Learn More</Button>
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-serif font-bold text-center mb-12 text-gold-foil">Partnership Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {["bronze", "silver", "gold", "platinum", "diamond"].map((tier) => (
              <Card key={tier} className={`card-premium bg-gradient-to-br ${getTierColor(tier)} text-white overflow-hidden`}>
                <CardHeader>
                  <CardTitle className="capitalize text-xl">{tier} Partner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {getTierBenefits(tier).map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Award className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-white text-foreground hover:bg-gray-100"
                    onClick={() => {
                      setFormData({ ...formData, tier: tier as any });
                      document.getElementById("partnership-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      {partners && partners.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-serif font-bold text-center mb-4 text-gold-foil">Our Partners</h3>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Meet the companies and organizations supporting the StampCoin ecosystem
            </p>

            {/* Tier Filter */}
            <div className="flex justify-center mb-8">
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner: any) => (
                <Card key={partner.id} className="card-premium stamp-card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="capitalize">{partner.companyName}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(partner.tier)} text-white`}>
                            {partner.tier.toUpperCase()}
                          </span>
                          {getStatusIcon(partner.status)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {partner.description && (
                      <p className="text-sm text-muted-foreground">{partner.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span>Investment: ${parseFloat(partner.totalInvestment).toLocaleString()}</span>
                      </div>
                      {partner.website && (
                        <div className="flex items-center gap-2">
                          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {partner.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partnership Application Form */}
      <section id="partnership-form" className="py-16 bg-background/50">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-serif font-bold text-center mb-12 text-gold-foil">Apply for Partnership</h3>
          
          {myPartner ? (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>Your Partnership Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <p className="text-foreground">{myPartner.companyName}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(myPartner.status)}
                    <span className="capitalize font-medium">{myPartner.status}</span>
                  </div>
                </div>
                <div>
                  <Label>Tier</Label>
                  <p className="text-foreground capitalize">{myPartner.tier}</p>
                </div>
                <div>
                  <Label>Total Investment</Label>
                  <p className="text-foreground">${parseFloat(myPartner.totalInvestment).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-premium">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyNameAr">Company Name (Arabic)</Label>
                      <Input
                        id="companyNameAr"
                        value={formData.companyNameAr}
                        onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                        placeholder="اسم الشركة"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us about your company"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      placeholder="اخبرنا عن شركتك"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tier">Partnership Tier *</Label>
                      <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value as any })}>
                        <SelectTrigger id="tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze ($1,000+)</SelectItem>
                          <SelectItem value="silver">Silver ($5,000+)</SelectItem>
                          <SelectItem value="gold">Gold ($10,000+)</SelectItem>
                          <SelectItem value="platinum">Platinum ($25,000+)</SelectItem>
                          <SelectItem value="diamond">Diamond ($50,000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="totalInvestment">Total Investment Amount (USD) *</Label>
                    <Input
                      id="totalInvestment"
                      type="number"
                      value={formData.totalInvestment}
                      onChange={(e) => setFormData({ ...formData, totalInvestment: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createPartner.isPending}>
                    {createPartner.isPending ? "Submitting..." : "Submit Partnership Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-serif font-bold text-center mb-12 text-gold-foil">Why Partner With StampCoin?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-premium">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Growing Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access a rapidly growing market of digital stamp collectors with increasing demand for NFT-based collectibles.
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join a vibrant community of collectors, investors, and enthusiasts dedicated to preserving stamp culture.
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <DollarSign className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Revenue Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn commissions on referrals and exclusive benefits based on your partnership tier and investment level.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
