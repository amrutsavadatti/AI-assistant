import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI
from chromadb.utils import embedding_functions


load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")

openai_ef = embedding_functions.OpenAIEmbeddingFunction(api_key=openai_key, model_name="text-embedding-3-small")

#init Chroma
chroma_client = chromadb.PersistentClient(path="chroma_persistent_storage")
collection_name = "document_qa_collection"
collection = chroma_client.get_or_create_collection(
    name=collection_name, embedding_function=openai_ef
)

client = OpenAI(api_key=openai_key)

# Function to load documents from a directory
def load_documents_from_directory(directory_path):
    print("==== Loading documents from directory ====")
    documents = []
    for filename in os.listdir(directory_path):
        if filename.endswith(".txt"):
            with open(
                os.path.join(directory_path, filename), "r", encoding="utf-8"
            ) as file:
                documents.append({"id": filename, "text": file.read()})
    return documents

# Function to split text into chunks
def split_text(text, chunk_size=1000, chunk_overlap=30):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - chunk_overlap
    return chunks

# # Load documents from the directory
# directory_path = "../knowledge_base"
# documents = load_documents_from_directory(directory_path)
#
# print(f"Loaded {len(documents)} documents")
# # Split documents into chunks
# chunked_documents = []
# for doc in documents:
#     chunks = split_text(doc["text"])
#     print("==== Splitting docs into chunks ====")
#     for i, chunk in enumerate(chunks):
#         chunked_documents.append({"id": f"{doc['id']}_chunk{i+1}", "text": chunk})
#
# print(f"Split documents into {len(chunked_documents)} chunks")

# Function to generate embeddings using OpenAI API
def get_openai_embedding(text):
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    embedding = response.data[0].embedding
    print("==== Generating embeddings... ====")
    return embedding


# # Generate embeddings for the document chunks
# for doc in chunked_documents:
#     print("==== Generating embeddings... ====")
#     doc["embedding"] = get_openai_embedding(doc["text"])
#
# # print(doc["embedding"])
#
# # Upsert documents with embeddings into Chroma
# for doc in chunked_documents:
#     print("==== Inserting chunks into db;;; ====")
#     collection.upsert(
#         ids=[doc["id"]], documents=[doc["text"]], embeddings=[doc["embedding"]]
#     )


# Function to query documents
def query_documents(question, n_results=2):
    # query_embedding = get_openai_embedding(question)
    results = collection.query(query_texts=question, n_results=n_results)

    # Extract the relevant chunks
    relevant_chunks = [doc for sublist in results["documents"] for doc in sublist]
    print("==== Returning relevant chunks ====")
    return relevant_chunks
    # for idx, document in enumerate(results["documents"][0]):
    #     doc_id = results["ids"][0][idx]
    #     distance = results["distances"][0][idx]
    #     print(f"Found document chunk: {document} (ID: {doc_id}, Distance: {distance})")


# Function to generate a response from OpenAI
def generate_response(question, relevant_chunks):
    context = "\n\n".join(relevant_chunks)
    prompt = (
        "Your name is Clarice and you are Amrut's personal assistant for question-answering tasks. Use the following pieces of "
        "retrieved context to answer the question. If you don't know the answer, say that you "
        "don't know. Answer in a way as if Hiring managers are talking to you and help amrut land a job. Use three sentences maximum and keep the answer concise."
        "\n\nContext:\n" + context + "\n\nQuestion:\n" + question
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
                "content": question,
            },
        ],
    )

    answer = response.choices[0].message
    return answer



question = "why should i hire Amrut as a software dev?"
relevant_chunks = query_documents(question)
answer = generate_response(question, relevant_chunks)

print(answer)