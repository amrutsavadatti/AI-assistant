import os
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from chromadb.config import Settings
from pypdf import PdfReader
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    SentenceTransformersTokenTextSplitter,
)

def load_knowledge_texts(directory_path):
    texts = []

    # Load PDFs
    for filename in os.listdir(directory_path):
        if filename.endswith(".pdf"):
            reader = PdfReader(os.path.join(directory_path, filename))
            pdf_texts = [p.extract_text() for p in reader.pages]
            pdf_texts = [text.strip() for text in pdf_texts if text]
            texts.extend(pdf_texts)

        # Load .txt or .md
        elif filename.endswith(".txt") or filename.endswith(".md"):
            with open(os.path.join(directory_path, filename), "r", encoding="utf-8") as f:
                texts.append(f.read().strip())
    print(f'items: {len(texts)} \n texts: {texts}')
    return texts

# load_knowledge_texts("../knowledge_base")

# Split raw texts into token-based chunks
def chunk_texts(texts, chunk_size=256, overlap=0):
    character_splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ". ", " ", ""],
        chunk_size=1000,
        chunk_overlap=20,
    )
    char_chunks = character_splitter.split_text("\n\n".join(texts))

    token_splitter = SentenceTransformersTokenTextSplitter(
        tokens_per_chunk=chunk_size,
        chunk_overlap=overlap,
    )

    token_chunks = []
    for chunk in char_chunks:
        token_chunks += token_splitter.split_text(chunk)

    print(f'\ntoken_chunks: {len(token_chunks)} \n token_chunks: {token_chunks}')
    return token_chunks


# Get (or create) a persistent Chroma collection
def get_chroma_collection(path, collection_name, embedding_fn):
    chroma_client = chromadb.PersistentClient(path=path, settings=Settings(anonymized_telemetry=False))
    return chroma_client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn
    )


# Populate the Chroma DB with new chunks
def populate_chroma_collection(collection, documents):
    ids = [str(i) for i in range(len(documents))]
    collection.add(ids=ids, documents=documents)
    print(f"Added {len(documents)} chunks to collection '{collection.name}'.")


# High-level utility to load, chunk, and store
def populate_chroma_db(base_dir="chroma_persistent_storage", knowledge_dir="../knowledge_base", collection_name="Amrut-knowledge-base"):
    texts = load_knowledge_texts(knowledge_dir)
    chunks = chunk_texts(texts)

    embedding_fn = SentenceTransformerEmbeddingFunction()
    collection = get_chroma_collection(base_dir, collection_name, embedding_fn)

    populate_chroma_collection(collection, chunks)

def get_existing_chroma_collection(base_dir="chroma_persistent_storage", collection_name="Amrut-knowledge-base"):
    embedding_fn = SentenceTransformerEmbeddingFunction()
    chroma_client = chromadb.PersistentClient(path=base_dir, settings=Settings(anonymized_telemetry=False))
    return chroma_client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn
    )

def add_new_doc_to_chroma(path_to_doc, collection):
    with open(path_to_doc, "r", encoding="utf-8") as f:
        content = f.read()

    chunks = chunk_texts([content])
    ids = [f"{os.path.basename(path_to_doc)}_chunk_{i}" for i in range(len(chunks))]

    collection.add(ids=ids, documents=chunks)
    print(f"Added {len(chunks)} new chunks from: {path_to_doc}")