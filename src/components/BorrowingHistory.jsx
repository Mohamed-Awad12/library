import { useState, useEffect } from 'react';
import { Calendar, Book, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function BorrowingHistory() {
  const { apiHeaders } = useAuth();
  const [history, setHistory] = useState([]);
  const [currentBorrows, setCurrentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  
  useEffect(() => {
    fetchBorrowingData();
  }, []);

  const fetchBorrowingData = async () => {
    try {
      setLoading(true);
      
      // Fetch current borrows
      const currentResponse = await fetch('/book/user/current', {
        headers: apiHeaders()
      });
      
      // Fetch borrowing history
      const historyResponse = await fetch('/book/user/history', {
        headers: apiHeaders()
      });

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentBorrows(currentData.data || []);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.data || []);
      }
    } catch (error) {
      console.error('Error fetching borrowing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (bookId) => {
    try {
      const response = await fetch(`/book/return/${bookId}`, {
        method: 'POST',
        headers: apiHeaders()
      });

      if (response.ok) {
        fetchBorrowingData(); // Refresh data
      }
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading borrowing history...</p>
      </div>
    );
  }

  return (
    <div className="borrowing-history-page">
      <div className="page-header">
        <h2>Borrowing History</h2>
        <Calendar size={24} />
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          <Clock size={16} />
          Currently Borrowed ({currentBorrows.length})
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Calendar size={16} />
          History ({history.length})
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="current-borrows">
          {currentBorrows.length === 0 ? (
            <div className="empty-state">
              <Book size={64} color="#6c757d" />
              <h3>No Books Currently Borrowed</h3>
              <p>You don't have any books checked out at the moment.</p>
            </div>
          ) : (
            <div className="books-grid">
              {currentBorrows.map((book) => (
                <div key={book._id} className="book-card current-borrow">
                  <div className="book-header">
                    <h3>{book.name}</h3>
                    <span className="badge borrowed">Borrowed</span>
                  </div>
                  
                  <div className="book-details">
                    <p><strong>Author:</strong> {book.author}</p>
                    <p><strong>Pages:</strong> {book.pages}</p>
                    <p><strong>Borrowed:</strong> {formatDate(book.borrowedAt)}</p>
                  </div>

                  <button 
                    className="btn btn-success"
                    onClick={() => returnBook(book._id)}
                  >
                    <CheckCircle size={16} />
                    Return Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="borrowing-history">
          {history.length === 0 ? (
            <div className="empty-state">
              <Calendar size={64} color="#6c757d" />
              <h3>No Borrowing History</h3>
              <p>You haven't borrowed any books yet.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((record, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    <Book size={20} />
                  </div>
                  
                  <div className="history-details">
                    <div className="history-dates">
                      <div className="date-item">
                        <strong>Borrowed:</strong> {formatDate(record.from)}
                      </div>
                      {record.to && (
                        <div className="date-item">
                          <strong>Returned:</strong> {formatDate(record.to)}
                        </div>
                      )}
                      {!record.to && (
                        <div className="date-item">
                          <span className="badge borrowed">Still Borrowed</span>
                        </div>
                      )}
                    </div>
                    
                    {record.to && (
                      <div className="duration">
                        <Clock size={14} />
                        Duration: {Math.ceil((new Date(record.to) - new Date(record.from)) / (1000 * 60 * 60 * 24))} days
                      </div>
                    )}
                  </div>
                  
                  <div className="history-status">
                    {record.to ? (
                      <CheckCircle size={20} color="#28a745" />
                    ) : (
                      <Clock size={20} color="#ffc107" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
