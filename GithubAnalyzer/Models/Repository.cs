namespace GithubAnalyzer.Models
{
    public class Repository
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string FullPath { get; set; }

        public Owner Owner { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public List<Language> Languages { get; set; }

        public string Description { get; set; }
    }
}
