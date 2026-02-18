const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' }); // Load environment variables from .env.local file

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

// ElevenLabs proxy endpoint
app.post('/api/elevenlabs/text-to-speech/:voiceId', async (req, res) => {
  try {
    const { voiceId } = req.params;
    const { text, model_id = 'eleven_monolingual_v1', voice_settings } = req.body;
    
    const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
    
    console.log('Checking API key:', !!ELEVENLABS_API_KEY ? 'Found' : 'Not found');
    console.log('Available env vars starting with VITE:', Object.keys(process.env).filter(k => k.startsWith('VITE_')).slice(0, 3));
    
    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.status}`,
        details: errorText 
      });
    }

    // Stream the audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);
    
  } catch (error) {
    console.error('ElevenLabs proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
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