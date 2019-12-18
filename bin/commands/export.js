const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const csvStringifySync = require('csv-stringify/lib/sync');
require('dotenv').config();

const zenhub = require('../../libs/zenhub');
const github = require('../../libs/github');

const DAY_FORMAT = 'YYYY/MM/DD';

exports.command = ['* [options]', 'export'];
exports.describe = 'Export epic and issues that include issue\'s description and estimate point.';
exports.builder = yargs => {
  yargs.options({
    e: {
      alias: 'epicNo',
      demandOption: true,
      requiresArg: true,
      describe: 'Target ZenHub\'s Epic No',
      type: 'string',
    },
    f: {
      alias: 'fromDate',
      demandOption: true,
      requiresArg: true,
      describe: 'From date (YYYY/MM/DD)',
      type: 'string',
    },
    t: {
      alias: 'toDate',
      demandOption: true,
      requiresArg: true,
      describe: 'Target ZenHub\'s Epic No',
      type: 'string',
    },
    d: {
      alias: 'destPath',
      demandOption: false,
      default: path.resolve(process.cwd(), 'epic.csv'),
      requiresArg: true,
      describe: 'Path of directory to export',
      type: 'string',
    },
  })
};

const getEpicIssues = async epicId => {
  const zenHubInfo = {
    zenHubToken: process.env.ZEN_HUB_TOKEN,
    zenHubRepoId: process.env.ZEN_HUB_REPO_ID
  };
  const epicData = await zenhub.getEpicData(epicId, zenHubInfo);
  const epicIssuesData = epicData.data.issues;
  return epicIssuesData.map(issueData => {
    return {
      issueNo: issueData.issue_number,
      estimatePoint: issueData.estimate.value,
    }
  });
};

const generateDoneAtArray = (fromDate, toDate) => {
  let currentDay = dayjs(fromDate);
  let days = [];
  while (!currentDay.isAfter(dayjs(toDate))) {
    days.push({
      doneAt: currentDay.format(DAY_FORMAT)
    });
    currentDay = currentDay.add(1, 'day');
  }
  return days;
};

const rearrangeForList = (issues, fromDate, toDate) => {
  let doneAtArray = generateDoneAtArray(fromDate, toDate);
  doneAtArray.forEach(doneAtItem => {
    issues.filter(issue => issue.doneAt === doneAtItem.doneAt).map(issue => {
      doneAtItem[issue.assignee] = issue;
    });
  });
  return doneAtArray;
};

const convertCsv = (issuesForList) => {
  const assigneeIdList = process.env.ASSIGNEE_ID_LIST.split(',');
  const arrayForCsv = issuesForList.reduce((rows, issue) => {
    let cols = [];
    cols.push(issue.doneAt);
    assigneeIdList.map(assigneeId => {
      const assigneeIssue = issue[assigneeId];
      if (!assigneeIssue) {
        cols.push('');
        cols.push('');
        return;
      }
      cols.push(assigneeIssue.estimatePoint);
      cols.push(assigneeIssue.body);
    });
    rows.push(cols);
    return rows;
  }, []);
  return csvStringifySync(arrayForCsv);
};

exports.handler = async argv => {

  const epicIssues = await getEpicIssues(argv.epicNo);

  const issues = await Promise.all(epicIssues.map(async epicIssue => {
    const gitHubInfo = {
      gitHubToken: process.env.GIT_HUB_TOKEN,
      gitHubOwner: process.env.GIT_HUB_OWNER,
      gitHubRepo: process.env.GIT_HUB_REPO
    };
    const githubIssue = await github.getIssueData(epicIssue.issueNo, gitHubInfo);
    const data = githubIssue.data;
    return {
      issueNo: epicIssue.issueNo,
      estimatePoint: epicIssue.estimatePoint,
      title: data.title,
      doneAt: dayjs(data.title).format(DAY_FORMAT),
      assignee: data.assignee.login,
      body: data.body
    }
  }));

  const issuesForList = rearrangeForList(issues, argv.fromDate, argv.toDate);
  fs.writeFileSync(argv.destPath, convertCsv(issuesForList));
  console.log('Done!');
};
