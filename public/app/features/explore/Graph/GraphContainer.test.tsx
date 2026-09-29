import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { dateTime, EventBusSrv, LoadingState, store } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { GraphContainer } from './GraphContainer';

const captured: Array<{ showMovingAverage?: boolean }> = [];

jest.mock('./ExploreGraph', () => ({
  ExploreGraph: (props: { showMovingAverage?: boolean }) => {
    captured.push({ showMovingAverage: props.showMovingAverage });
    return <div>ExploreGraph</div>;
  },
}));

const MOVING_AVERAGE_KEY = 'grafana.explore.graph.movingAverage';

function renderGraph() {
  return render(
    <GraphContainer
      width={400}
      height={200}
      data={[]}
      eventBus={new EventBusSrv()}
      timeRange={{ from: dateTime(0), to: dateTime(1), raw: { from: dateTime(0), to: dateTime(1) } }}
      timeZone="browser"
      onChangeTime={() => {}}
      splitOpenFn={() => {}}
      loadingState={LoadingState.Done}
    />
  );
}

describe('GraphContainer moving average overlay', () => {
  afterEach(() => {
    captured.length = 0;
    store.delete(MOVING_AVERAGE_KEY);
  });

  it('passes showMovingAverage=false until the switch is turned on, then persists it', async () => {
    const user = userEvent.setup();
    renderGraph();

    expect(captured[captured.length - 1].showMovingAverage).toBe(false);

    await user.click(screen.getByTestId(selectors.pages.Explore.General.movingAverageSwitch));

    expect(captured[captured.length - 1].showMovingAverage).toBe(true);
    expect(store.getBool(MOVING_AVERAGE_KEY, false)).toBe(true);
  });
});
