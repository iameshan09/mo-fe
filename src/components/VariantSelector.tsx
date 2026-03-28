import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Variant } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  variants: Variant[];
  selected: Variant | null;
  onSelect: (variant: Variant) => void;
}

export default function VariantSelector({ variants, selected, onSelect }: Props) {
  // Deduplicated attribute keys across all variants
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => Object.keys(v.attributes).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [variants]);

  // Deduplicated values per attribute key
  const attributeValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const key of attributeKeys) {
      const values = new Set<string>();
      variants.forEach((v) => {
        const val = v.attributes[key];
        if (val) values.add(val);
      });
      result[key] = Array.from(values);
    }
    return result;
  }, [variants, attributeKeys]);

  // Internal selected attributes state
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() =>
    selected?.attributes ?? {},
  );

  // Sync internal state when parent's selected variant changes externally
  useEffect(() => {
    if (selected) {
      setSelectedAttrs(selected.attributes);
    }
  }, [selected]);

  // Check if a value for a given key is available, considering all OTHER selected attributes
  const isValueAvailable = useCallback(
    (key: string, value: string, currentSelection: Record<string, string>): boolean => {
      return variants.some((v) => {
        if (v.attributes[key] !== value) return false;
        if (v.stock <= 0 || !v.isActive) return false;
        // Check against all other selected attributes (not the one being tested)
        return Object.entries(currentSelection).every(
          ([k, val]) => k === key || v.attributes[k] === val,
        );
      });
    },
    [variants],
  );

  // Find a matching in-stock variant for a given set of attributes
  const findMatchingVariant = useCallback(
    (attrs: Record<string, string>): Variant | null => {
      return (
        variants.find(
          (v) =>
            Object.entries(attrs).every(([k, val]) => v.attributes[k] === val) &&
            v.stock > 0 &&
            v.isActive,
        ) ?? null
      );
    },
    [variants],
  );

  // Cascade-validate: auto-deselect attributes that became unavailable after a change
  const validateAndResolve = useCallback(
    (nextAttrs: Record<string, string>) => {
      const validated = { ...nextAttrs };

      // Iteratively remove attributes whose selected value is no longer available
      let changed = true;
      while (changed) {
        changed = false;
        for (const key of attributeKeys) {
          if (validated[key] && !isValueAvailable(key, validated[key], validated)) {
            delete validated[key];
            changed = true;
          }
        }
      }

      setSelectedAttrs(validated);

      // Try to find an exact matching variant with all validated attributes
      const match = findMatchingVariant(validated);
      if (match) {
        onSelect(match);
        return;
      }

      // If partial selection, find the best available variant that matches selected attrs
      const fallback = variants.find(
        (v) =>
          Object.entries(validated).every(([k, val]) => v.attributes[k] === val) &&
          v.stock > 0 &&
          v.isActive,
      );
      if (fallback) {
        onSelect(fallback);
      }
    },
    [attributeKeys, isValueAvailable, findMatchingVariant, variants, onSelect],
  );

  const handleSelect = (key: string, value: string) => {
    const nextAttrs = { ...selectedAttrs, [key]: value };
    validateAndResolve(nextAttrs);
  };

  return (
    <div className="space-y-4">
      {attributeKeys.map((key) => (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">{key}</label>
          <div className="flex flex-wrap gap-2">
            {attributeValues[key].map((value) => {
              const isSelected = selectedAttrs[key] === value;
              const available = isValueAvailable(key, value, selectedAttrs);

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  onClick={() => handleSelect(key, value)}
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
