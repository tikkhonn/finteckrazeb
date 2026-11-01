import { regionFor, USER_LOCATION, walkingMeters, walkingRoute } from '@/api/mock/mapGeo';
import { MAP_PINS, nearestStores, STORES } from '@/api/mock/stores';
import { routeTarget } from '@/features/storeMap/storeMapModel';

const near = (a: number, b: number) => Math.abs(a - b) < 0.0008;

describe('mapGeo', () => {
  it('у магазинов разное пешеходное расстояние, ближайший — «У дома»', () => {
    const meters = STORES.map((store) => store.distanceM);
    expect(new Set(meters).size).toBe(STORES.length);
    expect(nearestStores(1)[0].id).toBe('store_udoma');
  });

  it('маршрут идёт от покупателя до магазина по улицам', () => {
    for (const pin of MAP_PINS) {
      const route = walkingRoute(pin.id);
      expect(route.length).toBeGreaterThan(3);
      expect(near(route[0].latitude, USER_LOCATION.latitude)).toBe(true);
      expect(near(route[route.length - 1].longitude, pin.coordinate.longitude)).toBe(true);
    }
  });

  it('пины совпадают с расстоянием в каталоге', () => {
    for (const store of STORES) {
      const pin = MAP_PINS.find((item) => item.id === store.id);
      expect(pin?.distanceM).toBe(walkingMeters(store.id));
    }
  });

  it('стартовый кадр покрывает все точки', () => {
    const region = regionFor([USER_LOCATION, ...MAP_PINS.map((pin) => pin.coordinate)]);
    for (const pin of MAP_PINS) {
      expect(Math.abs(pin.coordinate.latitude - region.latitude)).toBeLessThan(region.latitudeDelta / 2);
      expect(Math.abs(pin.coordinate.longitude - region.longitude)).toBeLessThan(region.longitudeDelta / 2);
    }
  });

  it('превью ведёт к ближайшему, полная карта — только к выбранному', () => {
    expect(routeTarget(MAP_PINS, null, true)?.id).toBe('store_udoma');
    expect(routeTarget(MAP_PINS, null, false)).toBeUndefined();
    expect(routeTarget(MAP_PINS, 'store_fresh', false)?.id).toBe('store_fresh');
  });
});
