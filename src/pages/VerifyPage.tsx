import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ImageUpload } from '@/components/ImageUpload';
import { VerificationResults } from '@/components/VerificationResults';
import { ReportDialog } from '@/components/ReportDialog';
import { simulateOCR, verifyProduct } from '@/lib/verification';
import { ExtractedDetails, VerificationResult } from '@/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Camera, CheckCircle, Zap } from 'lucide-react';

const VerifyPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [extractedDetails, setExtractedDetails] = useState<ExtractedDetails | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleImageSelect = async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      // Simulate OCR extraction
      const details = await simulateOCR(file);
      setExtractedDetails(details);
      
      // Verify the extracted details
      const verificationResult = verifyProduct(details);
      setResult(verificationResult);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setExtractedDetails(null);
  };

  const steps = [
    {
      icon: Camera,
      title: 'Upload Image',
      description: 'Take a clear photo of the product label'
    },
    {
      icon: Zap,
      title: 'OCR Analysis',
      description: 'We extract text and details automatically'
    },
    {
      icon: CheckCircle,
      title: 'Verification',
      description: 'Get instant trust score and status'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Product Verification</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Verify Product Authenticity
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload an image of your product's back label to verify its authenticity. 
              Our system will analyze FSSAI licenses, certifications, and manufacturer details.
            </p>
          </div>

          {/* Steps */}
          {!result && (
            <div className="grid md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Section */}
          {!result && (
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>Upload Product Label</CardTitle>
                <CardDescription>
                  Upload a clear image of the product's back side showing FSSAI license, 
                  batch number, and other details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload 
                  onImageSelect={handleImageSelect} 
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {result && extractedDetails && (
            <VerificationResults
              result={result}
              details={extractedDetails}
              onReport={() => setShowReportDialog(true)}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
      
      <Footer />
      
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        productName={extractedDetails?.productName}
      />
    </div>
  );
};

export default VerifyPage;
