import { store } from '@grafana/data';

import {
  DEFAULT_MOVING_AVERAGE_WINDOW,
  loadMovingAverageEnabled,
  loadMovingAverageWindow,
  storeMovingAverageEnabled,
  storeMovingAverageWindow,
} from './utils';

describe('explore graph moving average persistence', () => {
  beforeEach(() => {
    store.delete('grafana.explore.graph.movingAverage');
    store.delete('grafana.explore.graph.movingAverageWindow');
  });

  it('defaults to disabled with a 10-point window', () => {
    expect(loadMovingAverageEnabled()).toBe(false);
    expect(loadMovingAverageWindow()).toBe(DEFAULT_MOVING_AVERAGE_WINDOW);
  });

  it('round-trips enabled state and a valid window size', () => {
    storeMovingAverageEnabled(true);
    storeMovingAverageWindow(24);

    expect(loadMovingAverageEnabled()).toBe(true);
    expect(loadMovingAverageWindow()).toBe(24);
  });

  it('falls back to the default window when stored value is below the minimum', () => {
    storeMovingAverageWindow(1);
    expect(loadMovingAverageWindow()).toBe(DEFAULT_MOVING_AVERAGE_WINDOW);
  });
});
