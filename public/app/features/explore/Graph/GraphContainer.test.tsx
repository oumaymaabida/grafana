import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTheme, dateTime, EventBusSrv, LoadingState, ThemeContext } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';

import { GraphContainer } from './GraphContainer';

jest.mock('./ExploreGraph', () => {
  const React = require('react');
  const { useTheme2 } = jest.requireActual('@grafana/ui');

  return {
    ExploreGraph: () => {
      const theme = useTheme2();
      return React.createElement('span', null, `graph-theme-${theme.colors.mode}`);
    },
  };
});

function PageTheme() {
  const theme = useTheme2();
  return <span>{`page-theme-${theme.colors.mode}`}</span>;
}

function renderGraph() {
  render(
    <ThemeContext.Provider value={createTheme({ colors: { mode: 'dark' } })}>
      <PageTheme />
      <GraphContainer
        data={[]}
        eventBus={new EventBusSrv()}
        height={200}
        width={400}
        timeRange={{ from: dateTime(0), to: dateTime(1), raw: { from: dateTime(0), to: dateTime(1) } }}
        timeZone="browser"
        onChangeTime={() => {}}
        splitOpenFn={() => {}}
        loadingState={LoadingState.Done}
      />
    </ThemeContext.Provider>
  );
}

describe('GraphContainer', () => {
  it('shows a Light mode switch that themes only the explore graph', async () => {
    renderGraph();

    expect(screen.getByText('Light mode')).toBeInTheDocument();
    const lightMode = screen.getByRole('switch', { name: 'Light mode' });
    expect(lightMode).not.toBeChecked();
    expect(screen.getByText('graph-theme-dark')).toBeInTheDocument();
    expect(screen.getByText('page-theme-dark')).toBeInTheDocument();

    await userEvent.click(lightMode);

    expect(lightMode).toBeChecked();
    expect(screen.getByText('graph-theme-light')).toBeInTheDocument();
    expect(screen.getByText('page-theme-dark')).toBeInTheDocument();
  });
});
