import {DAO, PSP, TOKEN_VOTING_PLUGIN} from '.';
import {Client} from '@aragon/sdk-client';
import {
  DaoAction,
  LIVE_CONTRACTS,
  Permissions,
  ApplyUpdateParams,
} from '@aragon/sdk-client-common';

// Recieves ["grantRoot","applyUpdate", "revokeRoot"] as an input and returns an action array
export function legitProposal(
  client: Client,
  actionNames: string[]
): DaoAction[] {
  const grantRoot = client.encoding.grantAction(DAO, {
    where: DAO,
    who: PSP,
    permission: Permissions.ROOT_PERMISSION,
  });

  const revokeRoot = client.encoding.revokeAction(DAO, {
    where: DAO,
    who: PSP,
    permission: Permissions.ROOT_PERMISSION,
  });

  const grantUpgrade = client.encoding.grantAction(DAO, {
    where: TOKEN_VOTING_PLUGIN,
    who: PSP,
    permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
  });

  const revokeUpgrade = client.encoding.revokeAction(DAO, {
    where: TOKEN_VOTING_PLUGIN,
    who: PSP,
    permission: Permissions.UPGRADE_PLUGIN_PERMISSION,
  });

  const applyUpdateParams: ApplyUpdateParams = {
    permissions: [],
    initData: new Uint8Array(),
    helpers: [],
    versionTag: {
      release: 1,
      build: 2,
    },
    pluginRepo: LIVE_CONTRACTS['1.0.0'].goerli.tokenVotingRepoAddress,
    pluginAddress: TOKEN_VOTING_PLUGIN,
  };

  const applyUpdateAndGrantUpgradeActions =
    client.encoding.applyUpdateAndPermissionsActionBlock(
      DAO,
      applyUpdateParams
    );

  const applyUpdate = applyUpdateAndGrantUpgradeActions[1];

  const dao130base = '0x53d483975773A2a9E5D9e84d9CD42cee85e90D97';
  const upgradeTo = client.encoding.upgradeToAction(DAO, dao130base);
  const upgradeToAndCall = client.encoding.upgradeToAndCallAction(DAO, {
    implementationAddress: dao130base,
    data: client.encoding.initializeFromAction(DAO, {
      previousVersion: [1, 0, 0],
      //initData: "0x"
    }).data,
  });

  let actions: DaoAction[] = [];

  actionNames.forEach(actionName => {
    switch (actionName) {
      case 'grantRoot':
        actions.push(grantRoot);
        break;
      case 'revokeRoot':
        actions.push(revokeRoot);
        break;
      case 'grantUpgrade':
        actions.push(grantUpgrade);
        break;
      case 'revokeUpgrade':
        actions.push(revokeUpgrade);
        break;
      case 'applyUpdate':
        actions.push(applyUpdate);
        break;
      case 'upgradeTo':
        actions.push(upgradeTo);
        break;
      case 'upgradeToAndCall':
        actions.push(upgradeToAndCall);
        break;
    }
  });

  return actions;
}
