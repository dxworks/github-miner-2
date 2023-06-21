using GithubAnalyzer.Models;

namespace GithubAnalyzer.Utils
{
    public class MetricsCalculator
    {
        public static double GetPullRequestComplexityIndex(PullRequest pullRequest)
        {
            var index = 0.0;

            index += pullRequest.Commits.Count * 0.2;
            index += pullRequest.ChangedFiles * 0.2;
            index += pullRequest.Reviews.Select(r => r.User).Distinct(new UserEqualityComparer()).Count() * 0.15;
            index += (pullRequest.Comments.Count + pullRequest.Reviews.Sum(review => review.Comments.Count)) * 0.15;
            index += (pullRequest.MergedAt.Value - pullRequest.CreatedAt.Value).TotalHours * 0.15;
            index += pullRequest.Commits.Count(c => c.Date.Value > pullRequest.CreatedAt.Value) * 0.15;

            return index;
        }
    }
}
