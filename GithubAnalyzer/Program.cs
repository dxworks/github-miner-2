// See https://aka.ms/new-console-template for more information

using System.Text.Json;
using GithubAnalyzer.Utils;
using GithubAnalyzer.Models;
using System.Text;

// parse json files

var options = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    WriteIndented = true
};
var issuesBytes = File.ReadAllBytes("issues.json");
var issues = JsonSerializer.Deserialize<List<Issue>>(issuesBytes, options);

var pullRequestsBytes = File.ReadAllBytes("pullRequests.json");
var pullRequests = JsonSerializer.Deserialize<List<PullRequest>>(pullRequestsBytes, options);

var repositoryBytes = File.ReadAllBytes("repositoryInfo.json");
var repository = JsonSerializer.Deserialize<Repository>(repositoryBytes, options);

var export = new Export();

// repository details

export.ProjectName = repository.Name;

export.RepositoryPath = repository.FullPath.Substring(1);

export.ProjectDescription = repository.Description;

export.StartDate = repository.CreatedAt;

export.NumberOfProgrammingLanguagesUsed = repository.Languages.Count;

// PULL REQUESTS

// number of all PRs
export.NumberOfPullRequests = pullRequests.Count;

// numarul de pull requests care sunt open
var numberOfOpenPRs = pullRequests.Count(pr => pr.State == "OPEN");
export.NumberOfOpenPullRequests = numberOfOpenPRs;

// numarul de pull requests care sunt closed, dar nu au fost merge-uite.
var numberOfClosedAndNotMergedPRs = pullRequests.Count(pr => pr is { State: "CLOSED", MergedAt: null });
export.NumberOfClosedButNotMergedPullRequests = numberOfClosedAndNotMergedPRs;

// numarul mediu de pull requesturi pe zi/saptamana.
var firstPRDate = pullRequests.MinBy(pr => pr.CreatedAt).CreatedAt;
var lastPRDate = pullRequests.MaxBy(pr => pr.CreatedAt).CreatedAt;

var numberOfDaysBetweenDates = (lastPRDate - firstPRDate).Value.Days;
if (numberOfDaysBetweenDates == 0)
{
    numberOfDaysBetweenDates = 1;
}

var numberOfWeeksBetweenDates = numberOfDaysBetweenDates / 7;
if (numberOfWeeksBetweenDates == 0)
{
    numberOfWeeksBetweenDates = 1;
}
var averageNumberOfPRsPerWeek = (double)pullRequests.Count / numberOfWeeksBetweenDates;
var averageNumberOfPRsPerDay = (double)pullRequests.Count / numberOfDaysBetweenDates;

export.AverageNumberOfPullRequestsPerDay = Math.Round(averageNumberOfPRsPerDay, 2);
export.AverageNumberOfPullRequestsPerWeek = Math.Round(averageNumberOfPRsPerWeek, 2);

// numarul mediu de pull requesturi merge-uite pe zi/saptamana
var mergedPRs = pullRequests.Where(pr => pr.MergedAt.HasValue).ToList();
var averageNumberOfPRsMergedPerDay = (double)mergedPRs.Count / numberOfDaysBetweenDates;
var averageNumberOfPRsMergedPerWeek = (double)mergedPRs.Count / numberOfWeeksBetweenDates;

export.AverageNumberOfPullRequestsMergedPerDay = Math.Round(averageNumberOfPRsMergedPerDay, 2);
export.AverageNumberOfPullRequestsMergedPerWeek = Math.Round(averageNumberOfPRsMergedPerWeek, 2);

// timpul mediu de merge al unui PR
var averageMergeTimeInSeconds = pullRequests
    .Where(pr => pr.MergedAt.HasValue)
    .Average(pr => (pr.MergedAt.Value - pr.CreatedAt.Value).TotalSeconds);

var averageMergeTime = TimeSpan.FromSeconds(averageMergeTimeInSeconds);

export.AverageMergeTime = averageMergeTime.ToString(@"dd':'hh':'mm':'ss");

// average number of changed files per PR
var averageNumberOfChangedFilesPerPR = pullRequests.Average(pr => pr.ChangedFiles);

export.AverageNumberOfChangedFilesPerPullRequest = Math.Round(averageNumberOfChangedFilesPerPR, 2);

// average number of commits per PR
var averageNumberOfCommitsPerPR = pullRequests.Average(pr => pr.Commits.Count);

export.AverageNumberOfCommitsPerPullRequest = Math.Round(averageNumberOfCommitsPerPR, 2);

// numarul mediu de reviews la fiecare pull request
var totalNumberOfReviews = pullRequests.Sum(pr => pr.Reviews.Count);
var averageNumberOfReviewsPerPR = (double)totalNumberOfReviews / pullRequests.Count;

export.AverageNumberOfReviewsPerPullRequest = Math.Round(averageNumberOfReviewsPerPR, 2);

// timpul mediu de raspuns al reviewers
var averageReviewTimeInSeconds = pullRequests
    .Where(pr => pr.Reviews.Count > 0)
    .Average(pr => (pr.Reviews.OrderBy(r => r.SubmittedAt).FirstOrDefault().SubmittedAt.Value - pr.CreatedAt.Value).TotalSeconds);
var averageReviewTime = TimeSpan.FromSeconds(averageReviewTimeInSeconds);

export.AverageReviewerResponseTime = averageReviewTime.ToString(@"dd':'hh':'mm':'ss");

//average reviewers pe PR
var averageNumberOfReviewersPerPR = pullRequests
    .Where(pr => pr.Reviews.Count > 0)
    .Average(pr => pr.Reviews.Select(r => r.User).Distinct(new UserEqualityComparer()).Count());

export.AverageNumberOfReviewersPerPullRequest = Math.Round(averageNumberOfReviewersPerPR, 2);

//numarul mediu de comentarii generale la fiecare pull request
var totalNumberOfGeneralComments = pullRequests.Sum(pr => pr.Comments.Count);
var averageNumberOfGeneralCommentsPerPR = (double)totalNumberOfGeneralComments / pullRequests.Count;

export.AverageNumberOfGeneralCommentsPerPullRequest = Math.Round(averageNumberOfGeneralCommentsPerPR, 2);

// numarul mediu de line comments la fiecare pr
var totalNumberOfLineComments = pullRequests.Sum(pr => pr.Reviews.Sum(review => review.Comments.Count));
var averageNumberOfLineCommentsPerPR = (double)totalNumberOfLineComments / pullRequests.Count;

export.AverageNumberOfLineCommentsPerPullRequest = Math.Round(averageNumberOfLineCommentsPerPR, 2);

// timpul mediu de raspuns al PR owner-ului la comments
var averageCommentsResponseTime = TimeSpan.FromSeconds(pullRequests
        .Select(pr => pr.Comments.Concat(pr.Reviews.SelectMany(r => r.Comments))
        .Where(c => c.Author == pr.CreatedBy)
        .Select(c => c.CreatedAt.Value - pr.CreatedAt.Value)
        .Sum(c => c.TotalSeconds))
        .Sum() / pullRequests.Count);

export.AveragePullRequestOwnerResponseTimeToComments = averageCommentsResponseTime.ToString(@"dd':'hh':'mm':'ss");

// numarul mediu de follow up commits
var averageFollowUpCommits = pullRequests
    .Average(pr => pr.Commits.Count(c => c.Date.Value > pr.CreatedAt.Value));

export.AverageNumberOfFollowUpCommits = Math.Round(averageFollowUpCommits, 2);

// complexitatea medie a unui PR
var averagePullRequestComplexity = pullRequests
    .Where(pr => pr.MergedAt.HasValue)
    .Average(pr => MetricsCalculator.GetPullRequestComplexityIndex(pr));

export.AveragePullRequestComplexity = Math.Round(averagePullRequestComplexity, 2);

// numarul de PR-uri merged in ultimele 12 luni, in fiecare luna
IDictionary<int, int> mergedPrsForEachMonth = new Dictionary<int, int>();
for (int i = 1; i <= 12; i++)
{
    int month = DateTime.Now.Month - i;
    int year = DateTime.Now.Year;

    if (month < 1)
    {
        month = 12 - Math.Abs(month);
        year--;
    }
    
    var mergedPrsPerMonth = pullRequests
        .Where(pr =>
            pr.MergedAt.HasValue &&
            pr.MergedAt.Value.Month.Equals(month) && 
            pr.MergedAt.Value.Year.Equals(year))
        .ToList().Count;
    mergedPrsForEachMonth.Add(month, mergedPrsPerMonth);
}

export.MergedPrsPerMonthInTheLastYear = mergedPrsForEachMonth;

// numarul de PR-uri create in ultimele 12 luni, in fiecare luna
IDictionary<int, int> createdPrsForEachMonth = new Dictionary<int, int>();
for (int i = 1; i <= 12; i++)
{
    int month = DateTime.Now.Month - i;
    int year = DateTime.Now.Year;

    if (month < 1)
    {
        month = 12 - Math.Abs(month);
        year--;
    }
    
    var createdPrsPerMonth = pullRequests
        .Where(pr =>
            pr.CreatedAt.HasValue &&
            pr.CreatedAt.Value.Month.Equals(month) && 
            pr.CreatedAt.Value.Year.Equals(year))
        .ToList().Count;
    createdPrsForEachMonth.Add(month, createdPrsPerMonth);
}

export.CreatedPrsPerMonthInTheLastYear = createdPrsForEachMonth; 

// ISSUE METRICS

// total number of issues
var totalIssues = issues.Count();
export.TotalIssues = totalIssues;

// number of open issues
var openIssues = issues.Count(issue => issue.State == "OPEN");
export.OpenIssues = openIssues;

// average Number of Comments per Issue
var averageNumberOfCommentsPerIssue = issues.Average(issue => issue.Comments.Count);
export.AverageNumberOfCommentsPerIssue = Math.Round(averageNumberOfCommentsPerIssue, 2);

// average age of open issues
var latestIssue = issues.OrderByDescending(issue => issue.CreatedAt).FirstOrDefault();

var averageAgeOfOpenIssues = TimeSpan.FromSeconds(issues
    .Where(issue => issue.State == "OPEN")
    .Average(issue => (latestIssue.CreatedAt.Value - issue.CreatedAt.Value).TotalSeconds));

export.AverageAgeOfOpenIssues = averageAgeOfOpenIssues.ToString(@"dd':'hh':'mm':'ss");

// average time to close issues
var averageTimeToCloseIssues = TimeSpan.FromSeconds(issues
    .Where(issue => issue.State == "CLOSED")
    .Average(issue => (issue.ClosedAt.Value - issue.CreatedAt.Value).TotalSeconds));

export.AverageTimeToCloseAnIssue = averageTimeToCloseIssues.ToString(@"dd':'hh':'mm':'ss");

// average number of assignees
var averageNumberOfAssigneesPerIssue = issues.Average(issue => issue.Assignees.Count);
export.AverageNumberOfAssigneesPerIssue = Math.Round(averageNumberOfAssigneesPerIssue, 2);

// average number of labels per issue
var averageNumberOfLabelsPerIssue = issues.Average(issue => issue.Labels.Count);
export.AverageNumberOfLabelsPerIssue = Math.Round(averageNumberOfLabelsPerIssue, 2);


// write exports

var json = JsonSerializer.Serialize(export, options);
var filePath = $"{repository.Owner.Name}_{repository.Name}.json";
File.WriteAllText(filePath, json);

var csvFilePath = $"{repository.Owner.Name}_{repository.Name}.csv";
var csvContent = new StringBuilder();

// Assuming `export` is an object with properties that you want to export to CSV
var properties = export.GetType().GetProperties();

// Export property names as the first line in the CSV file
var propertyNamesLine = string.Join(",", properties.Select(p => p.Name));
csvContent.AppendLine(propertyNamesLine);

// Export property values as the second line in the CSV file
var propertyValuesLine = string.Join(",", properties.Select(p => p.GetValue(export)?.ToString()));
csvContent.AppendLine(propertyValuesLine);

File.WriteAllText(csvFilePath, csvContent.ToString());