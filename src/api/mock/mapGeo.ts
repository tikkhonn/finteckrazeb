import routes from './mapRoutes.json';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

interface PlaceGeo {
  coordinate: LatLng;
  distanceM: number;
  route: LatLng[];
}

const PLACES: Record<string, PlaceGeo> = routes.places;

/** Демо-позиция покупателя: Невский пр., 60 (пешеходные маршруты посчитаны по OSM). */
export const USER_LOCATION: LatLng = routes.you;

function place(id: string): PlaceGeo {
  const geo = PLACES[id];
  if (!geo) {
    throw new Error(`Нет координат для ${id}`);
  }
  return geo;
}

export function placeCoordinate(id: string): LatLng {
  return place(id).coordinate;
}

export function walkingMeters(id: string): number {
  return place(id).distanceM;
}

export function walkingRoute(id: string): LatLng[] {
  return place(id).route;
}

export function regionFor(points: LatLng[], padding = 1.5): MapRegion {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * padding, 0.004),
    longitudeDelta: Math.max((maxLng - minLng) * padding, 0.008),
  };
}
