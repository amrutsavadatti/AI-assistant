import os
from dotenv import load_dotenv
from openai import OpenAI
from service.chromaDbUtils import get_existing_chroma_collection
from functools import lru_cache
import re


load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_key)


def augment_query_generated(query, model="gpt-3.5-turbo"):
    prompt = """You are Amrut's AI assistant, your name is Clarice.
   Provide an example answer to the given question, that might be found in a documents that describe amruts work, resume, projects etc."""
    messages = [
        {
            "role": "system",
            "content": prompt,
        },
        {"role": "user", "content": query},
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
    )
    content = response.choices[0].message.content
    return content


def generate_response(original_query:str, retrieved_documents:tuple):
    context = "\n\n".join(retrieved_documents)
    prompt = (
        "Your name is Clarice and you are Amrut's personal assistant for question-answering tasks. Use the following pieces of "
        "retrieved context to answer the question. If you don't know the answer, say that you "
        "don't know. Answer in a way as if Hiring managers are talking to you and help amrut land a job. Use three sentences maximum and keep the answer concise."
        "\n\nContext:\n" + context + "\n\nQuestion:\n" + original_query
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": prompt,
            },
            {
                "role": "user",
                "content": original_query,
            },
        ],
    )

    answer = response.choices[0].message
    return answer

# @lru_cache(maxsize=100)
def get_response(original_query):
    print(f"[CACHE MISS] original_query = {original_query}")

    hypothetical_answer = augment_query_generated(original_query)
    joint_query = f"{original_query} {hypothetical_answer}"
    # print(word_wrap(joint_query))
    chroma_collection = get_existing_chroma_collection()

    results = chroma_collection.query(
        query_texts=joint_query, n_results=5, include=["documents", "embeddings"]
    )
    retrieved_documents = results["documents"][0]
    # for document in retrieved_documents:
    #     print(word_wrap(document))
    #     print("\n")
    retrieved_documents = tuple(retrieved_documents)  # cast list to tuple
    return generate_response(original_query, retrieved_documents)

# a = get_response("What is his best work yet?")
# print(a.content)


def normalize(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)  # remove punctuation
    return re.sub(r"\s+", " ", text)