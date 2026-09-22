import { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import {
  type DataFrame,
  type EventBus,
  type AbsoluteTimeRange,
  type TimeZone,
  type SplitOpen,
  type LoadingState,
  type ThresholdsConfig,
  type TimeRange,
  ThemeContext,
  createTheme,
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
const exploreGraphLightTheme = createTheme({ colors: { mode: 'light' } });

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
  const [graphStyle, setGraphStyle] = useState(loadGraphStyle);
  const [graphLightMode, setGraphLightMode] = useState(false);

  const onGraphStyleChange = useCallback((graphStyle: ExploreGraphStyle) => {
    storeGraphStyle(graphStyle);
    setGraphStyle(graphStyle);
  }, []);

  const slicedData = useMemo(() => {
    return showAllSeries ? data : data.slice(0, MAX_NUMBER_OF_TIME_SERIES);
  }, [data, showAllSeries]);

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
            transparent
            label={t('graph.container.light-mode', 'Light mode')}
            value={graphLightMode}
            onChange={() => setGraphLightMode((enabled) => !enabled)}
          />
          <ExploreGraphLabel graphStyle={graphStyle} onChangeGraphStyle={onGraphStyleChange} />
        </>
      }
    >
      {(innerWidth, innerHeight) => {
        const graph = (
          <ExploreGraph
            graphStyle={graphStyle}
            data={slicedData}
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
        );

        if (!graphLightMode) {
          return graph;
        }

        return <ThemeContext.Provider value={exploreGraphLightTheme}>{graph}</ThemeContext.Provider>;
      }}
    </PanelChrome>
  );
};
