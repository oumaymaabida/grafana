import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EventBusSrv, FieldType, getDefaultTimeRange, LoadingState, toDataFrame, type DataFrame } from '@grafana/data';

import { GraphContainer } from './GraphContainer';

const mockGraphData: { current: DataFrame[] } = { current: [] };

jest.mock('./ExploreGraph', () => ({
  ExploreGraph: (props: { data: DataFrame[] }) => {
    mockGraphData.current = props.data;
    return <div>Explore graph</div>;
  },
}));

const series = toDataFrame({
  fields: [
    { name: 'time', type: FieldType.time, values: [1, 2, 3, 4] },
    { name: 'requests', type: FieldType.number, values: [10, 20, 30, 40] },
  ],
});

describe('GraphContainer', () => {
  it('overlays a trailing moving average when Moving average is switched on', async () => {
    render(
      <GraphContainer
        width={800}
        height={400}
        data={[series]}
        eventBus={new EventBusSrv()}
        timeRange={getDefaultTimeRange()}
        timeZone="browser"
        onChangeTime={() => {}}
        splitOpenFn={() => {}}
        loadingState={LoadingState.Done}
      />
    );

    expect(screen.getByText('Moving average')).toBeInTheDocument();
    expect(mockGraphData.current[0].fields.map((field) => field.name)).toEqual(['time', 'requests']);

    await userEvent.click(screen.getByRole('switch', { name: 'Moving average' }));

    const overlay = mockGraphData.current[0].fields.find((field) => field.name === 'requests moving average');
    expect(overlay?.values).toEqual([10, 15, 20, 25]);
    expect(overlay?.config.custom?.lineStyle).toEqual({ fill: 'dash', dash: [10, 10] });
    expect(overlay?.config.custom?.stacking).toEqual({ group: 'A', mode: 'none' });
  });
});
