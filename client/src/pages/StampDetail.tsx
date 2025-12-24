import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, ShoppingCart, ArrowLeft, Shield, Calendar, MapPin, Star } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function StampDetail() {
  const params = useParams();
  const stampId = params.id ? parseInt(params.id) : 0;

  const { user } = useAuth();
  const { data: stamp, isLoading } = trpc.stamps.getById.useQuery({ id: stampId });
  const { data: reviews } = trpc.reviews.getStampReviews.useQuery({ stampId });
  const { data: rating } = trpc.reviews.getStampRating.useQuery({ stampId });
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setReviewComment("");
      setReviewRating(5);
    },
    onError: () => {
      toast.error("Failed to submit review");
    },
  });
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }
    
    await createReview.mutateAsync({
      stampId,
      rating: reviewRating,
      comment: reviewComment || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vintage-texture flex items-center justify-center">
        <p className="text-muted-foreground">Loading stamp details...</p>
      </div>
    );
  }

  if (!stamp) {
    return (
      <div className="min-h-screen bg-vintage-texture flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-medium text-foreground mb-2">Stamp not found</p>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/marketplace">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      {/* Stamp Detail */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Image Section */}
            <div>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                  {stamp.imageUrl ? (
                    <img
                      src={stamp.imageUrl}
                      alt={stamp.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-32 h-32 text-primary/20" />
                  )}
                </div>
              </Card>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="font-semibold">{stamp.country || "N/A"}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="font-semibold">{stamp.year || "N/A"}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Rarity</p>
                    <p className="font-semibold capitalize">{stamp.rarity}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Details Section */}
            <div>
              <div className="mb-6">
                <Badge className="mb-4">{stamp.rarity}</Badge>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                  {stamp.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {stamp.description || "No description available"}
                </p>
              </div>

              {/* Price and Actions */}
              <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                      <p className="text-4xl font-bold text-primary">${stamp.price}</p>
                    </div>
                    {stamp.isAvailable && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                        Available
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 gap-2" size="lg">
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Heart className="w-5 h-5" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-serif font-semibold text-xl mb-4">Stamp Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">Category #{stamp.categoryId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-medium">{stamp.country || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Year</span>
                      <span className="font-medium">{stamp.year || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Rarity</span>
                      <span className="font-medium capitalize">{stamp.rarity}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">
                        {stamp.isAvailable ? "Available" : "Sold"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-8">Reviews & Ratings</h2>
            
            {/* Average Rating */}
            {rating && rating.count > 0 && (
              <Card className="mb-8 border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl font-bold text-primary">{rating.average.toFixed(1)}</div>
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 ${
                              star <= Math.round(rating.average)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on {rating.count} {rating.count === 1 ? "review" : "reviews"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Add Review Form */}
            {user && (
              <Card className="mb-8 border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif font-semibold mb-4">Write a Review</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this stamp..."
                      rows={4}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSubmitReview}
                    disabled={createReview.isPending}
                  >
                    {createReview.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id} className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg">{review.userName || "Anonymous"}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No reviews yet. Be the first to review this stamp!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
