async function getAddMessage(changeset) {
  return `docs(changeset): ${changeset.summary}`;
}

async function getVersionMessage(releasePlan) {
  return `chore(release): version bump to v${releasePlan.releases[0].newVersion}`;
}

module.exports = {
  getAddMessage,
  getVersionMessage,
};
