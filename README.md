# GitHub Miner

GitHub Miner is a tool designed to scrape and analyze GitHub data to provide insightful statistics and information about repository metadat, pull requests, issues andf team collaboration. Here's a quick overview of how to set up and use the tool. This project was generated using the `dxworks-template-node-ts` repository template.

## Table of Contents

1. [Description](#Description)
2. [Features](#Features)
3. [Prerequisites](#Prerequisites)
4. [Installation](#Installation)
5. [Usage](#Usage)
6. [Contributing](#Contributing)
7. [License](#License)

## Description

GitHub Miner is designed to help data scientists, researchers, or curious minds to fetch, analyze, and design visualizations about GitHub data. It uses the GitHub GraphQL API to get relevant information and provides a suite of functions to analyze the data and derive different statistics.

## Features

- Repository Analysis
- Issue Analysis
- Pull Request Analysis

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the [latest version of Node.js and npm](https://nodejs.org/en/download).
- You have installed the [latest version of .NET](https://dotnet.microsoft.com/en-us/download).
- You have a Windows/Linux/Mac machine.
- You have read [GitHub API rate limiting rules](https://docs.github.com/en/graphql/overview/resource-limitations#rate-limit).
- You have a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

## Installation

To install GitHub Miner, follow these steps:

1. Clone the repository

2. Install the requirements for the Node.js project.

```bash
cd github-miner-2/github-miner
npm install
```

## Usage

To use GitHub Miner, follow these steps:

1. Generate a GitHub personal access token.

2. Complete the necessary information in the configuration file [config.yaml](github-miner-2/github-miner/configs/config.yaml). In order to specify the targeted repository for data extraction, provide its name and owner.

3. Start the data extraction proccess by running in the terminal:

```bash
npm run start
```

4. After the data extraction process is completed, a new folder named `exports` is created, containing three files: `issues.json`, `pullRequests.json` and `repositoryInfo.json`. Move or copy these files to the [GithubAnalyzer](github-miner-2/GithubAnalyzer) folder.

5. Start the data analysis process by running in the terminal:

```bash
cd ../GithubAnalyzer
dotnet run ./GithubAnalyzer.csproj
```

6. The final result file is created in the [GithubAnalyzer](github-miner-2/GithubAnalyzer) folder, in `JSON` and `CSV` formats.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[Apache-2.0](https://choosealicense.com/licenses/apache)
