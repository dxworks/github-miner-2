namespace GithubAnalyzer.Models
{
    public class Commit
    {
        public string Sha { get; set; }

        public Author Author { get; set; }

        public string Message { get; set; }

        public string Url { get; set; }

        public DateTime? Date { get; set; }

        public int ChangedFiles { get; set; }
    }
}
