import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/api/products';
import type { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/store/auth';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Browse all available products</p>
        </div>
        {isAuthenticated && (
          <Link to="/products/new">
            <Button>+ New Product</Button>
          </Link>
        )}
      </div>

      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          {products.length === 0 ? 'No products yet.' : 'No products match your search.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const inStock = product.variants.some((v) => v.stock > 0 && v.isActive);
            const minPrice = product.variants.length > 0
              ? Math.min(...product.variants.map((v) => v.price ?? product.basePrice))
              : product.basePrice;

            return (
              <Link key={product.id} to={`/products/${product.id}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      <Badge variant={inStock ? 'default' : 'secondary'}>
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description || 'No description'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      ${minPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
