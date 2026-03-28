import { useState } from 'react';
import type { Product, Variant } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Props {
  product: Product;
  variant: Variant;
  open: boolean;
  onClose: () => void;
}

export default function QuickBuy({ product, variant, open, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  const price = variant.price ?? product.basePrice;
  const total = price * quantity;
  const maxQty = variant.stock;

  const handleConfirm = () => {
    if (quantity < 1 || quantity > maxQty) {
      toast.error(`Quantity must be between 1 and ${maxQty}`);
      return;
    }
    setConfirmed(true);
    toast.success(`Order placed! ${quantity}x ${product.name} ($${total.toFixed(2)})`);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Buy</DialogTitle>
          <DialogDescription>Review and confirm your purchase</DialogDescription>
        </DialogHeader>

        {!confirmed ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {Object.entries(variant.attributes).map(([key, val]) => (
                  <Badge key={key} variant="secondary" className="text-xs capitalize">
                    {key}: {val}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (max {maxQty})</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQty))}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Unit price</span>
              <span>${price.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleConfirm}>Confirm Purchase</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="text-4xl">&#10003;</div>
            <h3 className="text-lg font-semibold">Order Confirmed!</h3>
            <p className="text-muted-foreground text-sm">
              {quantity}x {product.name} &mdash; ${total.toFixed(2)}
            </p>
            <Button onClick={onClose} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
