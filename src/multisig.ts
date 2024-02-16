import {MULTISIG_DAO_ADDRESS, MULTISIG_PLUGIN_ADDRESS} from './constants';
import {preparePluginUpdate} from './utils';
import {contracts} from '@aragon/osx-commons-configs';
import {
  ApplyUpdateParams,
  Context,
  Client,
  MultisigClient,
  CreateMultisigProposalParams,
  ProposalCreationSteps,
} from '@aragon/sdk-client';
import {ProposalMetadata} from '@aragon/sdk-client-common';

export async function createMultisigLegitUpdateProposal(
  context: Context,
  params: ApplyUpdateParams,
  metadata?: ProposalMetadata
): Promise<string> {
  const client = new Client(context);
  const actions = client.encoding.applyUpdateAndPermissionsActionBlock(
    MULTISIG_DAO_ADDRESS,
    params
  );
  const multisigClient = new MultisigClient(context);
  const metadataParams = metadata || {
    title: 'Multisig plugin update',
    description: 'A legit proposal',
    summary: 'Use own function',
    resources: [],
  };
  const metadataUri = await multisigClient.methods.pinMetadata(metadataParams);
  const proposalParams: CreateMultisigProposalParams = {
    pluginAddress: MULTISIG_PLUGIN_ADDRESS,
    actions,
    metadataUri,
    endDate: new Date(2024, 12, 1),
  };

  // Creates a proposal using the token voting governance mechanism, which executes with the parameters set in the configAction object.
  const steps = multisigClient.methods.createProposal(proposalParams);

  for await (const step of steps) {
    try {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          console.log(step.txHash);
          break;
        case ProposalCreationSteps.DONE:
          return step.proposalId;
      }
    } catch (err) {
      console.error(err);
    }
  }
  throw new Error('Proposal creation failed');
}

export async function prepareMultisigPluginUpdate(
  context: Context
): Promise<ApplyUpdateParams> {
  return preparePluginUpdate(
    context,
    MULTISIG_PLUGIN_ADDRESS,
    MULTISIG_DAO_ADDRESS,
    contracts.goerli['v1.3.0']!.MultisigRepoProxy.address,
    {build: 2, release: 1}
  );
}
