import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Send, Shield, Upload, CheckCircle } from 'lucide-react';

const ReportPage = () => {
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim() || !brandName.trim() || !reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setProductName('');
    setBrandName('');
    setReason('');
    setEvidence('');
    setPurchaseLocation('');
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="pt-12 pb-8">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                  Report Submitted Successfully
                </h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for helping us maintain food safety. 
                  Our admin team will review your report within 24-48 hours.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Reference ID: <span className="font-mono font-medium">REP-{Date.now().toString(36).toUpperCase()}</span>
                </p>
                <Button onClick={handleReset}>Submit Another Report</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-danger/10 text-danger mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Report Fake Product</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Report a Suspicious Food Product
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Help protect other consumers by reporting fake or suspicious food products. 
              Our admin team will investigate and take appropriate action.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Report Details
              </CardTitle>
              <CardDescription>
                Please provide as much detail as possible to help us investigate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Organic Basmati Rice"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                      id="brandName"
                      placeholder="e.g., Natural Foods Co"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseLocation">Where did you purchase?</Label>
                  <Input
                    id="purchaseLocation"
                    placeholder="e.g., Local market, Online store"
                    value={purchaseLocation}
                    onChange={(e) => setPurchaseLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Reporting *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe why you believe this food product is fake or suspicious..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidence">Additional Evidence</Label>
                  <Textarea
                    id="evidence"
                    placeholder="Any additional details, observations, or evidence..."
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Upload className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-medium">Attach Images (Coming Soon)</p>
                      <p className="text-xs">You'll be able to upload product images as evidence</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting Report..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReportPage;
