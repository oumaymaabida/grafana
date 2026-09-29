import { store } from '@grafana/data';

import { loadMovingAverageOverlay, storeMovingAverageOverlay } from './utils';

const MOVING_AVERAGE_KEY = 'grafana.explore.graph.movingAverage';

describe('moving average overlay preference', () => {
  afterEach(() => {
    store.delete(MOVING_AVERAGE_KEY);
  });

  it('defaults to off when nothing is stored', () => {
    expect(loadMovingAverageOverlay()).toBe(false);
  });

  it('returns the persisted on/off value', () => {
    storeMovingAverageOverlay(true);
    expect(loadMovingAverageOverlay()).toBe(true);

    storeMovingAverageOverlay(false);
    expect(loadMovingAverageOverlay()).toBe(false);
  });
});
