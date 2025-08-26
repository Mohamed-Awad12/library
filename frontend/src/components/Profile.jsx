import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Book, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Profile() {
  const { user, apiHeaders } = useAuth();
  const [userBooks, setUserBooks] = useState({
    published: [],
    borrowed: []
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || ''
      });
    }
    fetchUserBooks();
  }, [user]);

  const fetchUserBooks = async () => {
    try {
      setLoading(true);
      
      // Fetch published books
      const publishedResponse = await fetch('/book/published', {
        headers: apiHeaders()
      });
      
      // Fetch borrowed books
      const borrowedResponse = await fetch('/book/borrowed', {
        headers: apiHeaders()
      });

      const publishedData = await publishedResponse.json();
      const borrowedData = await borrowedResponse.json();

      setUserBooks({
        published: publishedData.books || [],
        borrowed: borrowedData.books || []
      });
    } catch (error) {
      console.error('Error fetching user books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = async () => {
    try {
      const response = await fetch('/user/profile', {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        setEditing(false);
        // You might want to refresh user data here
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const cancelEdit = () => {
    setEditData({
      username: user?.username || '',
      email: user?.email || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h2>Profile</h2>
        <p className="muted">Manage your account and view your library activity</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={48} />
            </div>
            <div className="profile-info">
              {editing ? (
                <div className="edit-form">
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleEditChange}
                    className="edit-input"
                    placeholder="Username"
                  />
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    className="edit-input"
                    placeholder="Email"
                  />
                  <div className="edit-actions">
                    <button onClick={saveProfile} className="btn-primary">
                      <Save size={16} />
                      Save
                    </button>
                    <button onClick={cancelEdit} className="btn-secondary">
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{user?.username}</h3>
                  <div className="profile-details">
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>{user?.email}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="books-sections">
          <div className="books-section">
            <h3>Published Books ({userBooks.published.length})</h3>
            {userBooks.published.length > 0 ? (
              <div className="books-list">
                {userBooks.published.map(book => (
                  <div key={book._id} className="book-item">
                    <div className="book-info">
                      <h4>{book.name}</h4>
                      <div className="book-meta">
                        <span className="pages">{book.pages} pages</span>
                        <span className={`status ${book.isBorrowed ? 'borrowed' : 'available'}`}>
                          {book.isBorrowed ? 'Currently Borrowed' : 'Available'}
                        </span>
                        {book.borrowedBy && (
                          <span className="borrowed-by">
                            Borrowed by: {book.borrowedBy.username}
                          </span>
                        )}
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
                <p>You haven't published any books yet</p>
                <a href="/publish" className="btn-primary">
                  Publish Your First Book
                </a>
              </div>
            )}
          </div>

          <div className="books-section">
            <h3>Borrowed Books ({userBooks.borrowed.length})</h3>
            {userBooks.borrowed.length > 0 ? (
              <div className="books-list">
                {userBooks.borrowed.map(book => (
                  <div key={book._id} className="book-item">
                    <div className="book-info">
                      <h4>{book.name}</h4>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-meta">
                        <span className="pages">{book.pages} pages</span>
                        {book.borrowedAt && (
                          <span className="borrowed-date">
                            Borrowed: {new Date(book.borrowedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="book-actions">
                      <button
                        onClick={() => {
                          // Implement return book functionality
                          console.log('Return book:', book._id);
                        }}
                        className="btn-secondary"
                      >
                        Return Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Book size={48} className="muted" />
                <p>You haven't borrowed any books yet</p>
                <a href="/books" className="btn-primary">
                  Browse Available Books
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
