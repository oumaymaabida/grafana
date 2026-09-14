import { config } from '@grafana/runtime';
import { Button, ClipboardButton } from '@grafana/ui';

import { Permissions } from 'app/core/components/AccessControl/Permissions';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction } from 'app/types/accessControl';
import { type Team } from 'app/types/teams';

type TeamPermissionsProps = {
  team: Team;
};

// TeamPermissions component replaces TeamMembers component when the accesscontrol feature flag is set
const TeamPermissions = (props: TeamPermissionsProps) => {
  let canSetPermissions = contextSrv.hasPermissionInMetadata(
    AccessControlAction.ActionTeamsPermissionsWrite,
    props.team
  );

  if (props.team.isProvisioned) {
    canSetPermissions = false;
  }

  const inviteUrl = config.externalUserMngLinkUrl;
  const showCopyInvite = props.team.memberCount === 0;

  return (
    <>
      {showCopyInvite &&
        (inviteUrl ? (
          <ClipboardButton icon="copy" variant="secondary" getText={() => inviteUrl}>
            Copy invite link
          </ClipboardButton>
        ) : (
          <Button icon="copy" variant="secondary" disabled tooltip="No invite URL available">
            Copy invite link
          </Button>
        ))}
      <Permissions
        addPermissionTitle="Add member"
        buttonLabel="Add member"
        emptyLabel="There are no members in this team or you do not have the permissions to list the current members."
        resource="teams"
        resourceId={props.team.id}
        canSetPermissions={canSetPermissions}
      />
    </>
  );
};

export default TeamPermissions;
