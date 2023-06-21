namespace GithubAnalyzer.Models
{
    public class Comment
    {
        public Author Author { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string Body { get; set; }

        public string Url { get; set; }
    }
}
