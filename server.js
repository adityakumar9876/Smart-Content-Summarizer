const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Summarization endpoint with OpenAI integration
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, length } = req.body;
    
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Text must be at least 10 characters long' 
      });
    }
    
    // Determine summary length parameters
    let maxTokens, promptSuffix;
    switch(length) {
      case 'short':
        maxTokens = 100;
        promptSuffix = 'in about 2-3 sentences';
        break;
      case 'detailed':
        maxTokens = 300;
        promptSuffix = 'in a detailed paragraph';
        break;
      default: // medium
        maxTokens = 150;
        promptSuffix = 'in about 4-5 sentences';
    }
    
    // Call OpenAI API
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes content concisely while preserving key information.'
        },
        {
          role: 'user',
          content: `Please summarize the following text ${promptSuffix}:\n\n${text}`
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const summary = response.data.choices[0].message.content.trim();
    
    // Calculate statistics
    const originalWordCount = text.split(' ').length;
    const summaryWordCount = summary.split(' ').length;
    const reduction = Math.round((1 - (summaryWordCount / originalWordCount)) * 100);
    const timeSaved = Math.round((originalWordCount - summaryWordCount) / 200); // avg reading speed 200 wpm
    
    res.json({
      summary,
      stats: {
        reduction,
        timeSaved,
        originalWordCount,
        summaryWordCount
      }
    });
    
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Invalid OpenAI API key' });
    } else if (error.response?.status === 429) {
      return res.status(500).json({ error: 'OpenAI API rate limit exceeded' });
    } else if (error.response?.status === 503) {
      return res.status(500).json({ error: 'OpenAI API is temporarily unavailable' });
    }
    
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