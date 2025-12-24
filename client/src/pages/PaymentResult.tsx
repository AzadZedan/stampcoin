import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { PaymentStatus } from '@/components/PaymentStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Link } from 'wouter';

export default function PaymentResult() {
  const [location] = useLocation();
  const [sessionId, setSessionId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionIdParam = params.get('sessionId');
    const statusParam = params.get('payment');

    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
    if (statusParam) {
      setPaymentStatus(statusParam);
    }
  }, []);

  return (
    <div className="min-h-screen bg-stamps-luxury">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-primary">StampCoin</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-8 text-gold-foil">
            Payment Status
          </h1>

          {/* Payment Status Component */}
          <PaymentStatus
            sessionId={sessionId}
            onSuccess={() => {
              console.log('Payment successful');
            }}
            onError={(error) => {
              console.error('Payment error:', error);
            }}
          />

          {/* Additional Information */}
          <Card className="card-premium mt-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Payment Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment is being processed. You'll receive a confirmation email shortly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Access Your Stamp</h3>
                    <p className="text-sm text-muted-foreground">
                      Once confirmed, your stamp will be available in your dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Manage Your Collection</h3>
                    <p className="text-sm text-muted-foreground">
                      View your stamp details, add to favorites, and manage your collection.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <Link href="/marketplace">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>

          {/* Support Section */}
          <Card className="card-premium mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your purchase or need assistance, please don't hesitate to contact our support team.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
