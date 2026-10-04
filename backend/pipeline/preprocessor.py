import os
import hashlib
from pathlib import Path
from typing import Tuple
from PIL import Image, ImageOps, ImageEnhance
import numpy as np

def compute_sha256(filepath: str | Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def detect_skew_angle(image: Image.Image) -> float:
    """
    Detect slight skew angle using projection profile variation on a grayscale downscaled image.
    Works entirely with Pillow and Numpy (pure offline, no external OpenCV dependency).
    """
    try:
        # Convert to grayscale and downsample for fast processing
        gray = image.convert("L")
        w, h = gray.size
        if w > 800:
            gray = gray.resize((800, int(h * 800 / w)), Image.Resampling.BILINEAR)
            
        arr = np.array(gray)
        # Binarize with Otsu-like mean threshold
        thresh = arr < np.mean(arr)
        
        # Test angles between -10 and +10 degrees in steps of 0.5 degrees
        best_angle = 0.0
        max_variance = 0.0
        
        for angle in np.arange(-10.0, 10.5, 0.5):
            rotated = Image.fromarray(thresh).rotate(angle, resample=Image.Resampling.NEAREST, fillcolor=0)
            proj = np.sum(np.array(rotated), axis=1)
            var = np.var(proj)
            if var > max_variance:
                max_variance = var
                best_angle = angle
                
        # If best angle is within noise margin (< 0.5 deg), keep it 0.0
        if abs(best_angle) < 0.5:
            return 0.0
        return float(best_angle)
    except Exception:
        return 0.0

def preprocess_document_image(input_path: str | Path, output_path: str | Path) -> Tuple[str, int, int]:
    """
    Loads, deskews, enhances contrast, and normalizes a document image.
    Returns (sha256_checksum, width, height).
    """
    img = Image.open(input_path)
    
    # Auto-orient based on EXIF tag if present
    img = ImageOps.exif_transpose(img)
    
    # Ensure RGB
    if img.mode != "RGB":
        img = img.convert("RGB")
        
    # Detect skew and deskew if tilted
    skew = detect_skew_angle(img)
    if abs(skew) >= 0.5:
        # Rotate back by -skew with high-quality bicubic interpolation and white background
        img = img.rotate(-skew, resample=Image.Resampling.BICUBIC, expand=True, fillcolor=(255, 255, 255))
        
    # Subtle contrast normalization for older paper documents
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.08)
    
    # Save optimized copy
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG", optimize=True)
    
    checksum = compute_sha256(output_path)
    return checksum, img.width, img.height
