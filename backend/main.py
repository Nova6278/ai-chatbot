from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import boto3
import json
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

app = FastAPI(title="AI Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

SYSTEM_PROMPT = os.getenv(
    "CHATBOT_SYSTEM_PROMPT",
    """You are a helpful, friendly, and intelligent AI assistant. 
    You provide clear, accurate, and concise responses. 
    You are trained to assist with a wide range of commercial use cases including 
    customer support, information retrieval, and task assistance.
    Always be polite, professional, and helpful.""",
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    stream: Optional[bool] = False


class ChatResponse(BaseModel):
    response: str
    model: str


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Chatbot API is running"}


@app.get("/health")
def health():
    return {"status": "healthy", "model": MODEL_ID}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]

        body = json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1024,
                "system": SYSTEM_PROMPT,
                "messages": messages,
            }
        )

        response = bedrock.invoke_model(body=body, modelId=MODEL_ID)
        response_body = json.loads(response.get("body").read())
        reply = response_body["content"][0]["text"]

        return ChatResponse(response=reply, model=MODEL_ID)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]

        body = json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1024,
                "system": SYSTEM_PROMPT,
                "messages": messages,
            }
        )

        async def generate():
            response = bedrock.invoke_model_with_response_stream(
                body=body, modelId=MODEL_ID
            )
            stream = response.get("body")
            for event in stream:
                chunk = event.get("chunk")
                if chunk:
                    chunk_data = json.loads(chunk.get("bytes").decode())
                    if chunk_data.get("type") == "content_block_delta":
                        delta = chunk_data.get("delta", {})
                        if delta.get("type") == "text_delta":
                            text = delta.get("text", "")
                            yield f"data: {json.dumps({'text': text})}\n\n"

            yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
def list_models():
    return {
        "models": [
            {
                "id": "anthropic.claude-3-haiku-20240307-v1:0",
                "name": "Claude 3 Haiku (Fast)",
            },
            {
                "id": "anthropic.claude-3-sonnet-20240229-v1:0",
                "name": "Claude 3 Sonnet (Balanced)",
            },
            {
                "id": "amazon.titan-text-express-v1",
                "name": "Amazon Titan Express",
            },
        ]
    }
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

MODEL_ID = "meta.llama3-8b-instruct-v1:0"

SYSTEM_PROMPT = os.getenv(
    "CHATBOT_SYSTEM_PROMPT",
    "You are a helpful, friendly, and intelligent AI assistant. You provide clear, accurate, and concise responses. Always be polite and professional.",
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    stream: Optional[bool] = False


class ChatResponse(BaseModel):
    response: str
    model: str


def build_llama_prompt(messages, system_prompt):
    prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n{system_prompt}<|eot_id|>\n"
    for msg in messages:
        role = "user" if msg["role"] == "user" else "assistant"
        prompt += f"<|start_header_id|>{role}<|end_header_id|>\n{msg['content']}<|eot_id|>\n"
    prompt += "<|start_header_id|>assistant<|end_header_id|>\n"
    return prompt


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Chatbot API running with Meta Llama 3 on AWS Bedrock"}


@app.get("/health")
def health():
    return {"status": "healthy", "model": MODEL_ID}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        prompt = build_llama_prompt(messages, SYSTEM_PROMPT)

        body = json.dumps({
            "prompt": prompt,
            "max_gen_len": 1024,
            "temperature": 0.7,
            "top_p": 0.9,
        })

        response = bedrock.invoke_model(
            body=body,
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
        )
        response_body = json.loads(response.get("body").read())
        reply = response_body["generation"].strip()

        return ChatResponse(response=reply, model=MODEL_ID)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        prompt = build_llama_prompt(messages, SYSTEM_PROMPT)

        body = json.dumps({
            "prompt": prompt,
            "max_gen_len": 1024,
            "temperature": 0.7,
            "top_p": 0.9,
        })

        async def generate():
            try:
                response = bedrock.invoke_model_with_response_stream(
                    body=body,
                    modelId=MODEL_ID,
                    contentType="application/json",
                    accept="application/json",
                )
                stream = response.get("body")
                for event in stream:
                    chunk = event.get("chunk")
                    if chunk:
                        chunk_data = json.loads(chunk.get("bytes").decode())
                        text = chunk_data.get("generation", "")
                        if text:
                            yield f"data: {json.dumps({'text': text})}\n\n"
            except Exception:
                response = bedrock.invoke_model(
                    body=body,
                    modelId=MODEL_ID,
                    contentType="application/json",
                    accept="application/json",
                )
                response_body = json.loads(response.get("body").read())
                reply = response_body["generation"].strip()
                words = reply.split()
                for i, word in enumerate(words):
                    text = word + (" " if i < len(words) - 1 else "")
                    yield f"data: {json.dumps({'text': text})}\n\n"

            yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
def list_models():
    return {
        "models": [
            {"id": "meta.llama3-8b-instruct-v1:0", "name": "Meta Llama 3 8B (Free)"},
            {"id": "meta.llama3-70b-instruct-v1:0", "name": "Meta Llama 3 70B (Free)"},
        ]
    }