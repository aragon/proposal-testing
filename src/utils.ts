import {
  ApplyUpdateParams,
  Client,
  Context,
  PrepareUpdateStep,
} from '@aragon/sdk-client';

export async function preparePluginUpdate(
  context: Context,
  pluginAddress: string,
  daoAddressOrEns: string,
  pluginRepo: string,
  newVersion: {build: number; release: number}
): Promise<ApplyUpdateParams> {
  const client = new Client(context);
  const steps = client.methods.prepareUpdate({
    pluginAddress,
    daoAddressOrEns,
    newVersion,
    pluginRepo,
  });
  for await (const step of steps) {
    switch (step.key) {
      case PrepareUpdateStep.PREPARING:
        console.log(step.txHash);
        break;
      case PrepareUpdateStep.DONE:
        return {
          versionTag: step.versionTag,
          pluginRepo: step.pluginRepo,
          pluginAddress: step.pluginAddress,
          permissions: step.permissions,
          helpers: step.helpers,
          initData: step.initData,
        };
    }
  }
  throw new Error('canot prepare update');
}
