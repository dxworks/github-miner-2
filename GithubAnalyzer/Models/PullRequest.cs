namespace GithubAnalyzer.Models
{
    public class PullRequest
    {
        public int Number { get; set; }

        public string Title { get; set; }

        public string Body { get; set; }

        public int ChangedFiles { get; set; }

        public List<Commit> Commits { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? MergedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        public string State { get; set; } 

        public Author CreatedBy { get; set; }

        public List<Comment> Comments { get; set; }

        public List<Author> Assignees { get; set; }

        public List<Label> Labels { get; set; }

        public Author MergedBy { get; set; }

        public List<Review> Reviews { get; set; }

        public List<ReviewRequest> ReviewRequests { get; set; }
    }
}
