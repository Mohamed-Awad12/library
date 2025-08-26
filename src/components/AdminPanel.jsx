import { useState, useEffect } from 'react';
import { CheckCircle, Users, BookOpen, Shield, UserPlus, UserX, Trash2, Ban, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AdminPanel() {
  const { apiHeaders, user } = useAuth();
  const [unpublishedBooks, setUnpublishedBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    console.log('AdminPanel mounted, user:', user);
    console.log('API headers:', apiHeaders());
    fetchUnpublishedBooks();
    fetchUsers();
  }, []);

  const fetchUnpublishedBooks = async () => {
    console.log('Fetching unpublished books...');
    try {
      const response = await fetch('/book/unpublished', {
        headers: apiHeaders()
      });
      
      console.log('Unpublished books response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Unpublished books data:', data);
        setUnpublishedBooks(data.book || []);
      } else {
        console.error('Failed to fetch unpublished books:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setMessage({ text: 'Failed to load pending books', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching unpublished books:', error);
      setMessage({ text: 'Error loading pending books', type: 'error' });
    }
  };

  const fetchUsers = async () => {
    console.log('Fetching users...');
    try {
      const response = await fetch('/user/', {
        headers: apiHeaders()
      });
      
      console.log('Users response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Users data:', data);
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setMessage({ text: 'Failed to load users', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ text: 'Error loading users', type: 'error' });
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
        setMessage({ text: 'Book approved and published successfully!', type: 'success' });
        fetchUnpublishedBooks(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to approve book', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error approving book', type: 'error' });
    }
  };

  const makeAdmin = async (userId) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;
    
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

  const blockUser = async (userId) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    
    try {
      const response = await fetch(`/user/block/${userId}`, {
        method: 'PUT',
        headers: apiHeaders()
      });
      
      if (response.ok) {
        setMessage({ text: 'User blocked successfully!', type: 'success' });
        fetchUsers(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to block user', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error blocking user', type: 'error' });
    }
  };

  const unblockUser = async (userId) => {
    if (!confirm('Are you sure you want to unblock this user?')) return;
    
    try {
      const response = await fetch(`/user/unblock/${userId}`, {
        method: 'PUT',
        headers: apiHeaders()
      });
      
      if (response.ok) {
        setMessage({ text: 'User unblocked successfully!', type: 'success' });
        fetchUsers(); // Refresh the list
      } else {
        setMessage({ text: 'Failed to unblock user', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error unblocking user', type: 'error' });
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their books and cannot be undone.')) return;
    
    try {
      const response = await fetch(`/user/delete/${userId}`, {
        method: 'DELETE',
        headers: apiHeaders()
      });
      
      if (response.ok) {
        setMessage({ text: 'User deleted successfully!', type: 'success' });
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        setMessage({ text: data.message || 'Failed to delete user', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error deleting user', type: 'error' });
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
                  <th>Status</th>
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
                    <td>
                      <span className={`status ${userItem.isBlocked ? 'blocked' : 'active'}`}>
                        {userItem.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-actions">
                        {!userItem.isAdmin && userItem._id !== user.id && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => makeAdmin(userItem._id)}
                          >
                            <UserPlus size={14} />
                            Make Admin
                          </button>
                        )}
                        
                        {userItem._id !== user.id && (
                          <>
                            {userItem.isBlocked ? (
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => unblockUser(userItem._id)}
                              >
                                <RotateCcw size={14} />
                                Unblock
                              </button>
                            ) : (
                              <button 
                                className="btn btn-warning btn-sm"
                                onClick={() => blockUser(userItem._id)}
                              >
                                <Ban size={14} />
                                Block
                              </button>
                            )}
                            
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteUser(userItem._id)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
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
