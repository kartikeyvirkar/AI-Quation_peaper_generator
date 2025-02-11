import express from 'express';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not set. Please check your .env.local file.');
}
console.log({ apiKey: process.env.GROQ_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/chat', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'llama-3.3-70b-versatile',
    });

    res.render('index', { reply: response.choices[0].message.content, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
