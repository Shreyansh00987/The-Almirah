# The Almirah — Model Inventory & Licenses

This document inventories every model used or supported by **The Almirah** in local Live mode and fallback modes, verifying model sources, official licensing terms, and classification (Open-Source vs. Open-Weight).

---

## 1. Structured Field Extraction & Reasoning (Text Model)
* **Default Model Name**: `qwen2.5:7b-instruct` (Configurable via `TEXT_MODEL_NAME` to `qwen3` or `qwen2.5:3b` / `qwen2.5:14b`)
* **Developer / Organization**: Alibaba Cloud / Qwen Team
* **Source**: [Hugging Face (`Qwen/Qwen2.5-7B-Instruct`)](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) / [Ollama Library (`ollama run qwen2.5:7b`)](https://ollama.com/library/qwen2.5)
* **License**: **Apache 2.0**
* **Classification**: **Open-Weight** (Weights released under Apache 2.0 permissive commercial & personal use license).
* **Role in Pipeline**: Takes the OCR/VLM text transcript or bounding-box annotations and enforces strict JSON schema output: `{document_type, provider, identifier, issue_date, expiry_date, amount, drawer, confidence_scores}`.

---

## 2. Document Layout & Visual Inspection (Vision-Language Model)
* **Default Model Name**: `qwen2.5-vl:7b` (Configurable via `VISION_MODEL_NAME` to `qwen2.5-vl:3b` or `qwen2.5-vl:72b`)
* **Developer / Organization**: Alibaba Cloud / Qwen Team
* **Source**: [Hugging Face (`Qwen/Qwen2.5-VL-7B-Instruct`)](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct) / [Ollama Library (`ollama run qwen2.5-vl`)](https://ollama.com/library/qwen2.5-vl)
* **License**: **Apache 2.0**
* **Classification**: **Open-Weight**
* **Role in Pipeline**: Inspects synthetic and real document scans for spatial grounding, stamp detection, header hierarchies, and region bounding boxes (`[ymin, xmin, ymax, xmax]`).

---

## 3. Dense Retrieval & Multi-Lingual Embeddings (Vector Search)
* **Default Model Name**: `bge-m3`
* **Developer / Organization**: BAAI (Beijing Academy of Artificial Intelligence)
* **Source**: [Hugging Face (`BAAI/bge-m3`)](https://huggingface.co/BAAI/bge-m3) / [Ollama Library (`ollama run bge-m3`)](https://ollama.com/library/bge-m3)
* **License**: **MIT License**
* **Classification**: **Open-Source** (Permissive MIT license allowing full commercial and offline distribution).
* **Role in Pipeline**: Generates dense 1024-dimensional embeddings for confirmed documents, enabling semantic retrieval in the offline RAG system.

---

## 4. Optical Character Recognition (Baseline & Fast Fallback)
* **Default Engine**: **Tesseract OCR (v5.x)** with Python bindings (`pytesseract`) / Fallback Rule-Based OCR Parser
* **Developer / Organization**: HP Laboratories / Google / Open Source Community
* **Source**: [GitHub (`tesseract-ocr/tesseract`)](https://github.com/tesseract-ocr/tesseract)
* **License**: **Apache 2.0**
* **Classification**: **Open-Source**
* **Alternative Baseline**: **PaddleOCR** (Baidu, Apache 2.0)
* **Role in Pipeline**: Instant CPU-based fallback when no GPU or VLM is available. Extracts bounding boxes and text spans with confidence metrics.

---

## 5. Voice Transcription (Optional / Stretch)
* **Default Model Name**: `whisper.cpp` / `openai/whisper` (`base.en` or `small.en`)
* **Developer / Organization**: OpenAI
* **Source**: [GitHub (`openai/whisper`)](https://github.com/openai/whisper) / [Hugging Face (`openai/whisper-base`)](https://huggingface.co/openai/whisper-base)
* **License**: **MIT License**
* **Classification**: **Open-Weight / Open-Source code**
* **Role in Pipeline**: Local speech-to-text queries for accessibility.

---

## Summary Matrix

| Capability | Model / Engine | Official License | Open Classification | Offline Runtime |
|---|---|---|---|---|
| Text Reasoning | Qwen2.5-7B / Qwen3 | Apache 2.0 | Open-Weight | Ollama (`localhost:11434`) |
| Vision-Language | Qwen2.5-VL-7B | Apache 2.0 | Open-Weight | Ollama (`localhost:11434`) |
| Embeddings | BGE-M3 | MIT | Open-Source | Ollama / Sentence-Transformers |
| Fast OCR | Tesseract 5 / Rule Engine | Apache 2.0 | Open-Source | Local binary / Python |
| Audio (Voice) | Whisper Base | MIT | Open-Source Code | Local ONNX / cpp / Python |
