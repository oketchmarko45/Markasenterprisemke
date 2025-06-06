const { OpenAI } = require("openai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message, thread_id } = JSON.parse(event.body);
    const openai = new OpenAI(process.env.OPENAI_API_KEY);

    // Create thread if none exists
    const threadId = thread_id || (await openai.beta.threads.create()).id;

    // Add user message
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });

    // Wait for completion
    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (runStatus.status !== "completed");

    // Get assistant's reply
    const messages = await openai.beta.threads.messages.list(threadId);
    const reply = messages.data[0].content[0].text.value;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply, thread_id: threadId }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
