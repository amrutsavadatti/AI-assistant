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
    
    try:
        if not os.path.exists(directory_path):
            print(f"Directory does not exist: {directory_path}")
            return texts
        
        files = os.listdir(directory_path)
        print(f"Found {len(files)} files in {directory_path}")

        # Load PDFs
        for filename in files:
            filepath = os.path.join(directory_path, filename)
            try:
                if filename.endswith(".pdf"):
                    print(f"Processing PDF: {filename}")
                    reader = PdfReader(filepath)
                    pdf_texts = []
                    for page_num, page in enumerate(reader.pages):
                        try:
                            text = page.extract_text()
                            if text and text.strip():
                                pdf_texts.append(text.strip())
                        except Exception as e:
                            print(f"Error extracting text from page {page_num} of {filename}: {str(e)}")
                    
                    if pdf_texts:
                        texts.extend(pdf_texts)
                        print(f"Extracted {len(pdf_texts)} pages from {filename}")

                # Load .txt or .md
                elif filename.endswith(".txt") or filename.endswith(".md"):
                    print(f"Processing text file: {filename}")
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                        if content:
                            texts.append(content)
                            print(f"Loaded content from {filename}")
                        else:
                            print(f"Empty file: {filename}")
            except Exception as e:
                print(f"Error processing file {filename}: {str(e)}")
                continue
                
        print(f'Successfully loaded {len(texts)} text documents')
        return texts
        
    except Exception as e:
        print(f"Error loading knowledge texts: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e

# load_knowledge_texts("../knowledge_base")

# Split raw texts into token-based chunks
def chunk_texts(texts, chunk_size=256, overlap=0):
    try:
        # Validate input
        if not texts:
            print("No texts provided for chunking")
            return []
        
        # Filter out empty texts and ensure all are strings
        valid_texts = []
        for text in texts:
            if isinstance(text, str) and text.strip():
                valid_texts.append(text.strip())
        
        if not valid_texts:
            print("No valid texts after filtering")
            return []
        
        print(f"Processing {len(valid_texts)} valid texts for chunking")
        
        character_splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", ". ", " ", ""],
            chunk_size=1000,
            chunk_overlap=20,
        )
        
        # Join texts and split into character chunks
        combined_text = "\n\n".join(valid_texts)
        char_chunks = character_splitter.split_text(combined_text)
        
        print(f"Created {len(char_chunks)} character chunks")

        token_splitter = SentenceTransformersTokenTextSplitter(
            tokens_per_chunk=chunk_size,
            chunk_overlap=overlap,
        )

        token_chunks = []
        for i, chunk in enumerate(char_chunks):
            if chunk and chunk.strip():  # Only process non-empty chunks
                try:
                    chunk_tokens = token_splitter.split_text(chunk)
                    token_chunks.extend(chunk_tokens)
                except Exception as e:
                    print(f"Error processing chunk {i}: {str(e)}")
                    # If token splitter fails, just use the character chunk
                    token_chunks.append(chunk)

        # Filter out empty chunks
        token_chunks = [chunk for chunk in token_chunks if chunk and chunk.strip()]
        
        print(f'Final token_chunks: {len(token_chunks)}')
        return token_chunks
        
    except Exception as e:
        print(f"Error in chunk_texts: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e


# Get (or create) a persistent Chroma collection
def get_chroma_collection(path, collection_name, embedding_fn):
    chroma_client = chromadb.PersistentClient(path=path, settings=Settings(anonymized_telemetry=False))
    return chroma_client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn
    )


# Populate the Chroma DB with new chunks
def populate_chroma_collection(collection, documents):
    try:
        if not documents:
            print("No documents to add to collection")
            return
        
        # Clear existing documents first to avoid duplicates
        existing_count = collection.count()
        if existing_count > 0:
            print(f"Found {existing_count} existing documents in collection")
            try:
                # Get all existing IDs and delete them
                existing_data = collection.get()
                if existing_data and 'ids' in existing_data and existing_data['ids']:
                    print(f"Deleting {len(existing_data['ids'])} existing documents")
                    collection.delete(ids=existing_data['ids'])
                    print("Existing documents cleared")
            except Exception as e:
                print(f"Warning: Could not clear existing documents: {str(e)}")
                # Continue anyway - duplicates are better than failure
        
        # Filter out empty documents
        valid_docs = [doc for doc in documents if doc and doc.strip()]
        
        if not valid_docs:
            print("No valid documents after filtering")
            return
        
        print(f"Adding {len(valid_docs)} documents to collection")
        
        ids = [str(i) for i in range(len(valid_docs))]
        collection.add(ids=ids, documents=valid_docs)
        
        final_count = collection.count()
        print(f"Successfully added {len(valid_docs)} chunks to collection '{collection.name}'. Total count: {final_count}")
        
    except Exception as e:
        print(f"Error populating collection: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e


# High-level utility to load, chunk, and store
def populate_chroma_db(base_dir="service/chroma_persistent_storage", knowledge_dir="knowledge_base", collection_name="Amrut-knowledge-base"):
    texts = load_knowledge_texts(knowledge_dir)
    chunks = chunk_texts(texts)

    embedding_fn = SentenceTransformerEmbeddingFunction()
    collection = get_chroma_collection(base_dir, collection_name, embedding_fn)

    populate_chroma_collection(collection, chunks)

def get_existing_chroma_collection(base_dir="service/chroma_persistent_storage", collection_name="Amrut-knowledge-base"):
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