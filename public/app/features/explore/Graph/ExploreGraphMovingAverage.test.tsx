import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { selectors } from '@grafana/e2e-selectors';

import { ExploreGraphMovingAverage } from './ExploreGraphMovingAverage';

describe('ExploreGraphMovingAverage', () => {
  it('hides the window input until the overlay is enabled, then reports the typed window size', async () => {
    const user = userEvent.setup();
    const onEnabledChange = jest.fn();
    const onWindowSizeChange = jest.fn();

    const { rerender } = render(
      <ExploreGraphMovingAverage
        enabled={false}
        windowSize={10}
        onEnabledChange={onEnabledChange}
        onWindowSizeChange={onWindowSizeChange}
      />
    );

    expect(screen.queryByTestId(selectors.pages.Explore.General.graphMovingAverageWindow)).not.toBeInTheDocument();

    await user.click(screen.getByTestId(selectors.pages.Explore.General.graphMovingAverageSwitch));
    expect(onEnabledChange).toHaveBeenCalledWith(true);

    rerender(
      <ExploreGraphMovingAverage
        enabled
        windowSize={10}
        onEnabledChange={onEnabledChange}
        onWindowSizeChange={onWindowSizeChange}
      />
    );

    fireEvent.change(screen.getByTestId(selectors.pages.Explore.General.graphMovingAverageWindow), {
      target: { value: '5' },
    });
    expect(onWindowSizeChange).toHaveBeenCalledWith(5);
  });
});
