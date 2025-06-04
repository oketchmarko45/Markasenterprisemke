// functions/petbot.js
const { OpenAI } = require("openai");

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { message, thread_id } = JSON.parse(event.body);
    const openai = new OpenAI(process.env.OPENAI_API_KEY);

    // If no thread exists, create one
    let threadId = thread_id;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    // Add user message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });

    // Wait for completion
    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (runStatus.status !== "completed");

    // Get the latest assistant message
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantResponse = messages.data[0].content[0].text.value;

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: assistantResponse,
        thread_id: threadId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
