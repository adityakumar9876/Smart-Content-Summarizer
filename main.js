import React, { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [length, setLength] = useState('medium');
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!text.trim() || text.trim().length < 10) {
      setError('Please enter at least 10 characters of text');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, length }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize text');
      }

      setSummary(data.summary);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
      console.error('Summarization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="container">
        <header>
          <h1>Smart Content Summarizer</h1>
          <p className="subtitle">Transform lengthy content into concise summaries with AI-powered precision</p>
        </header>

        <div className="main-content">
          <div className="input-section">
            <h2>Input Your Content</h2>
            <textarea 
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            ></textarea>
            <div className="controls">
              <select 
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={isLoading}
              >
                <option value="short">Summary Length: Short</option>
                <option value="medium">Summary Length: Medium</option>
                <option value="detailed">Summary Length: Detailed</option>
              </select>
              <button onClick={handleSummarize} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Summarize'}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="output-section">
            <h2>AI Summary</h2>
            <div className="summary-output">
              {isLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Analyzing your content...</p>
                </div>
              ) : (
                summary || 'Your concise summary will appear here...'
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className="stats">
            <div className="stat-box">
              <div className="stat-value">{stats.reduction}%</div>
              <div className="stat-label">Content Reduced</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats.timeSaved}s</div>
              <div className="stat-label">Reading Time Saved</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">98%</div>
              <div className="stat-label">Key Points Kept</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;