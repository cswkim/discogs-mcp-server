import { Changeset, CommitFunctions, ReleasePlan } from '@changesets/types';

async function getAddMessage(changeset: Changeset): Promise<string> {
  return `docs(changeset): ${changeset.summary}`;
}

async function getVersionMessage(releasePlan: ReleasePlan): Promise<string> {
  return `chore(release): version bump to v${releasePlan.releases[0].newVersion}`;
}

const defaultCommitFunctions: CommitFunctions = {
  getAddMessage,
  getVersionMessage,
};

export default defaultCommitFunctions;
