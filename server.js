import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

// Paste your Gemini API key here
const ai = new GoogleGenAI({ apiKey: "AIzaSyCZo_LrZzcAHnGEkq335rfAbbRTZSwSQMU" });

// API route
app.post('/analyze', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'No email provided' });

  const prompt = `You are an admin assistant. Extract complaint details from the email below.

Return ONLY a valid JSON array (no markdown, no explanation, no backticks) with objects containing:
- "type": whether the person is a "Student" or "Staff" (string, or "N/A" if not found)
- "register_number": student register/roll number or staff ID (string, or "N/A" if not found)
- "name": full name (string)
- "college_name": college or institution name (string, or "N/A" if not found)
- "department": department name (string, or "N/A" if not found)
- "issue_type": short category like "Lab Access", "Fee Payment", "Hostel Maintenance" etc. (2-3 words)
- "issue_description": concise 1-2 sentence description of the problem

One object per person. Return ONLY the JSON array, nothing else.

Email:
${email}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const raw = response.text;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const records = JSON.parse(cleaned);
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.use(express.static('public'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});