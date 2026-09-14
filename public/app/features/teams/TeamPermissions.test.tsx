import { render, screen } from 'test/test-utils';

import { config } from '@grafana/runtime';
import { contextSrv } from 'app/core/services/context_srv';

import { getMockTeam } from './mocks/teamMocks';
import TeamPermissions from './TeamPermissions';

jest.mock('app/core/components/AccessControl/Permissions', () => ({
  Permissions: () => <div data-testid="team-permissions" />,
}));

describe('TeamPermissions', () => {
  const originalInviteUrl = config.externalUserMngLinkUrl;

  beforeEach(() => {
    jest.spyOn(contextSrv, 'hasPermissionInMetadata').mockReturnValue(true);
  });

  afterEach(() => {
    config.externalUserMngLinkUrl = originalInviteUrl;
    jest.restoreAllMocks();
  });

  it('shows Copy invite link on the empty members state', () => {
    config.externalUserMngLinkUrl = 'https://example.com/invite';

    render(<TeamPermissions team={getMockTeam(1, 'aaaaaa', { memberCount: 0 })} />);

    expect(screen.getByRole('button', { name: 'Copy invite link' })).toBeInTheDocument();
  });
});
