import { screen } from '@testing-library/react';
import { render } from 'test/test-utils';

import { UserSignup } from './UserSignup';

describe('UserSignup', () => {
  it('renders the signup prompt as New here?', () => {
    render(<UserSignup />);

    expect(screen.getByText('New here?')).toBeInTheDocument();
  });
});
