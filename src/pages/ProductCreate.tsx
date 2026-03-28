import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createProduct } from '@/api/products';
import type { CreateVariantPayload, ApiError } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

interface ProductFormData {
  name: string;
  description: string;
  basePrice: string;
}

interface VariantFormData {
  attributes: { key: string; value: string }[];
  price: string;
  stock: string;
}

function generateCombinationKey(attributes: { key: string; value: string }[]): string {
  return attributes
    .filter((a) => a.key.trim() && a.value.trim())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((a) => a.value.trim().toLowerCase())
    .join('-');
}

export default function ProductCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [variants, setVariants] = useState<(VariantFormData & { combinationKey: string })[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: { name: '', description: '', basePrice: '' },
  });

  // Variant builder state
  const [variantAttrs, setVariantAttrs] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);
  const [variantPrice, setVariantPrice] = useState('');
  const [variantStock, setVariantStock] = useState('0');

  const addAttribute = () => {
    setVariantAttrs([...variantAttrs, { key: '', value: '' }]);
  };

  const updateAttribute = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...variantAttrs];
    updated[index] = { ...updated[index], [field]: val };
    setVariantAttrs(updated);
  };

  const removeAttribute = (index: number) => {
    setVariantAttrs(variantAttrs.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    const validAttrs = variantAttrs.filter((a) => a.key.trim() && a.value.trim());
    if (validAttrs.length === 0) {
      toast.error('Add at least one attribute');
      return;
    }

    const combinationKey = generateCombinationKey(validAttrs);

    if (variants.some((v) => v.combinationKey === combinationKey)) {
      toast.error('Duplicate variant combination: ' + combinationKey);
      return;
    }

    setVariants([
      ...variants,
      {
        attributes: validAttrs.map((a) => ({ key: a.key.trim(), value: a.value.trim() })),
        price: variantPrice,
        stock: variantStock || '0',
        combinationKey,
      },
    ]);

    setVariantAttrs([{ key: '', value: '' }]);
    setVariantPrice('');
    setVariantStock('0');
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    const basePrice = parseFloat(data.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      toast.error('Invalid base price');
      return;
    }

    setSubmitting(true);
    try {
      const variantPayloads: CreateVariantPayload[] = variants.map((v) => ({
        attributes: Object.fromEntries(v.attributes.map((a) => [a.key, a.value])),
        price: v.price ? parseFloat(v.price) : undefined,
        stock: parseInt(v.stock, 10) || 0,
      }));

      const product = await createProduct({
        name: data.name,
        description: data.description || undefined,
        basePrice,
        variants: variantPayloads.length > 0 ? variantPayloads : undefined,
      });

      toast.success('Product created!');
      navigate(`/products/${product.id}`);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message ?? 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
        <p className="text-muted-foreground">Add a new product with optional variants</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Product name"
                {...register('name', { required: 'Name is required', maxLength: { value: 255, message: 'Max 255 characters' } })}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                {...register('description')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('basePrice', { required: 'Price is required' })}
              />
              {errors.basePrice && <p className="text-sm text-destructive">{errors.basePrice.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Variant builder */}
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing variants */}
            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1.5">
                        {v.attributes.map((a) => (
                          <Badge key={a.key} variant="secondary" className="text-xs">
                            {a.key}: {a.value}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Key: <code>{v.combinationKey}</code>
                        {v.price && ` | Price: $${parseFloat(v.price).toFixed(2)}`}
                        {` | Stock: ${v.stock}`}
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeVariant(i)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Separator />
              </div>
            )}

            {/* New variant form */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add a variant</Label>
              {variantAttrs.map((attr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Attribute (e.g. color)"
                    value={attr.key}
                    onChange={(e) => updateAttribute(i, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g. red)"
                    value={attr.value}
                    onChange={(e) => updateAttribute(i, 'value', e.target.value)}
                    className="flex-1"
                  />
                  {variantAttrs.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAttribute(i)}>
                      &times;
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                + Attribute
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Price override</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Use base price"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={variantStock}
                    onChange={(e) => setVariantStock(e.target.value)}
                  />
                </div>
              </div>

              <Button type="button" variant="secondary" onClick={addVariant}>
                Add Variant
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
