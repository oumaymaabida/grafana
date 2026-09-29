import {
  type DataFrame,
  FieldColorModeId,
  FieldType,
  getFieldDisplayName,
  getFieldSeriesColor,
  type GrafanaTheme2,
} from '@grafana/data';
import { GraphDrawStyle, StackingMode } from '@grafana/schema';

export const DEFAULT_MOVING_AVERAGE_WINDOW = 10;

export const MOVING_AVERAGE_OVERLAY_FLAG = 'exploreMovingAverageOverlay';

export function computeTrailingMovingAverage(
  values: Array<number | null | undefined>,
  windowSize: number
): Array<number | null> {
  if (windowSize < 1) {
    throw new Error('Moving average window size must be at least 1');
  }

  const result: Array<number | null> = [];
  let sum = 0;
  let count = 0;

  for (let i = 0; i < values.length; i++) {
    const current = values[i];
    if (current != null) {
      sum += current;
      count++;
    }

    const outIndex = i - windowSize;
    if (outIndex >= 0 && values[outIndex] != null) {
      sum -= values[outIndex] as number;
      count--;
    }

    result.push(count === 0 ? null : sum / count);
  }

  return result;
}

interface AddMovingAverageOverlayOptions {
  windowSize?: number;
  theme?: GrafanaTheme2;
}

export function addMovingAverageOverlay(
  frames: DataFrame[],
  options: AddMovingAverageOverlayOptions = {}
): DataFrame[] {
  const windowSize = options.windowSize ?? DEFAULT_MOVING_AVERAGE_WINDOW;

  return frames.map((frame) => {
    const overlayFields = frame.fields
      .filter((field) => {
        if (field.type !== FieldType.number) {
          return false;
        }
        if (field.config.custom?.[MOVING_AVERAGE_OVERLAY_FLAG]) {
          return false;
        }
        if (field.config.custom?.hideFrom?.viz) {
          return false;
        }
        return true;
      })
      .map((field) => {
        const displayName = getFieldDisplayName(field, frame, frames);
        const overlay = {
          ...field,
          name: `MA ${field.name}`,
          values: computeTrailingMovingAverage(field.values, windowSize),
          state: undefined,
          config: {
            ...field.config,
            displayName: `MA ${displayName}`,
            custom: {
              ...field.config.custom,
              [MOVING_AVERAGE_OVERLAY_FLAG]: true,
              drawStyle: GraphDrawStyle.Line,
              lineStyle: { fill: 'dash' as const, dash: [10, 10] },
              fillOpacity: 0,
              lineWidth: 2,
              stacking: { mode: StackingMode.None, group: 'A' },
            },
          },
        };

        if (options.theme) {
          overlay.config.color = {
            mode: FieldColorModeId.Fixed,
            fixedColor: getFieldSeriesColor(field, options.theme).color,
          };
        }

        return overlay;
      });

    if (overlayFields.length === 0) {
      return frame;
    }

    return {
      ...frame,
      fields: [...frame.fields, ...overlayFields],
    };
  });
}
