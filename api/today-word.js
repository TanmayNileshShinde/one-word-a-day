export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    if (global.dailyWord && global.dailyWord.date === today) {
      return res.status(200).json(global.dailyWord);
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "AI_API_KEY missing" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You only reply with valid JSON. No extra text."
            },
            {
              role: "user",
              content:
                "Give ONE English word. Return JSON with keys: word, meaning, example."
            }
          ],
          temperature: 0.4
        })
      }
    );

    const raw = await response.json();
    const text = raw.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No AI response");
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
    console.error(err);
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
