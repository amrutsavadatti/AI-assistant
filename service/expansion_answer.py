import os
from dotenv import load_dotenv
from openai import OpenAI
from service.chromaDbUtils import get_existing_chroma_collection
from service.helperUtils import word_wrap
from functools import lru_cache
import re
from service.helperUtils import word_wrap

load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_key)


def augment_query_generated(query, model="gpt-4o"):
    prompt = """You are Amrut's AI assistant, your name is Clarity.
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
    print(f"[CACHE MISS] inside 2nd function")
    context = "\n\n".join(retrieved_documents)
    prompt = (
        "Your name is Clarity and you are Amrut's personal assistant for question-answering tasks. Use the following pieces of "
        "retrieved context to answer the question. If you don't know the answer, say that you "
        "don't know. Answer in a way as if Hiring managers are talking to you and help amrut land a job. Use three sentences maximum and keep the answer concise."
        "when asked about amrut, make sure to mention accumulates experience of over 3 years and mention experience and skils on priority"
        "Facts to not get wrong and talk about them only if they are asked about:"
        "1. Questions about where I stay:Amrut is living in Worcester, MA and is open to relocation NOT mumbai"
        "2. Questions about Amruts weaknesses, what he is not good at, shortcommings: Only answer using one of the provided four weaknesses. Do not generate or assume new ones:"
        "a.He sometimes focus too much on optimizing early, which can delay progress. He’ve learned to time-box this and prioritize delivering working solutions first."
        "b.Earlier, He hesitated to delegate or ask for help, thinking he had to solve everything himself. He now collaborates more and involve teammates early to avoid bottlenecks."
        "c.I used to prioritize code over documentation, which made handovers harder. I’ve since built a habit of writing clear READMEs and inline comments during development."
        "d.I used to say yes to every task or idea, which stretched my bandwidth. Now I focus on impact and align my efforts with sprint goals more effectively." 
        "3. Questions about Visa or work authorization: Amrut is on F‑1 and can work as an intern/co‑op now under CPT. After graduation in Aug 2026, I’m eligible for 12 months of OPT plus a 24‑month STEM extension—meaning I’m work‑authorized through Aug 2029. Around then, I’ll need H‑1B sponsorship"
        "4. Questions about how is he, morality, good person, ehicsl etc:talk about him being extroverted and a peoples person. is very ethical and helps ppl grow with him"
        "4. Questions about Clarity should be very consize and to the point and must not give any information about Amrut, never mention clarity has experience."
        "\n\nContext:\n" + context + "\n\nQuestion:\n" + original_query
    )

    response = client.chat.completions.create(
        model="gpt-4o",
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

@lru_cache(maxsize=100)
def get_response(original_query):
    print(f"[CACHE MISS] original_query = {original_query}")

    hypothetical_answer = augment_query_generated(original_query)
    joint_query = f"{original_query} {hypothetical_answer}"
    print(word_wrap(joint_query) + "+++++++++++++++++++++++++")
    chroma_collection = get_existing_chroma_collection(
        base_dir="service/chroma_persistent_storage", 
        collection_name="Amrut-knowledge-base"
    )

    results = chroma_collection.query(
        query_texts=joint_query, n_results=5, include=["documents", "embeddings"]
    )
    retrieved_documents = results["documents"][0]
    print("+++++++++++++++++++++++++")
    print(results)
    for document in retrieved_documents:
        print(word_wrap(document))
        print("\n")
    print("+++++++++++++++++++++++++")
    retrieved_documents = tuple(retrieved_documents)  # cast list to tuple
    return generate_response(original_query, retrieved_documents)

# a = get_response("What is his best work yet?")
# print(a.content)


def normalize(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)  # remove punctuation
    return re.sub(r"\s+", " ", text)