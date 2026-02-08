export default async function handler(req, res) {
  const today = new Date().toISOString().slice(0, 10);

  if (!global.dailyWord || global.dailyWord.date !== today) {
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{
          role: "user",
          content:
            "Give one English word with meaning and example in JSON: word, meaning, example"
        }]
      })
    });

    const data = await aiRes.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    global.dailyWord = {
      date: today,
      ...parsed
    };
  }

  res.json(global.dailyWord);
}
