import { useState, useEffect } from 'react';
import { CheckCircle, Users, BookOpen, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AdminPanel() {
  const { apiHeaders, user } = useAuth();
  const [unpublishedBooks, setUnpublishedBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUnpublishedBooks();
    fetchUsers();
  }, []);

  const fetchUnpublishedBooks = async () => {
    try {
      const response = await fetch('/book/unpublished', {
        headers: apiHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnpublishedBooks(data.book || []);
      }
    } catch (error) {
      console.error('Error fetching unpublished books:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/user/', {
        headers: apiHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveBook = async (bookId) => {
    try {
      const response = await fetch(`/book/unpublished/${bookId}`, {
        headers: apiHeaders()
      });
      
      if (response.ok) {
        setMessage({ text: 'Book approved successfully!', type: 'success' });
        fetchUnpublishedBooks(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to approve book', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error approving book', type: 'error' });
    }
  };

  const makeAdmin = async (userId) => {
    try {
      const response = await fetch(`/user/makeAdmin/${userId}`, {
        method: 'PUT',
        headers: apiHeaders()
      });
      
      if (response.ok) {
        setMessage({ text: 'User promoted to admin successfully!', type: 'success' });
        fetchUsers(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to promote user', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error promoting user', type: 'error' });
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="unauthorized">
        <Shield size={64} color="#dc3545" />
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="page-header">
        <h2>Admin Panel</h2>
        <Shield size={24} />
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-sections">
        {/* Unpublished Books Section */}
        <section className="admin-section">
          <h3>
            <BookOpen size={20} />
            Pending Books Approval ({unpublishedBooks.length})
          </h3>
          
          {unpublishedBooks.length === 0 ? (
            <p className="empty-state">No books pending approval</p>
          ) : (
            <div className="books-grid">
              {unpublishedBooks.map((book) => (
                <div key={book._id} className="book-card">
                  <h4>{book.name}</h4>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-pages">{book.pages} pages</p>
                  <p className="book-date">
                    Submitted: {new Date(book.createdAt).toLocaleDateString()}
                  </p>
                  
                  <button 
                    className="btn btn-success"
                    onClick={() => approveBook(book._id)}
                  >
                    <CheckCircle size={16} />
                    Approve & Publish
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Users Management Section */}
        <section className="admin-section">
          <h3>
            <Users size={20} />
            User Management ({users.length})
          </h3>
          
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Admin</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td>{userItem.username}</td>
                    <td>{userItem.email}</td>
                    <td>
                      <span className={`status ${userItem.isAdmin ? 'admin' : 'user'}`}>
                        {userItem.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                    <td>
                      {!userItem.isAdmin && userItem._id !== user.id && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => makeAdmin(userItem._id)}
                        >
                          <UserPlus size={14} />
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
