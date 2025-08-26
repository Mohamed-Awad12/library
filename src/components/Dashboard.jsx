import { useState, useEffect } from 'react';
import { Book, Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Dashboard() {
  const { user, apiHeaders } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    publishedBooks: 0,
    recentActivity: []
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all books
      const booksResponse = await fetch('/book', {
        headers: apiHeaders()
      });
      const booksData = await booksResponse.json();
      
      // Fetch user's borrowed books
      const borrowedResponse = await fetch('/book/borrowed', {
        headers: apiHeaders()
      });
      const borrowedData = await borrowedResponse.json();

      // Fetch user's published books
      const publishedResponse = await fetch('/book/published', {
        headers: apiHeaders()
      });
      const publishedData = await publishedResponse.json();

      if (booksData.books) {
        setStats({
          totalBooks: booksData.books.length,
          borrowedBooks: borrowedData.books ? borrowedData.books.length : 0,
          publishedBooks: publishedData.books ? publishedData.books.length : 0,
          recentActivity: []
        });

        // Get recent books (last 5)
        const recent = booksData.books
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentBooks(recent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {user?.username || 'User'}!</h2>
        <p className="muted">Here's what's happening in your library</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Book />
          </div>
          <div className="stat-content">
            <h3>{stats.totalBooks}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon borrowed">
            <Clock />
          </div>
          <div className="stat-content">
            <h3>{stats.borrowedBooks}</h3>
            <p>Borrowed Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon published">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.publishedBooks}</h3>
            <p>Published Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <User />
          </div>
          <div className="stat-content">
            <h3>Active</h3>
            <p>Account Status</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-books">
          <h3>Recent Books</h3>
          {recentBooks.length > 0 ? (
            <div className="books-list">
              {recentBooks.map(book => (
                <div key={book._id} className="book-item">
                  <div className="book-info">
                    <h4>{book.name}</h4>
                    <p className="book-author">by {book.author}</p>
                    <div className="book-meta">
                      <span className="pages">{book.pages} pages</span>
                      <span className={`status ${book.isBorrowed ? 'borrowed' : 'available'}`}>
                        {book.isBorrowed ? 'Borrowed' : 'Available'}
                      </span>
                    </div>
                  </div>
                  <div className="book-date">
                    <Calendar size={16} />
                    <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Book size={48} className="muted" />
              <p>No books available yet</p>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-list">
            <a href="/books" className="action-item">
              <Book />
              <span>Browse Books</span>
            </a>
            <a href="/publish" className="action-item">
              <CheckCircle />
              <span>Publish Book</span>
            </a>
            <a href="/profile" className="action-item">
              <User />
              <span>View Profile</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
