const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URL = "https://majestic-admin.onrender.com";

app.get('/login', (req, res) => {
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect(FRONTEND_URL);

  try {
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    const user = userRes.data;
    
    res.redirect(`${FRONTEND_URL}?username=${encodeURIComponent(user.username)}&id=${user.id}&avatar=${user.avatar || ''}`);

  } catch (err) {
    console.error(err);
    res.redirect(FRONTEND_URL + "?error=auth_failed");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend работает`));
