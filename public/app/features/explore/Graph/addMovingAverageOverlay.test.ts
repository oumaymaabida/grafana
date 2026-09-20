import { createTheme, FieldColorModeId, FieldType, toDataFrame } from '@grafana/data';
import { GraphDrawStyle, StackingMode } from '@grafana/schema';

import {
  addMovingAverageOverlay,
  EXPLORE_MOVING_AVERAGE_CUSTOM_KEY,
  trailingMovingAverage,
} from './addMovingAverageOverlay';

describe('trailingMovingAverage', () => {
  it('computes a trailing mean over a 3-point window', () => {
    expect(trailingMovingAverage([1, 2, 3, 4, 5], 3)).toEqual([1, 1.5, 2, 3, 4]);
  });

  it('skips null and non-finite values in the window', () => {
    expect(trailingMovingAverage([1, null, 3, Number.NaN, 5], 2)).toEqual([1, 1, 3, 3, 5]);
  });

  it('emits null when the window has no numeric samples', () => {
    expect(trailingMovingAverage([null, undefined, Number.POSITIVE_INFINITY], 2)).toEqual([null, null, null]);
  });
});

describe('addMovingAverageOverlay', () => {
  const theme = createTheme();

  it('appends a dashed overlay field that copies the source series color and unit', () => {
    const frames = [
      toDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [1, 2, 3, 4] },
          {
            name: 'cpu',
            type: FieldType.number,
            values: [1, 3, 5, 7],
            config: {
              unit: 'percent',
              color: { mode: FieldColorModeId.Fixed, fixedColor: '#ff0000' },
            },
          },
        ],
      }),
    ];

    const result = addMovingAverageOverlay(frames, 2, theme);
    expect(result[0].fields).toHaveLength(3);

    const overlay = result[0].fields[2];
    expect(overlay.values).toEqual([1, 2, 4, 6]);
    expect(overlay.config.unit).toBe('percent');
    expect(overlay.config.displayName).toBe('cpu (moving avg)');
    expect(overlay.config.color).toEqual({ mode: FieldColorModeId.Fixed, fixedColor: '#ff0000' });
    expect(overlay.config.custom).toMatchObject({
      [EXPLORE_MOVING_AVERAGE_CUSTOM_KEY]: true,
      drawStyle: GraphDrawStyle.Line,
      lineStyle: { fill: 'dash', dash: [8, 4] },
      fillOpacity: 0,
      stacking: { mode: StackingMode.None, group: 'A' },
    });
  });

  it('leaves frames unchanged when the window is below the minimum', () => {
    const frames = [
      toDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [1, 2] },
          { name: 'A', type: FieldType.number, values: [1, 2] },
        ],
      }),
    ];

    expect(addMovingAverageOverlay(frames, 1, theme)).toBe(frames);
  });
});
