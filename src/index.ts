import {
  MULTISIG_CREATE_PROPOSAL_FLAG,
  MULTISIG_PLUGIN_ADDRESS,
  MULTISIG_PREPARE_UPDATE_FLAG,
  TOKEN_VOTING_CHECK_PROPOSAL_UPDATE_FLAG,
  TOKEN_VOTING_CREATE_PROPOSAL_FLAG,
  TOKEN_VOTING_PLUGIN_ADDRESS,
} from './constants';
import {
  createMultisigLegitUpdateProposal,
  prepareMultisigPluginUpdate,
} from './multisig';
import {
  createTokenVotingLegitUpdateProposal,
  prepareTokenVotingPluginUpdate,
} from './tokenVoting';
import {contracts} from '@aragon/osx-commons-configs';
import {Context, ApplyUpdateParams} from '@aragon/sdk-client';
import {LIVE_CONTRACTS} from '@aragon/sdk-client-common';
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

// ROOT_PERMISSION_ID     0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33
// UPGRADE_PERMISSION_ID  0x821b6e3a557148015a918c89e5d092e878a69854a2d1a410635f771bd5a8a3f5

export const PROPOSAL_ID = '0xfcb22129221d6316f7b18d85b0792edb8b6debf4_0x1';

main().catch(console.error);

async function main() {
  const ctx = new Context({
    signer: new Wallet(process.env.ETH_KEY!),
    network: 'goerli',
    web3Providers: 'https://ethereum-goerli.publicnode.com',
    graphqlNodes: [
      {
        url: 'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.4.0/api',
      },
    ],
  });
  // Default params given by the prepareMultisigPluginUpdate function
  let applyUpdateParams: ApplyUpdateParams = {
    versionTag: {
      build: 2,
      release: 1,
    },
    pluginRepo: contracts.goerli['v1.3.0']!.MultisigRepoProxy.address,
    pluginAddress: MULTISIG_PLUGIN_ADDRESS,
    permissions: [],
    helpers: [],
    initData: new Uint8Array(),
  };
  // await checkProposal(client, PROPOSAL_ID);
  if (MULTISIG_PREPARE_UPDATE_FLAG) {
    applyUpdateParams = await prepareMultisigPluginUpdate(ctx);
  }
  let multisigProposalId = '';
  if (MULTISIG_CREATE_PROPOSAL_FLAG) {
    multisigProposalId = await createMultisigLegitUpdateProposal(
      ctx,
      applyUpdateParams
    );
  }
  // Default params given by the prepareTokenVotingPluginUpdate function
  applyUpdateParams = {
    versionTag: {release: 1, build: 2},
    pluginRepo: contracts.goerli['v1.3.0']!.TokenVotingRepoProxy.address,
    pluginAddress: TOKEN_VOTING_PLUGIN_ADDRESS,
    permissions: [],
    helpers: [],
    initData: new Uint8Array(),
  };
  if (TOKEN_VOTING_CHECK_PROPOSAL_UPDATE_FLAG) {
    applyUpdateParams = await prepareTokenVotingPluginUpdate(ctx);
  }

  let tokenVotingProposalId = '';
  if (TOKEN_VOTING_CREATE_PROPOSAL_FLAG) {
    tokenVotingProposalId = await createTokenVotingLegitUpdateProposal(
      ctx,
      applyUpdateParams
    );
  }
  console.log('tokenVotingProposalId', tokenVotingProposalId);
}
