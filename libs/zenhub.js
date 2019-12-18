const request = require('request-promise-native');

const ZEN_HUB_BASE_URL = 'https://api.zenhub.io/p1';

const _call = async(method, path, { zenHubToken }) => {
  const res = await request({
    headers: {
      'x-authentication-token': zenHubToken
    },
    method,
    uri: ZEN_HUB_BASE_URL + path,
    json: true,
    resolveWithFullResponse: true,
  });
  return { data: res.body, meta: res.headers };
};

const getEpicData = async(epicNo, { zenHubToken, zenHubRepoId}) => {
  const method = 'GET';
  const path = `/repositories/${zenHubRepoId}/epics/${epicNo}`;
  return await _call(method, path, { zenHubToken });
};

module.exports = {
  getEpicData
};
