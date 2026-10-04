import json
from pathlib import Path
from backend.database import init_db, save_document, row_to_document_record
from backend.schema import DocumentRecord

SAMPLES_JSON = Path(__file__).resolve().parent / "synthetic" / "samples.json"

def seed():
    init_db()
    if not SAMPLES_JSON.exists():
        print("samples.json does not exist. Run generator first.")
        return
        
    with open(SAMPLES_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for item in data:
        doc = DocumentRecord(**item)
        save_document(doc)
        
    print(f"Seeded {len(data)} documents into local SQLite database.")

if __name__ == "__main__":
    seed()
