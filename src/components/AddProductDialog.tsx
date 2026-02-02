import { useState } from 'react';
import { Product, ProductStatus } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Package } from 'lucide-react';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
}

export function AddProductDialog({ open, onOpenChange, onAdd }: AddProductDialogProps) {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState<'food' | 'seed'>('food');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [licenseDate, setLicenseDate] = useState('');
  const [certificationNumber, setCertificationNumber] = useState('');
  const [status, setStatus] = useState<ProductStatus>('pending');
  const [trustScore, setTrustScore] = useState(50);

  const resetForm = () => {
    setName('');
    setManufacturer('');
    setCategory('food');
    setLicenseNumber('');
    setBatchNumber('');
    setLicenseDate('');
    setCertificationNumber('');
    setStatus('pending');
    setTrustScore(50);
  };

  const handleSubmit = () => {
    if (!name || !manufacturer || !batchNumber || !licenseDate) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      manufacturer,
      category,
      licenseNumber: category === 'food' ? licenseNumber : '',
      batchNumber,
      licenseDate,
      certificationNumber: category === 'seed' ? certificationNumber : undefined,
      trustScore,
      status,
      isAdminVerified: true,
      verificationSource: 'admin',
      verifiedAt: new Date().toISOString().split('T')[0],
      reportCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAdd(newProduct);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Add a new product to the verification database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Organic Basmati Rice"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer *</Label>
            <Input
              id="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g., Organic Foods India Pvt Ltd"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as 'food' | 'seed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food Product</SelectItem>
                  <SelectItem value="seed">Agricultural Seed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genuine">Genuine</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                  <SelectItem value="fake">Fake</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {category === 'food' && (
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">FSSAI License Number</Label>
              <Input
                id="licenseNumber"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g., 10020021000123"
              />
            </div>
          )}

          {category === 'seed' && (
            <div className="space-y-2">
              <Label htmlFor="certificationNumber">Seed Certification Number</Label>
              <Input
                id="certificationNumber"
                value={certificationNumber}
                onChange={(e) => setCertificationNumber(e.target.value)}
                placeholder="e.g., SEED/2024/KA/001234"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number *</Label>
              <Input
                id="batchNumber"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g., BATCH2024A001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseDate">License Date *</Label>
              <Input
                id="licenseDate"
                type="date"
                value={licenseDate}
                onChange={(e) => setLicenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Trust Score</Label>
              <span className="text-sm font-bold">{trustScore}</span>
            </div>
            <Slider
              value={[trustScore]}
              onValueChange={(v) => setTrustScore(v[0])}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 - High Risk</span>
              <span>100 - Fully Trusted</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name || !manufacturer || !batchNumber || !licenseDate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
