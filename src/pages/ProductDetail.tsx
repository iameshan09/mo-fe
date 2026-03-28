import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, deleteProduct, deleteVariant } from '@/api/products';
import type { Product, Variant } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/store/auth';
import { toast } from 'sonner';
import QuickBuy from '@/components/QuickBuy';
import VariantSelector from '@/components/VariantSelector';
import AddVariantDialog from '@/components/AddVariantDialog';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  const fetchProduct = () => {
    if (!id) return;
    getProduct(id)
      .then((p) => {
        setProduct(p);
        const inStockVariant = p.variants.find((v) => v.stock > 0 && v.isActive);
        setSelectedVariant(inStockVariant ?? p.variants[0] ?? null);
      })
      .catch(() => {
        toast.error('Product not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const attributeKeys = useMemo(() => {
    if (!product) return [];
    const keys = new Set<string>();
    product.variants.forEach((v) => Object.keys(v.attributes).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [product]);

  const handleDelete = async () => {
    if (!product || !confirm('Delete this product and all its variants?')) return;
    try {
      await deleteProduct(product.id);
      toast.success('Product deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!product || !confirm('Delete this variant?')) return;
    try {
      await deleteVariant(product.id, variantId);
      toast.success('Variant deleted');
      fetchProduct();
    } catch {
      toast.error('Failed to delete variant');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;
  }

  if (!product) return null;

  const effectivePrice = selectedVariant?.price ?? product.basePrice;
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 || !selectedVariant.isActive : true;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Product info */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              {isAuthenticated && (
                <div className="flex gap-2 shrink-0">
                  <AddVariantDialog productId={product.id} onAdded={fetchProduct} />
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
            {product.description && (
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            )}
          </div>

          <Separator />

          {/* Variant selector */}
          {product.variants.length > 0 ? (
            <VariantSelector
              variants={product.variants}
              attributeKeys={attributeKeys}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />
          ) : (
            <p className="text-muted-foreground">No variants available for this product.</p>
          )}

          {/* Variant table */}
          {isAuthenticated && product.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-4 font-medium">Combination</th>
                        <th className="pb-2 pr-4 font-medium">Price</th>
                        <th className="pb-2 pr-4 font-medium">Stock</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((v) => (
                        <tr key={v.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {v.combinationKey}
                            </code>
                          </td>
                          <td className="py-2 pr-4">${(v.price ?? product.basePrice).toFixed(2)}</td>
                          <td className="py-2 pr-4">{v.stock}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={v.stock > 0 && v.isActive ? 'default' : 'secondary'} className="text-xs">
                              {!v.isActive ? 'Inactive' : v.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive h-7 text-xs"
                              onClick={() => handleDeleteVariant(v.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Purchase panel */}
        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardContent className="space-y-4 p-6">
              <div className="text-3xl font-bold">${effectivePrice.toFixed(2)}</div>

              {selectedVariant && (
                <div className="space-y-1 text-sm">
                  {Object.entries(selectedVariant.attributes).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-medium capitalize">{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Stock</span>
                    <span className="font-medium">{selectedVariant.stock}</span>
                  </div>
                </div>
              )}

              <Separator />

              {isOutOfStock ? (
                <Button disabled className="w-full">Out of Stock</Button>
              ) : (
                <Button className="w-full" onClick={() => setShowQuickBuy(true)}>
                  Quick Buy
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showQuickBuy && selectedVariant && (
        <QuickBuy
          product={product}
          variant={selectedVariant}
          open={showQuickBuy}
          onClose={() => setShowQuickBuy(false)}
        />
      )}
    </div>
  );
}
