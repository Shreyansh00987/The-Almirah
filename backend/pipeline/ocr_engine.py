import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional
from PIL import Image

class OCRBox:
    def __init__(self, text: str, xmin: int, ymin: int, xmax: int, ymax: int, confidence: float):
        self.text = text
        self.xmin = xmin
        self.ymin = ymin
        self.xmax = xmax
        self.ymax = ymax
        self.confidence = confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "xmin": self.xmin,
            "ymin": self.ymin,
            "xmax": self.xmax,
            "ymax": self.ymax,
            "confidence": self.confidence,
        }

def has_tesseract() -> bool:
    return shutil.which("tesseract") is not None

def run_tesseract_ocr(image_path: str | Path) -> List[OCRBox]:
    """Runs tesseract CLI with TSV output for bounding box detection if available."""
    if not has_tesseract():
        return []
    
    try:
        cmd = ["tesseract", str(image_path), "stdout", "--oem", "1", "-l", "eng", "tsv"]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        lines = res.stdout.strip().split("\n")
        if len(lines) <= 1:
            return []
            
        header = lines[0].split("\t")
        boxes: List[OCRBox] = []
        img = Image.open(image_path)
        img_w, img_h = img.size
        
        for line in lines[1:]:
            parts = line.split("\t")
            if len(parts) != len(header):
                continue
            row = dict(zip(header, parts))
            text = row.get("text", "").strip()
            conf = float(row.get("conf", -1))
            if text and conf > 0:
                left = int(row["left"])
                top = int(row["top"])
                width = int(row["width"])
                height = int(row["height"])
                
                # Normalize to 0 - 1000
                xmin = max(0, min(1000, int((left / img_w) * 1000)))
                ymin = max(0, min(1000, int((top / img_h) * 1000)))
                xmax = max(0, min(1000, int(((left + width) / img_w) * 1000)))
                ymax = max(0, min(1000, int(((top + height) / img_h) * 1000)))
                
                boxes.append(OCRBox(text=text, xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax, confidence=conf / 100.0))
                
        return boxes
    except Exception:
        return []

def extract_dates_and_amounts(full_text: str) -> Dict[str, Any]:
    """
    Heuristic rule-based extractor for dates, identifiers, and currency amounts.
    Used for instant fallback and confidence verification.
    """
    # Common date formats: DD/MM/YYYY, YYYY-MM-DD, DD-Mon-YYYY, etc.
    date_patterns = [
        r'\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b',
        r'\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b',
        r'\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{4})\b'
    ]
    
    dates_found = []
    for pattern in date_patterns:
        matches = re.findall(pattern, full_text, re.IGNORECASE)
        dates_found.extend(matches)
        
    # Amount patterns: $120.00, Rs. 5,000, ₹ 12,400.00, USD 450
    amount_pattern = r'(?:[\$₹£€]|(?:Rs\.?|INR|USD)\s*)([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)'
    amounts_found = re.findall(amount_pattern, full_text, re.IGNORECASE)
    
    # Policy / Account / Receipt / Document Number patterns
    id_pattern = r'(?:No\.?|Number|ID|Policy|Receipt|Certificate|Registration|VIN)[\s:#]+([A-Z0-9-]{6,25})\b'
    id_matches = re.findall(id_pattern, full_text, re.IGNORECASE)
    
    return {
        "dates": list(dict.fromkeys(dates_found)),
        "amounts": list(dict.fromkeys(amounts_found)),
        "identifiers": list(dict.fromkeys(id_matches))
    }
