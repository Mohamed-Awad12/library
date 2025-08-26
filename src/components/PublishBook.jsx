import { useState } from 'react';
import { Book, User, FileText, Hash, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function PublishBook() {
  const { apiHeaders } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    pages: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ text: 'Book name is required', type: 'error' });
      return;
    }

    if (!formData.pages || formData.pages <= 0) {
      setMessage({ text: 'Please enter a valid number of pages', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/book/publish', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          pages: parseInt(formData.pages)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Book submitted for approval successfully! An admin will review it before publishing.', type: 'success' });
        setFormData({ name: '', pages: '' });
      } else {
        setMessage({ text: data.message || 'Failed to submit book', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error submitting book', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publish-page">
      <div className="page-header">
        <h2>Submit a Book for Publication</h2>
        <p className="muted">Submit your book for admin approval before publication</p>
      </div>

      <div className="publish-container">
        <div className="publish-form-card">
          <div className="form-header">
            <div className="form-icon">
              <Book />
            </div>
            <h3>Book Details</h3>
            <p className="muted">Your book will be reviewed by an admin before being published</p>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="publish-form">
            <div className="form-group">
              <label htmlFor="name">Book Title</label>
              <div className="input-group">
                <FileText className="input-icon" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter the book title"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pages">Number of Pages</label>
              <div className="input-group">
                <Hash className="input-icon" size={18} />
                <input
                  type="number"
                  id="pages"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  placeholder="Enter number of pages"
                  min="1"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              <Send size={18} />
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        </div>

        <div className="publish-info">
          <div className="info-card">
            <h4>Publishing Guidelines</h4>
            <ul>
              <li>Ensure your book title is accurate and descriptive</li>
              <li>Double-check the page count for accuracy</li>
              <li>Your book will be reviewed by an admin before publication</li>
              <li>Once approved, your book will be available for borrowing</li>
              <li>You can track who borrows your book from your profile</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>What happens next?</h4>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Book is published</h5>
                  <p>Your book becomes available in the library</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Users can borrow</h5>
                  <p>Other users can borrow and return your book</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Track activity</h5>
                  <p>Monitor borrowing activity from your dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
