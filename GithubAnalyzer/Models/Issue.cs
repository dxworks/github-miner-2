namespace GithubAnalyzer.Models
{
    public class Issue
    {
        public int Number { get; set; }

        public int Title { get; set; }

        public string Body { get; set; }

        public string State { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        public Author CreatedBy { get; set; }

        public List<Comment> Comments { get; set; }

        public List<Author> Assignees { get; set; }

        public List<Label> Labels { get; set; }
    }
}
