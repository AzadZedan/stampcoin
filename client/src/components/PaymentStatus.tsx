import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface PaymentStatusProps {
  sessionId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentStatus({ sessionId, onSuccess, onError }: PaymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'loading'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  const validateCheckout = trpc.payments.validateCheckout.useQuery(
    { sessionId: sessionId || '' },
    {
      enabled: !!sessionId,
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: true,
    }
  );

  useEffect(() => {
    if (!validateCheckout.data) return;

    const paymentStatus = validateCheckout.data.paymentStatus;

    if (paymentStatus === 'paid') {
      setStatus('success');
      setMessage('Payment completed successfully!');
      toast.success('Payment Successful', {
        description: 'Your purchase has been confirmed.',
      });
      onSuccess?.();
    } else if (paymentStatus === 'unpaid') {
      setStatus('pending');
      setMessage('Payment is being processed...');
    } else if (paymentStatus === 'no_payment_required') {
      setStatus('success');
      setMessage('Order confirmed!');
      onSuccess?.();
    }
  }, [validateCheckout.data, onSuccess]);

  useEffect(() => {
    if (validateCheckout.isError) {
      setStatus('failed');
      setMessage('Failed to verify payment status');
      onError?.('Failed to verify payment status');
    }
  }, [validateCheckout.isError, onError]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await validateCheckout.refetch();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-8 h-8 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span>
            {status === 'success' && 'Payment Successful'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'pending' && 'Processing Payment'}
            {status === 'loading' && 'Verifying Payment'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>

        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your purchase has been completed. You can now access your stamp in your dashboard.
            </AlertDescription>
          </Alert>
        )}

        {status === 'failed' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an issue processing your payment. Please try again or contact support.
            </AlertDescription>
          </Alert>
        )}

        {status === 'pending' && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your payment is being processed. This usually takes a few seconds. Please don't close this page.
            </AlertDescription>
          </Alert>
        )}

        {status === 'failed' && (
          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="flex-1"
            >
              {isRetrying && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Retry
            </Button>
            <Button variant="outline" className="flex-1">
              Contact Support
            </Button>
          </div>
        )}

        {status === 'success' && (
          <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        )}

        {sessionId && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Session ID: <code className="bg-muted px-2 py-1 rounded">{sessionId}</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
