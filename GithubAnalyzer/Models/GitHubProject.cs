namespace GithubAnalyzer.Models
{
    public class GitHubProject
    {
        public List<Issue> Issues { get; set; }

        public List<PullRequest> PullRequests { get; set; }

        public Repository RepositoryInfo { get; set; }
    }
}
