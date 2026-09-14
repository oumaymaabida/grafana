import { render, screen } from 'test/test-utils';

import { config } from '@grafana/runtime';

import { contextSrv } from 'app/core/services/context_srv';

import { getMockTeam } from './mocks/teamMocks';
import TeamPermissions from './TeamPermissions';

jest.mock('app/core/components/AccessControl/Permissions', () => ({
  Permissions: () => <div>permissions</div>,
}));

jest.spyOn(contextSrv, 'hasPermissionInMetadata').mockReturnValue(true);

describe('TeamPermissions', () => {
  const originalExternalUserMngLinkUrl = config.externalUserMngLinkUrl;

  afterEach(() => {
    config.externalUserMngLinkUrl = originalExternalUserMngLinkUrl;
  });

  it('shows Copy invite link on the empty members state', () => {
    config.externalUserMngLinkUrl = 'https://example.com/invite';

    render(<TeamPermissions team={getMockTeam(1, 'aaaaaa', { memberCount: 0 })} />);

    expect(screen.getByRole('button', { name: 'Copy invite link' })).toBeInTheDocument();
  });
});
