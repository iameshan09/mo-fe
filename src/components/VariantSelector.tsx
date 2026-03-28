import type { Variant } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  variants: Variant[];
  attributeKeys: string[];
  selected: Variant | null;
  onSelect: (variant: Variant) => void;
}

export default function VariantSelector({ variants, attributeKeys, selected, onSelect }: Props) {
  // Group unique values per attribute key
  const attributeValues: Record<string, string[]> = {};
  for (const key of attributeKeys) {
    const values = new Set<string>();
    variants.forEach((v) => {
      const val = v.attributes[key];
      if (val) values.add(val);
    });
    attributeValues[key] = Array.from(values);
  }

  // Current selected attributes
  const selectedAttrs = selected?.attributes ?? {};

  const handleSelectAttribute = (key: string, value: string) => {
    // Find a variant matching the new selection + keep other selected attributes
    const targetAttrs = { ...selectedAttrs, [key]: value };
    const match = variants.find((v) =>
      Object.entries(targetAttrs).every(([k, val]) => v.attributes[k] === val),
    );
    if (match) {
      onSelect(match);
    } else {
      // Fall back to first variant with this attribute value
      const fallback = variants.find((v) => v.attributes[key] === value);
      if (fallback) onSelect(fallback);
    }
  };

  const isVariantAvailable = (key: string, value: string): boolean => {
    const testAttrs = { ...selectedAttrs, [key]: value };
    return variants.some(
      (v) =>
        Object.entries(testAttrs).every(([k, val]) => v.attributes[k] === val) &&
        v.stock > 0 &&
        v.isActive,
    );
  };

  return (
    <div className="space-y-4">
      {attributeKeys.map((key) => (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">{key}</label>
          <div className="flex flex-wrap gap-2">
            {attributeValues[key].map((value) => {
              const isSelected = selectedAttrs[key] === value;
              const available = isVariantAvailable(key, value);

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  onClick={() => handleSelectAttribute(key, value)}
                  className={cn(
                    'inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : available
                        ? 'border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer'
                        : 'border-input bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50',
                  )}
                >
                  <span className="capitalize">{value}</span>
                  {!available && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
                      sold out
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
