import { screen } from '@testing-library/react';
import { render } from 'test/test-utils';

import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders the submit button as Sign in', () => {
    render(
      <LoginForm onSubmit={jest.fn()} isLoggingIn={false} passwordHint="" loginHint="">
        <span />
      </LoginForm>
    );

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
