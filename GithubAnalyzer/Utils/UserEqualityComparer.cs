using GithubAnalyzer.Models;

namespace GithubAnalyzer.Utils
{
    public class UserEqualityComparer : IEqualityComparer<Author>
    {
        public bool Equals(Author x, Author y)
        {
            if (x == null && y == null)
                return true;
            if (x == null || y == null)
                return false;

            return x.Login == y.Login;
        }

        public int GetHashCode(Author obj)
        {
            return obj.Login.GetHashCode();
        }
    }
}
