from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Your Assistant ID (create one first and put it here)
ASSISTANT_ID = "asst_tqIGHRdd4HuAWHZTdkjNb9xt"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        thread_id = data.get('thread_id')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Create a new thread if none exists
        if not thread_id:
            thread = client.beta.threads.create()
            thread_id = thread.id
        
        # Add user message to thread
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_message
        )
        
        # Run the assistant
        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=ASSISTANT_ID
        )
        
        # Wait for completion
        while True:
            run_status = client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )
            if run_status.status == 'completed':
                break
        
        # Get the assistant's response
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        assistant_response = messages.data[0].content[0].text.value
        
        return jsonify({
            'reply': assistant_response,
            'thread_id': thread_id
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
