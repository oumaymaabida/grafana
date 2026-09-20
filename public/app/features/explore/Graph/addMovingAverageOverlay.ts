import {
  type DataFrame,
  FieldColorModeId,
  type Field,
  FieldType,
  getFieldDisplayName,
  getFieldSeriesColor,
  type GrafanaTheme2,
} from '@grafana/data';
import { t } from '@grafana/i18n';
import { GraphDrawStyle, StackingMode } from '@grafana/schema';

export const EXPLORE_MOVING_AVERAGE_CUSTOM_KEY = 'exploreMovingAverage';

export const MIN_MOVING_AVERAGE_WINDOW = 2;

export function trailingMovingAverage(values: unknown[], windowSize: number): Array<number | null> {
  const window = Math.floor(windowSize);
  const result: Array<number | null> = [];

  if (window < 1) {
    return values.map(() => null);
  }

  let sum = 0;
  let count = 0;

  for (let i = 0; i < values.length; i++) {
    const current = toFiniteNumber(values[i]);
    if (current !== null) {
      sum += current;
      count += 1;
    }

    if (i >= window) {
      const leaving = toFiniteNumber(values[i - window]);
      if (leaving !== null) {
        sum -= leaving;
        count -= 1;
      }
    }

    result.push(count === 0 ? null : sum / count);
  }

  return result;
}

export function addMovingAverageOverlay(frames: DataFrame[], windowSize: number, theme: GrafanaTheme2): DataFrame[] {
  const window = Math.floor(windowSize);
  if (window < MIN_MOVING_AVERAGE_WINDOW) {
    return frames;
  }

  return frames.map((frame) => {
    const overlayFields: Field[] = [];

    for (const field of frame.fields) {
      if (field.type !== FieldType.number) {
        continue;
      }
      if (field.config.custom?.[EXPLORE_MOVING_AVERAGE_CUSTOM_KEY]) {
        continue;
      }

      const displayName = getFieldDisplayName(field, frame, frames);
      const seriesColor = getFieldSeriesColor(field, theme).color;

      overlayFields.push({
        name: `${field.name} movingAvg`,
        type: FieldType.number,
        values: trailingMovingAverage(field.values, window),
        config: {
          unit: field.config.unit,
          decimals: field.config.decimals,
          displayName: t('graph.container.moving-average-series', '{{name}} (moving avg)', {
            name: displayName,
            interpolation: { escapeValue: false },
          }),
          color: {
            mode: FieldColorModeId.Fixed,
            fixedColor: seriesColor,
          },
          custom: {
            [EXPLORE_MOVING_AVERAGE_CUSTOM_KEY]: true,
            drawStyle: GraphDrawStyle.Line,
            lineWidth: 2,
            lineStyle: { fill: 'dash', dash: [8, 4] },
            fillOpacity: 0,
            stacking: { mode: StackingMode.None, group: 'A' },
            hideFrom: field.config.custom?.hideFrom,
          },
        },
      });
    }

    if (overlayFields.length === 0) {
      return frame;
    }

    return {
      ...frame,
      fields: [...frame.fields, ...overlayFields],
    };
  });
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return value;
}
