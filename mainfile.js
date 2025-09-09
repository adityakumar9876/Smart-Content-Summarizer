const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mock summarization function (in a real app, you'd use an AI API)
function summarizeText(text, length) {
  // Simple algorithm to create a summary (real implementation would use NLP/AI)
  const sentences = text.split('. ');
  let summaryLength;
  
  switch(length) {
    case 'short':
      summaryLength = Math.max(1, Math.floor(sentences.length * 0.2));
      break;
    case 'detailed':
      summaryLength = Math.max(1, Math.floor(sentences.length * 0.6));
      break;
    default: // medium
      summaryLength = Math.max(1, Math.floor(sentences.length * 0.4));
  }
  
  // Return the first n sentences as a "summary"
  const summary = sentences.slice(0, summaryLength).join('. ') + '.';
  
  // Calculate some stats
  const originalWordCount = text.split(' ').length;
  const summaryWordCount = summary.split(' ').length;
  const reduction = Math.round((1 - (summaryWordCount / originalWordCount)) * 100);
  const timeSaved = Math.round((originalWordCount - summaryWordCount) / 200); // avg reading speed 200 wpm
  
  return {
    summary,
    stats: {
      reduction,
      timeSaved,
      originalWordCount,
      summaryWordCount
    }
  };
}

// Summarization endpoint
app.post('/api/summarize', (req, res) => {
  try {
    const { text, length } = req.body;
    
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Text must be at least 10 characters long' 
      });
    }
    
    // Simulate processing delay
    setTimeout(() => {
      const result = summarizeText(text, length);
      res.json(result);
    }, 1500);
    
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to process the text' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Summarization API is running' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});