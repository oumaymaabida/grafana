import {
  createTheme,
  FieldColorModeId,
  FieldType,
  toDataFrame,
} from '@grafana/data';
import { GraphDrawStyle, StackingMode } from '@grafana/schema';

import {
  addMovingAverageOverlay,
  computeTrailingMovingAverage,
  MOVING_AVERAGE_OVERLAY_FLAG,
} from './movingAverageOverlay';

describe('computeTrailingMovingAverage', () => {
  it('returns the trailing mean of the last 3 values', () => {
    expect(computeTrailingMovingAverage([1, 2, 3, 4, 5], 3)).toEqual([1, 1.5, 2, 3, 4]);
  });

  it('ignores nulls in the window and writes null when the window is empty', () => {
    expect(computeTrailingMovingAverage([1, null, 3, undefined, 5], 2)).toEqual([1, 1, 3, 3, 5]);
    expect(computeTrailingMovingAverage([null, null], 2)).toEqual([null, null]);
  });

  it('throws when the window size is less than 1', () => {
    expect(() => computeTrailingMovingAverage([1, 2], 0)).toThrow('Moving average window size must be at least 1');
  });
});

describe('addMovingAverageOverlay', () => {
  it('appends a dashed MA field with the trailing average of each numeric series', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'time', type: FieldType.time, values: [1, 2, 3, 4, 5] },
        { name: 'cpu', type: FieldType.number, values: [1, 2, 3, 4, 5] },
      ],
    });

    const [result] = addMovingAverageOverlay([frame], { windowSize: 3 });

    expect(result.fields.map((field) => field.name)).toEqual(['time', 'cpu', 'MA cpu']);
    expect(result.fields[2].values).toEqual([1, 1.5, 2, 3, 4]);
    expect(result.fields[2].config.displayName).toBe('MA cpu');
    expect(result.fields[2].config.custom).toMatchObject({
      [MOVING_AVERAGE_OVERLAY_FLAG]: true,
      drawStyle: GraphDrawStyle.Line,
      lineStyle: { fill: 'dash', dash: [10, 10] },
      fillOpacity: 0,
      lineWidth: 2,
      stacking: { mode: StackingMode.None, group: 'A' },
    });
  });

  it('adds one overlay field per numeric series in a wide frame', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'time', type: FieldType.time, values: [1, 2, 3] },
        { name: 'a', type: FieldType.number, values: [2, 4, 6] },
        { name: 'b', type: FieldType.number, values: [10, 20, 30] },
      ],
    });

    const [result] = addMovingAverageOverlay([frame], { windowSize: 2 });

    expect(result.fields.map((field) => field.name)).toEqual(['time', 'a', 'b', 'MA a', 'MA b']);
    expect(result.fields[3].values).toEqual([2, 3, 5]);
    expect(result.fields[4].values).toEqual([10, 15, 25]);
  });

  it('does not add a second overlay when the field is already an overlay', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'cpu', type: FieldType.number, values: [1, 2, 3] },
        {
          name: 'MA cpu',
          type: FieldType.number,
          values: [1, 1.5, 2],
          config: { custom: { [MOVING_AVERAGE_OVERLAY_FLAG]: true } },
        },
      ],
    });

    const [result] = addMovingAverageOverlay([frame], { windowSize: 2 });

    expect(result.fields.map((field) => field.name)).toEqual(['cpu', 'MA cpu']);
    expect(result.fields[1].values).toEqual([1, 1.5, 2]);
  });

  it('skips series hidden from the visualization', () => {
    const frame = toDataFrame({
      fields: [
        {
          name: 'hidden',
          type: FieldType.number,
          values: [1, 2, 3],
          config: { custom: { hideFrom: { viz: true } } },
        },
      ],
    });

    const [result] = addMovingAverageOverlay([frame], { windowSize: 2 });

    expect(result.fields.map((field) => field.name)).toEqual(['hidden']);
  });

  it('pins the overlay color to the source series when a theme is provided', () => {
    const frame = toDataFrame({
      fields: [
        {
          name: 'cpu',
          type: FieldType.number,
          values: [1, 2, 3],
          config: { color: { mode: FieldColorModeId.Fixed, fixedColor: '#F2495C' } },
        },
      ],
    });

    const [result] = addMovingAverageOverlay([frame], { windowSize: 2, theme: createTheme() });

    expect(result.fields[1].config.color).toEqual({
      mode: FieldColorModeId.Fixed,
      fixedColor: '#F2495C',
    });
  });
});
