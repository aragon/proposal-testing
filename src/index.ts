import {getClient} from './client';
import {
  TokenVotingClient,
  ContextParams,
  Context,
  CreateMajorityVotingProposalParams,
  VoteValues,
  ProposalCreationSteps,
} from '@aragon/sdk-client';
import {
  LIVE_CONTRACTS,
  PermissionIds,
  PermissionOperationType,
} from '@aragon/sdk-client-common';
import {fetch} from '@web-std/fetch';
import {Blob, File} from '@web-std/file';
import {FormData} from '@web-std/form-data';
import * as dotenv from 'dotenv';
import {Wallet} from 'ethers';

globalThis.fetch = fetch;
globalThis.FormData = FormData;
globalThis.Blob = Blob;
globalThis.File = File;

dotenv.config();

// https://goerli.etherscan.io/tx/0x2c51fcacbb71fab7f8c14831304a39e571aa6feebbcf344d1e16f29b10cfc5a3 // preparation

//const DAO_ENS = 'again.dao.eth';
export const DAO = '0xf21400112e22531598C78706129E0907818817b8'.toLowerCase(); // https://staging-app.aragon.org/#/daos/goerli/again.dao.eth/dashboard
export const TOKEN_VOTING_PLUGIN =
  '0xa03BF96689b988cC9a9489AC5DD7ABA6900064b7'.toLowerCase();
export const PSP =
  LIVE_CONTRACTS['1.0.0'].goerli.pluginSetupProcessorAddress.toLowerCase();
const TOKEN_VOTING_REPO =
  '0xFCc843C48BD44e5dA5976a2f2d85772D59C5959E'.toLowerCase();

// ROOT_PERMISSION_ID     0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33
// UPGRADE_PERMISSION_ID  0x821b6e3a557148015a918c89e5d092e878a69854a2d1a410635f771bd5a8a3f5

main().catch(console.error);
async function main() {
  const contextParams: ContextParams = {
    signer: new Wallet(process.env.ETH_KEY!),
    network: 'goerli',
    web3Providers: 'https://ethereum-goerli.publicnode.com',
  };
  const context = new Context(contextParams);
  const client = getClient(context);
  const tokenVotingClient: TokenVotingClient = new TokenVotingClient(context);

  //const id = '0xa03bf96689b988cc9a9489ac5dd7aba6900064b7_0x1e';
  //console.log(await client.methods.isDaoUpdateProposal(id));
  //console.log(await client.methods.isDaoUpdateProposalValid(id));
  //console.log(await client.methods.isPluginUpdateProposal(id));
  //console.log(await client.methods.isPluginUpdateProposalValid(id));

  // Create a TokenVoting client.

  const proposalMetadata = {
    title: 'Legit proposal Attempt 1',
    description: 'A legit proposal',
    summary: 'Use own function',
    resources: [],
  };
  const metadataUri: string = await tokenVotingClient.methods.pinMetadata(
    proposalMetadata
  );

  const regularActions = client.encoding.applyUpdateAndPermissionsActionBlock(
    DAO,
    {
      versionTag: {build: 1, release: 2},
      initData: new Uint8Array(),
      pluginRepo: TOKEN_VOTING_REPO,
      pluginAddress: TOKEN_VOTING_PLUGIN,
      permissions: [
        {
          operation: PermissionOperationType.GRANT,
          where: DAO,
          who: PSP,
          //condition?: string,
          permissionId: PermissionIds.UPGRADE_PLUGIN_PERMISSION_ID,
        },
      ],
      helpers: [],
    }
  );
  console.log(regularActions);

  //const legitProposalActions = legitProposal(client, [
  //  'grantUpgrade',
  //  'grantRoot',
  //  'applyUpdate',
  //  'revokeRoot',
  //  'revokeUpgrade',
  //]);

  const proposalParams: CreateMajorityVotingProposalParams = {
    pluginAddress: TOKEN_VOTING_PLUGIN,
    metadataUri,
    endDate: new Date(2024, 12, 1),
    actions: regularActions, //legitProposalActions,
    executeOnPass: false,
    creatorVote: VoteValues.NO, // Vote NO to not accidentally loose the test DAO 1.0.0 by upgrading it
  };

  // Creates a proposal using the token voting governance mechanism, which executes with the parameters set in the configAction object.
  const steps = tokenVotingClient.methods.createProposal(proposalParams);

  for await (const step of steps) {
    try {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          console.log(step.txHash);
          break;
        case ProposalCreationSteps.DONE:
          console.log(step.proposalId);
          break;
      }
    } catch (err) {
      console.error(err);
    }
  }
}
