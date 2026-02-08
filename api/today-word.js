export default async function handler(req, res) {
  try {
    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "AI_API_KEY missing" });
    }

    const today = new Date().toISOString().slice(0, 10);

    // cache word for the day (per deployment)
    if (global.dailyWord && global.dailyWord.date === today) {
      return res.status(200).json(global.dailyWord);
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "user",
              content:
                "Reply ONLY in valid JSON. Give ONE English word with meaning and example. Format exactly like this: {\"word\":\"\",\"meaning\":\"\",\"example\":\"\"}"
            }
          ],
          temperature: 0.4
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: "AI API error",
        details: text
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: "No AI response" });
    }

    const parsed = JSON.parse(text);

    const result = {
      date: today,
      word: parsed.word,
      meaning: parsed.meaning,
      example: parsed.example
    };

    global.dailyWord = result;
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
