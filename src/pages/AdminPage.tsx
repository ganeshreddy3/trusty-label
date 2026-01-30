import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrustScore } from '@/components/TrustScore';
import { StatusBadge } from '@/components/StatusBadge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { mockProducts, mockReports, blacklistedBrands } from '@/data/mockDatabase';
import { Product, FakeReport, ProductStatus } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ShieldCheck,
  ShieldX,
  Package,
  FileWarning,
  Ban,
  Eye,
  Edit
} from 'lucide-react';

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [reports] = useState<FakeReport[]>(mockReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<ProductStatus>('pending');
  const [editTrustScore, setEditTrustScore] = useState(50);
  const { toast } = useToast();

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingProducts = products.filter(p => !p.isAdminVerified);
  const pendingReports = reports.filter(r => r.status === 'pending');

  const stats = [
    { 
      label: 'Total Products', 
      value: products.length, 
      icon: Package, 
      color: 'text-primary' 
    },
    { 
      label: 'Admin Verified', 
      value: products.filter(p => p.isAdminVerified).length, 
      icon: ShieldCheck, 
      color: 'text-verified' 
    },
    { 
      label: 'Pending Review', 
      value: pendingProducts.length, 
      icon: AlertTriangle, 
      color: 'text-warning' 
    },
    { 
      label: 'Blacklisted Brands', 
      value: blacklistedBrands.length, 
      icon: Ban, 
      color: 'text-danger' 
    },
  ];

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditStatus(product.status);
    setEditTrustScore(product.trustScore);
    setEditDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!selectedProduct) return;

    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id 
        ? { 
            ...p, 
            status: editStatus, 
            trustScore: editTrustScore,
            isAdminVerified: true,
            verificationSource: 'admin',
            verifiedAt: new Date().toISOString().split('T')[0]
          } 
        : p
    ));

    toast({
      title: "Product updated",
      description: `${selectedProduct.name} has been updated and marked as admin verified.`
    });

    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleQuickVerify = (productId: string, status: ProductStatus) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { 
            ...p, 
            status,
            isAdminVerified: true,
            verificationSource: 'admin',
            verifiedAt: new Date().toISOString().split('T')[0]
          } 
        : p
    ));

    toast({
      title: "Product verified",
      description: `Product has been marked as ${status}.`
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sidebar text-sidebar-foreground mb-4">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Admin Panel</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage products, verify authenticity, and review reports.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="products" className="gap-2">
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileWarning className="w-4 h-4" />
                Reports
                {pendingReports.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {pendingReports.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="blacklist" className="gap-2">
                <Ban className="w-4 h-4" />
                Blacklist
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Product Management</CardTitle>
                      <CardDescription>
                        Review, verify, and manage product authenticity status.
                      </CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Trust Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Verified</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{product.manufacturer}</TableCell>
                            <TableCell>
                              <TrustScore score={product.trustScore} size="sm" showLabel={false} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={product.status} size="sm" />
                            </TableCell>
                            <TableCell>
                              <VerifiedBadge isAdminVerified={product.isAdminVerified} size="sm" showLabel={false} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!product.isAdminVerified && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-success hover:text-success hover:bg-success/10"
                                      onClick={() => handleQuickVerify(product.id, 'genuine')}
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-danger hover:text-danger hover:bg-danger/10"
                                      onClick={() => handleQuickVerify(product.id, 'fake')}
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>User Reports</CardTitle>
                  <CardDescription>
                    Review and process reports submitted by users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reports.length > 0 ? (
                    <div className="space-y-4">
                      {reports.map((report) => {
                        const product = products.find(p => p.id === report.productId);
                        return (
                          <div 
                            key={report.id} 
                            className="p-4 rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={
                                    report.status === 'confirmed' ? 'default' :
                                    report.status === 'rejected' ? 'secondary' : 'outline'
                                  }>
                                    {report.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {report.createdAt}
                                  </span>
                                </div>
                                <p className="font-medium mb-1">{product?.name || 'Unknown Product'}</p>
                                <p className="text-sm text-muted-foreground mb-2">{report.reason}</p>
                                {report.evidence && (
                                  <p className="text-sm bg-muted p-2 rounded">
                                    <span className="font-medium">Evidence:</span> {report.evidence}
                                  </p>
                                )}
                              </div>
                              {report.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-success">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-danger">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileWarning className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No reports to review.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blacklist Tab */}
            <TabsContent value="blacklist">
              <Card>
                <CardHeader>
                  <CardTitle>Blacklisted Brands</CardTitle>
                  <CardDescription>
                    Brands that have been confirmed as selling fake products.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blacklistedBrands.map((brand, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-danger/5 border border-danger/20"
                      >
                        <div className="flex items-center gap-3">
                          <ShieldX className="w-5 h-5 text-danger" />
                          <span className="font-medium">{brand}</span>
                        </div>
                        <Badge variant="destructive">Blacklisted</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Verification</DialogTitle>
            <DialogDescription>
              Update the verification status and trust score for this product.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">{selectedProduct.manufacturer}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Status</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ProductStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genuine">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Genuine
                      </div>
                    </SelectItem>
                    <SelectItem value="suspicious">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Suspicious
                      </div>
                    </SelectItem>
                    <SelectItem value="fake">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-danger" />
                        Fake
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Trust Score</label>
                  <span className="text-sm font-bold">{editTrustScore}</span>
                </div>
                <Slider
                  value={[editTrustScore]}
                  onValueChange={(v) => setEditTrustScore(v[0])}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 - High Risk</span>
                  <span>100 - Fully Trusted</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Save & Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
