import { render, screen } from 'test/test-utils';

import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders the username field with Email label', () => {
    render(
      <LoginForm onSubmit={jest.fn()} isLoggingIn={false} passwordHint="" loginHint="">
        <span />
      </LoginForm>
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Email$/ })).toBeInTheDocument();
  });
});
