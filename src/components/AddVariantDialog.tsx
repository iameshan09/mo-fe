import { useState } from 'react';
import { addVariant } from '@/api/products';
import type { ApiError } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

interface Props {
  productId: string;
  onAdded: () => void;
}

export default function AddVariantDialog({ productId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attrs, setAttrs] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');

  const reset = () => {
    setAttrs([{ key: '', value: '' }]);
    setPrice('');
    setStock('0');
  };

  const handleSubmit = async () => {
    const validAttrs = attrs.filter((a) => a.key.trim() && a.value.trim());
    if (validAttrs.length === 0) {
      toast.error('Add at least one attribute');
      return;
    }

    setLoading(true);
    try {
      await addVariant(productId, {
        attributes: Object.fromEntries(validAttrs.map((a) => [a.key.trim(), a.value.trim()])),
        price: price ? parseFloat(price) : undefined,
        stock: parseInt(stock, 10) || 0,
      });
      toast.success('Variant added');
      reset();
      setOpen(false);
      onAdded();
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message ?? 'Failed to add variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        + Variant
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Variant</DialogTitle>
          <DialogDescription>Add a new variant combination to this product</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Attributes</Label>
            {attrs.map((attr, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Key (e.g. color)"
                  value={attr.key}
                  onChange={(e) => {
                    const updated = [...attrs];
                    updated[i] = { ...updated[i], key: e.target.value };
                    setAttrs(updated);
                  }}
                />
                <Input
                  placeholder="Value (e.g. red)"
                  value={attr.value}
                  onChange={(e) => {
                    const updated = [...attrs];
                    updated[i] = { ...updated[i], value: e.target.value };
                    setAttrs(updated);
                  }}
                />
                {attrs.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => setAttrs(attrs.filter((_, j) => j !== i))}>
                    &times;
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setAttrs([...attrs, { key: '', value: '' }])}>
              + Attribute
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Price override</Label>
              <Input type="number" step="0.01" min="0" placeholder="Use base" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Stock</Label>
              <Input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Variant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
