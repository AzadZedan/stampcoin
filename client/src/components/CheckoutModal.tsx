import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, CreditCard, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  stampId: number;
  productId: string;
  stampTitle: string;
  stampPrice: number;
}

export function CheckoutModal({
  isOpen,
  onClose,
  stampId,
  productId,
  stampTitle,
  stampPrice,
}: CheckoutModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const createCheckout = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      setError(error.message || 'Failed to create checkout session');
      toast.error('Payment Error', {
        description: error.message || 'Failed to create checkout session',
      });
    },
  });

  const getPaymentMethods = trpc.payments.getPaymentMethods.useQuery(undefined, {
    enabled: isOpen,
  });

  useEffect(() => {
    if (getPaymentMethods.data) {
      setPaymentMethods(getPaymentMethods.data);
    }
  }, [getPaymentMethods.data]);

  const handleCheckout = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!selectedPaymentMethod) {
        setError('Please select a payment method');
        return;
      }

      await createCheckout.mutateAsync({
        stampId,
        productId,
        paymentMethod: selectedPaymentMethod as any,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodIcon = (id: string) => {
    switch (id) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'paypal':
        return <span className="text-lg">🅿️</span>;
      case 'apple_pay':
        return <span className="text-lg">🍎</span>;
      case 'google_pay':
        return <span className="text-lg">🔵</span>;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Select a payment method to buy "{stampTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="bg-background/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item</span>
                  <span className="font-medium">{stampTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">${stampPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-primary">
                    ${stampPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Methods */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Select Payment Method</label>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    setError(null);
                  }}
                  disabled={!method.supported || isLoading}
                  className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${!method.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {selectedPaymentMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                    {selectedPaymentMethod !== method.id && (
                      <div className="w-5 h-5 rounded-full border-2 border-border" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method.id)}
                      <span className="font-semibold">{method.name}</span>
                      {!method.supported && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {method.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Security Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your payment is secure and encrypted. We never store your payment details.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isLoading || !selectedPaymentMethod}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Processing...' : `Pay $${stampPrice.toFixed(2)}`}
            </Button>
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
            By completing this purchase, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
