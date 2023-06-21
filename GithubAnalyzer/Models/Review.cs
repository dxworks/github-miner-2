namespace GithubAnalyzer.Models
{
    public class Review
    {
        public string State { get; set; }

        public Author User { get; set; }

        public string Body { get; set; }

        public DateTime? SubmittedAt { get; set; }

        public List<Comment> Comments { get; set; }
    }

}
