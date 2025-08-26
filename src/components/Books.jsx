import { useState, useEffect } from 'react';
import { Search, Book, Calendar, User, Filter, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Books() {
  const { apiHeaders, token } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, borrowed, published
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, filter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Use public browse endpoint if not authenticated, otherwise use authenticated endpoint
      const endpoint = token ? '/book' : '/book/browse';
      console.log('Fetching books from:', endpoint, 'Token:', !!token);
      
      const response = await fetch(endpoint, {
        headers: token ? apiHeaders() : { 'Content-Type': 'application/json' }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Books data:', data);
        setBooks(data.books || []);
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        setMessage({ text: `Failed to fetch books: ${response.status}`, type: 'error' });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ text: `Error fetching books: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'available':
        filtered = filtered.filter(book => !book.isBorrowed && book.isPublished);
        break;
      case 'borrowed':
        filtered = filtered.filter(book => book.isBorrowed);
        break;
      case 'published':
        filtered = filtered.filter(book => book.isPublished);
        break;
      default:
        break;
    }

    setFilteredBooks(filtered);
  };

  const borrowBook = async (bookId) => {
    try {
      const response = await fetch(`/book/borrow/${bookId}`, {
        method: 'POST',
        headers: apiHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: 'Book borrowed successfully!', type: 'success' });
        fetchBooks(); // Refresh the list
      } else {
        setMessage({ text: data.message || 'Failed to borrow book', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error borrowing book', type: 'error' });
    }
  };

  const returnBook = async (bookId) => {
    try {
      const response = await fetch(`/book/return/${bookId}`, {
        method: 'POST',
        headers: apiHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: 'Book returned successfully!', type: 'success' });
        fetchBooks(); // Refresh the list
      } else {
        setMessage({ text: data.message || 'Failed to return book', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error returning book', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div className="books-page">
      <div className="page-header">
        <h2>Library Books</h2>
        <p className="muted">Discover and manage your book collection</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="books-controls">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Books</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="books-grid">
          {filteredBooks.map(book => (
            <div key={book._id} className="book-card">
              <div className="book-header">
                <h3 className="book-title">{book.name}</h3>
                <div className={`book-status ${book.isBorrowed ? 'borrowed' : 'available'}`}>
                  {book.isBorrowed ? 'Borrowed' : 'Available'}
                </div>
              </div>

              <div className="book-details">
                <div className="book-author">
                  <User size={16} />
                  <span>{book.author}</span>
                </div>
                <div className="book-pages">
                  <Book size={16} />
                  <span>{book.pages} pages</span>
                </div>
                <div className="book-date">
                  <Calendar size={16} />
                  <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {book.isPublished && (
                <div className="book-actions">
                  {book.isBorrowed ? (
                    <button
                      onClick={() => returnBook(book._id)}
                      className="btn-secondary btn-full"
                    >
                      Return Book
                    </button>
                  ) : (
                    <button
                      onClick={() => borrowBook(book._id)}
                      className="btn-primary btn-full"
                    >
                      Borrow Book
                    </button>
                  )}
                </div>
              )}

              {!book.isPublished && (
                <div className="book-status-info">
                  <p className="muted">This book is not yet published</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Book size={64} className="muted" />
          <h3>No books found</h3>
          <p className="muted">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No books available in the library yet'
            }
          </p>
        </div>
      )}
    </div>
  );
}
