export default async function handler(req, res) {
  try {
    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "AI_API_KEY missing" });
    }

    const today = new Date().toISOString().slice(0, 10);

    // simple in-memory cache per deployment
    if (global.dailyWord && global.dailyWord.date === today) {
      return res.status(200).json(global.dailyWord);
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Give ONE English vocabulary word. Reply ONLY in valid JSON like this: {\"word\":\"\",\"meaning\":\"\",\"example\":\"\"}"
                }
              ]
            }
          ]
        })
      }
    );

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      return res.status(500).json({
        error: "Gemini API error",
        details: text
      });
    }

    const data = await geminiRes.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "No AI response",
        raw: data
      });
    }

    const parsed = JSON.parse(text);

    const result = {
      date: today,
      word: parsed.word,
      meaning: parsed.meaning,
      example: parsed.example
    };

    global.dailyWord = result;

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
