# epic-exporter

## Usage

Copy `.env.example` as `.env`. Then input .env file to your GitHub's and ZenHub's information.

(ZEN_HUB_REPO_ID is can be get board's URL. https://github.com/.../board?repos={ZEN_HUB_REPO_ID})

Below is a command executing example that export no 13 epic and between from 2019/11/19 to 2019/12/19.

```
./bin/cli.js -e 13 -f 2019/11/19 -t 2019/12/19
```

## Help

```
cli.js [options]

Export epic and issues that include issue's description and estimate point.

Commands:
  cli.js export [options]  Export epic and issues that include issue's
                           description and estimate point.             [default]

Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  -e, --epicNo    Target ZenHub's Epic No                    [string] [required]
  -f, --fromDate  From date (YYYY/MM/DD)                     [string] [required]
  -t, --toDate    Target ZenHub's Epic No                    [string] [required]
  -d, --destPath  Path of directory to export
        [string] [default: "/Users/tomof/project/pxgrid/epic-exporter/epic.csv"]
```