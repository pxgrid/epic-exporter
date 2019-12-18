const request = require('request-promise-native');

const GIT_HUB_BASE_URL = 'https://api.github.com';

const _call = async(method, path, { gitHubToken }) => {
  const res = await request({
    headers: {
      'Authorization': `token ${gitHubToken}`,
      'User-Agent': 'epic-exporter'
    },
    method,
    uri: GIT_HUB_BASE_URL + path,
    json: true,
    resolveWithFullResponse: true,
  });
  return { data: res.body, meta: res.headers };
};

const getIssueData = async(issueNo, { gitHubToken, gitHubOwner, gitHubRepo }) => {
  const method = 'GET';
  const path = `/repos/${gitHubOwner}/${gitHubRepo}/issues/${issueNo}`;
  return await _call(method, path, { gitHubToken });
};

module.exports = {
  getIssueData
};
