namespace GithubAnalyzer.Models
{
    public class Export
    {
        public string ProjectName { get; set; }

        public string RepositoryPath { get; set; }

        public string ProjectDescription { get; set; }

        public DateTime? StartDate { get; set; }

        public int? NumberOfProgrammingLanguagesUsed { get; set; }

        public int? NumberOfPullRequests { get; set; }

        public int? NumberOfOpenPullRequests { get; set; }

        public int? NumberOfClosedButNotMergedPullRequests { get; set; }

        public double? AverageNumberOfPullRequestsPerDay { get; set; }

        public double? AverageNumberOfPullRequestsPerWeek { get; set; }

        public double? AverageNumberOfPullRequestsMergedPerDay { get; set; }

        public double? AverageNumberOfPullRequestsMergedPerWeek { get; set; }

        public string? AverageMergeTime { get; set; }

        public double? AverageNumberOfChangedFilesPerPullRequest { get; set; }

        public double? AverageNumberOfCommitsPerPullRequest { get; set; }

        public double? AverageNumberOfReviewsPerPullRequest { get; set; }

        public string? AverageReviewerResponseTime { get; set; }

        public double? AverageNumberOfReviewersPerPullRequest { get; set; }

        public double? AverageNumberOfGeneralCommentsPerPullRequest { get; set; }

        public double? AverageNumberOfLineCommentsPerPullRequest { get; set; }

        public string? AveragePullRequestOwnerResponseTimeToComments { get; set; }

        public double? AverageNumberOfFollowUpCommits { get; set; }

        public double? AveragePullRequestComplexity { get; set; }

        public int? TotalIssues { get; set; }

        public int? OpenIssues { get; set; }

        public double? AverageNumberOfCommentsPerIssue { get; set; }

        public string? AverageAgeOfOpenIssues { get; set; }

        public string? AverageTimeToCloseAnIssue { get; set; }

        public double? AverageNumberOfAssigneesPerIssue { get; set; }

        public double? AverageNumberOfLabelsPerIssue { get; set; }
    }
}
