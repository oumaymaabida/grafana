import { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import {
  type DataFrame,
  type EventBus,
  FieldType,
  type Field,
  type AbsoluteTimeRange,
  type TimeZone,
  type SplitOpen,
  type LoadingState,
  type ThresholdsConfig,
  type TimeRange,
} from '@grafana/data';
import { Trans, t } from '@grafana/i18n';
import { type GraphThresholdsStyleConfig, InlineSwitch, PanelChrome, type PanelChromeProps } from '@grafana/ui';
import { type ExploreGraphStyle } from 'app/types/explore';

import { LimitedDataDisclaimer } from '../LimitedDataDisclaimer';
import { storeGraphStyle } from '../state/utils';

import { ExploreGraph } from './ExploreGraph';
import { ExploreGraphLabel } from './ExploreGraphLabel';
import { loadGraphStyle } from './utils';

const MAX_NUMBER_OF_TIME_SERIES = 20;
const MOVING_AVERAGE_WINDOW = 10;

function trailingMovingAverage(values: Array<number | null | undefined>): Array<number | null> {
  const averaged: Array<number | null> = [];

  for (let index = 0; index < values.length; index++) {
    const start = Math.max(0, index - MOVING_AVERAGE_WINDOW + 1);
    let sum = 0;
    let count = 0;

    for (let cursor = start; cursor <= index; cursor++) {
      const value = values[cursor];
      if (typeof value === 'number' && !Number.isNaN(value)) {
        sum += value;
        count += 1;
      }
    }

    averaged.push(count === 0 ? null : sum / count);
  }

  return averaged;
}

function movingAverageField(field: Field): Field {
  const sourceName = field.config?.displayName || field.name;

  return {
    ...field,
    name: `${sourceName} moving average`,
    labels: undefined,
    state: undefined,
    config: {
      ...field.config,
      displayName: `${sourceName} moving average`,
      custom: {
        ...field.config?.custom,
        fillOpacity: 0,
        stacking: { group: 'A', mode: 'none' },
        lineStyle: { fill: 'dash', dash: [10, 10] },
      },
    },
    values: trailingMovingAverage(field.values),
  };
}

function withMovingAverageOverlay(frames: DataFrame[]): DataFrame[] {
  return frames.map((frame) => ({
    ...frame,
    fields: [
      ...frame.fields,
      ...frame.fields.filter((field) => field.type === FieldType.number).map(movingAverageField),
    ],
  }));
}

interface Props extends Pick<PanelChromeProps, 'statusMessage'> {
  width: number;
  height: number;
  data: DataFrame[];
  annotations?: DataFrame[];
  eventBus: EventBus;
  timeRange: TimeRange;
  timeZone: TimeZone;
  onChangeTime: (absoluteRange: AbsoluteTimeRange) => void;
  splitOpenFn: SplitOpen;
  loadingState: LoadingState;
  thresholdsConfig?: ThresholdsConfig;
  thresholdsStyle?: GraphThresholdsStyleConfig;
  queriesChangedIndexAtRun?: number;
}

export const GraphContainer = ({
  data,
  eventBus,
  height,
  width,
  timeRange,
  timeZone,
  annotations,
  onChangeTime,
  splitOpenFn,
  thresholdsConfig,
  thresholdsStyle,
  loadingState,
  statusMessage,
  queriesChangedIndexAtRun,
}: Props) => {
  const [showAllSeries, toggleShowAllSeries] = useToggle(false);
  const [movingAverage, toggleMovingAverage] = useToggle(false);
  const [graphStyle, setGraphStyle] = useState(loadGraphStyle);

  const onGraphStyleChange = useCallback((graphStyle: ExploreGraphStyle) => {
    storeGraphStyle(graphStyle);
    setGraphStyle(graphStyle);
  }, []);

  const slicedData = useMemo(() => {
    return showAllSeries ? data : data.slice(0, MAX_NUMBER_OF_TIME_SERIES);
  }, [data, showAllSeries]);

  const graphData = useMemo(() => {
    return movingAverage ? withMovingAverageOverlay(slicedData) : slicedData;
  }, [movingAverage, slicedData]);

  return (
    <PanelChrome
      title={t('graph.container.title', 'Graph')}
      titleItems={[
        !showAllSeries && MAX_NUMBER_OF_TIME_SERIES < data.length && (
          <LimitedDataDisclaimer
            key="disclaimer"
            toggleShowAllSeries={toggleShowAllSeries}
            info={
              <Trans i18nKey={'graph.container.show-only-series'}>
                Showing only {{ MAX_NUMBER_OF_TIME_SERIES }} series
              </Trans>
            }
            buttonLabel={<Trans i18nKey={'graph.container.show-all-series'}>Show all {{ length: data.length }}</Trans>}
            tooltip={t(
              'graph.container.content',
              'Rendering too many series in a single panel may impact performance and make data harder to read. Consider refining your queries.'
            )}
          />
        ),
      ].filter(Boolean)}
      width={width}
      height={height}
      loadingState={loadingState}
      statusMessage={statusMessage}
      actions={
        <>
          <InlineSwitch
            showLabel
            label={t('graph.container.moving-average', 'Moving average')}
            value={movingAverage}
            onChange={toggleMovingAverage}
          />
          <ExploreGraphLabel graphStyle={graphStyle} onChangeGraphStyle={onGraphStyleChange} />
        </>
      }
    >
      {(innerWidth, innerHeight) => (
        <ExploreGraph
          graphStyle={graphStyle}
          data={graphData}
          height={innerHeight}
          width={innerWidth}
          timeRange={timeRange}
          onChangeTime={onChangeTime}
          timeZone={timeZone}
          annotations={annotations}
          splitOpenFn={splitOpenFn}
          loadingState={loadingState}
          thresholdsConfig={thresholdsConfig}
          thresholdsStyle={thresholdsStyle}
          eventBus={eventBus}
          queriesChangedIndexAtRun={queriesChangedIndexAtRun}
        />
      )}
    </PanelChrome>
  );
};
