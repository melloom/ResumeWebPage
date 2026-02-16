const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const Busboy = require('busboy');
const FormData = require('form-data');

admin.initializeApp();

// Transcribe audio using OpenAI Whisper
exports.transcribe = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    // Get audio file from multipart form
    const chunks = [];
    const bb = Busboy({ headers: req.headers });

    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', (data) => {
        chunks.push(data);
      });
    });

    bb.on('finish', async () => {
      try {
        const audioBuffer = Buffer.concat(chunks);

        const formData = new FormData();
        formData.append('file', audioBuffer, { filename: 'audio.webm', contentType: 'audio/webm' });
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');

        const response = await axios.post(
          'https://api.openai.com/v1/audio/transcriptions',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          }
        );

        res.json({ transcript: response.data.text });
      } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: 'Transcription failed' });
      }
    });

    req.pipe(bb);
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
