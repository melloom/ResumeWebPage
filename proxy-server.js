const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Parse JSON body
app.use(express.json());

// Handle OAuth token exchange
app.post('/oauth/token', async (req, res) => {
  try {
    const { client_id, client_secret, code, redirect_uri } = req.body;
    
    console.log('Received OAuth request:', { client_id, redirect_uri });
    console.log('Exchanging OAuth code for token...');
    
    // Exchange code for access token using Node.js built-in fetch
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        redirect_uri,
      }),
    });

    const data = await response.json();
    console.log('Token exchange response:', data);

    if (!response.ok) {
      console.error('GitHub API error:', response.status, data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('This handles OAuth token exchange for development');
  console.log('Health check: http://localhost:3001/health');
});