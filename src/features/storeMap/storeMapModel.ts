import { MAP_PINS, type MapPin, type StoreFeature } from '@/api/mock/stores';

export interface StoreMapProps {
  compact?: boolean;
  features?: StoreFeature[];
  selectedId?: string | null;
  onPinPress?: (pin: MapPin) => void;
}

export function visiblePins(features?: StoreFeature[]): MapPin[] {
  return features ? MAP_PINS.filter((pin) => features.includes(pin.feature)) : MAP_PINS;
}

/** Куда вести маршрут: выбранный пин, а в превью — ближайший магазин. */
export function routeTarget(pins: MapPin[], selectedId: string | null | undefined, compact: boolean) {
  const selected = pins.find((pin) => pin.id === selectedId);
  if (selected || !compact) {
    return selected;
  }
  return pins.reduce<MapPin | undefined>(
    (best, pin) => (!best || pin.distanceM < best.distanceM ? pin : best),
    undefined,
  );
}

export function shortName(name: string) {
  return name.replace(/^Магазин\s+/, '').replace(/[«»]/g, '');
}
