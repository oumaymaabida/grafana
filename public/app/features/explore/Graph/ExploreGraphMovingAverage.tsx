import { type ChangeEvent } from 'react';

import { selectors } from '@grafana/e2e-selectors';
import { t } from '@grafana/i18n';
import { InlineSwitch, Input, Stack, Tooltip } from '@grafana/ui';

import { MIN_MOVING_AVERAGE_WINDOW } from './addMovingAverageOverlay';

type Props = {
  enabled: boolean;
  windowSize: number;
  onEnabledChange: (enabled: boolean) => void;
  onWindowSizeChange: (windowSize: number) => void;
};

export function ExploreGraphMovingAverage({ enabled, windowSize, onEnabledChange, onWindowSizeChange }: Props) {
  const label = t('graph.container.moving-average', 'Moving average');

  const onWindowInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseInt(event.currentTarget.value, 10);
    if (Number.isFinite(next) && next >= MIN_MOVING_AVERAGE_WINDOW) {
      onWindowSizeChange(next);
    }
  };

  return (
    <Stack direction="row" alignItems="center" gap={0.5} wrap="nowrap">
      <Tooltip
        content={t('graph.container.moving-average-tooltip', 'Overlay a trailing simple moving average on each series')}
      >
        <span>
          <InlineSwitch
            showLabel
            label={label}
            value={enabled}
            onChange={(event) => onEnabledChange(event.currentTarget.checked)}
            data-testid={selectors.pages.Explore.General.graphMovingAverageSwitch}
          />
        </span>
      </Tooltip>
      {enabled && (
        <Input
          type="number"
          min={MIN_MOVING_AVERAGE_WINDOW}
          width={8}
          value={windowSize}
          onChange={onWindowInputChange}
          aria-label={t('graph.container.moving-average-window', 'Moving average window')}
          data-testid={selectors.pages.Explore.General.graphMovingAverageWindow}
        />
      )}
    </Stack>
  );
}
