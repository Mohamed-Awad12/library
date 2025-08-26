import { useState, useEffect } from 'react';
import { Book, Edit, Trash2, Eye, EyeOff, Calendar, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function MyBooks() {
  const { apiHeaders } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editData, setEditData] = useState({ name: '', pages: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/book/myBooks', {
        headers: apiHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setBooks(data.book || []);
      } else {
        setMessage({ text: 'Failed to fetch your books', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error fetching books', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (book) => {
    setEditingBook(book._id);
    setEditData({ name: book.name, pages: book.pages });
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setEditData({ name: '', pages: '' });
  };

  const saveEdit = async (bookId) => {
    try {
      const response = await fetch(`/book/${bookId}`, {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify(editData)
      });
      
      if (response.ok) {
        setMessage({ text: 'Book updated successfully!', type: 'success' });
        setEditingBook(null);
        fetchMyBooks(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to update book', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error updating book', type: 'error' });
    }
  };

  const deleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await fetch(`/book/${bookId}`, {
        method: 'DELETE',
        headers: apiHeaders()
      });
      
      if (response.ok) {
        setMessage({ text: 'Book deleted successfully!', type: 'success' });
        fetchMyBooks(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to delete book', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error deleting book', type: 'error' });
    }
  };

  const togglePublishStatus = async (book) => {
    try {
      const endpoint = book.isPublished ? `/book/unpublish/${book._id}` : `/book/unpublished/${book._id}`;
      const response = await fetch(endpoint, {
        headers: apiHeaders()
      });
      
      if (response.ok) {
        const action = book.isPublished ? 'unpublished' : 'published';
        setMessage({ text: `Book ${action} successfully!`, type: 'success' });
        fetchMyBooks(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to update book status', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error updating book status', type: 'error' });
    }
  };

  const viewHistory = async (bookId) => {
    try {
      const response = await fetch(`/book/history/${bookId}`, {
        headers: apiHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Book History:\\n${data.data.join('\\n')}`);
      }
    } catch (error) {
      console.error('Error fetching book history:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your books...</p>
      </div>
    );
  }

  return (
    <div className="my-books-page">
      <div className="page-header">
        <h2>My Books</h2>
        <Book size={24} />
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {books.length === 0 ? (
        <div className="empty-state">
          <Book size={64} color="#6c757d" />
          <h3>No Books Yet</h3>
          <p>You haven't published any books yet. Start by publishing your first book!</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              {editingBook === book._id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    placeholder="Book title"
                  />
                  <input
                    type="number"
                    value={editData.pages}
                    onChange={(e) => setEditData({...editData, pages: e.target.value})}
                    placeholder="Number of pages"
                  />
                  <div className="edit-actions">
                    <button className="btn btn-success btn-sm" onClick={() => saveEdit(book._id)}>
                      Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="book-header">
                    <h3>{book.name}</h3>
                    <div className="book-status">
                      <span className={`status ${book.isPublished ? 'published' : 'unpublished'}`}>
                        {book.isPublished ? 'Published' : 'Unpublished'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="book-details">
                    <p><strong>Pages:</strong> {book.pages}</p>
                    <p><strong>Created:</strong> {new Date(book.createdAt).toLocaleDateString()}</p>
                    {book.isBorrowed && (
                      <p className="borrowed-info">
                        <Users size={16} />
                        Currently borrowed
                      </p>
                    )}
                  </div>

                  <div className="book-actions">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => startEdit(book)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    
                    <button 
                      className={`btn btn-sm ${book.isPublished ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => togglePublishStatus(book)}
                    >
                      {book.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      {book.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => viewHistory(book._id)}
                    >
                      <Calendar size={14} />
                      History
                    </button>
                    
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteBook(book._id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
