import { store } from '@grafana/data';
import { type ExploreGraphStyle, EXPLORE_GRAPH_STYLES } from 'app/types/explore';

import { MIN_MOVING_AVERAGE_WINDOW } from './addMovingAverageOverlay';

const GRAPH_STYLE_KEY = 'grafana.explore.style.graph';
const MOVING_AVERAGE_ENABLED_KEY = 'grafana.explore.graph.movingAverage';
const MOVING_AVERAGE_WINDOW_KEY = 'grafana.explore.graph.movingAverageWindow';

export const DEFAULT_MOVING_AVERAGE_WINDOW = 10;

export const loadGraphStyle = (): ExploreGraphStyle => {
  return toGraphStyle(store.get(GRAPH_STYLE_KEY));
};

export const loadMovingAverageEnabled = (): boolean => {
  return store.getBool(MOVING_AVERAGE_ENABLED_KEY, false);
};

export const storeMovingAverageEnabled = (enabled: boolean): void => {
  store.set(MOVING_AVERAGE_ENABLED_KEY, String(enabled));
};

export const loadMovingAverageWindow = (): number => {
  const parsed = Number.parseInt(String(store.get(MOVING_AVERAGE_WINDOW_KEY) ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < MIN_MOVING_AVERAGE_WINDOW) {
    return DEFAULT_MOVING_AVERAGE_WINDOW;
  }
  return parsed;
};

export const storeMovingAverageWindow = (windowSize: number): void => {
  store.set(MOVING_AVERAGE_WINDOW_KEY, String(windowSize));
};

const DEFAULT_GRAPH_STYLE: ExploreGraphStyle = 'lines';
// we use this function to take any kind of data we loaded
// from an external source (URL, localStorage, whatever),
// and extract the graph-style from it, or return the default
// graph-style if we are not able to do that.
// it is important that this function is able to take any form of data,
// (be it objects, or arrays, or booleans or whatever),
// and produce a best-effort graphStyle.
// note that typescript makes sure we make no mistake in this function.
// we do not rely on ` as ` or ` any `.
const toGraphStyle = (data: unknown): ExploreGraphStyle => {
  const found = EXPLORE_GRAPH_STYLES.find((v) => v === data);
  return found ?? DEFAULT_GRAPH_STYLE;
};
