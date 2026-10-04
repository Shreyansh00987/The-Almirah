import json
import math
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "public" / "synthetic"
SAMPLES_JSON_PATH = Path(__file__).resolve().parent / "samples.json"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def draw_header_banner(draw: ImageDraw.ImageDraw, w: int, title: str, subtitle: str, bg_color: str, fg_color: str):
    draw.rectangle([0, 0, w, 110], fill=bg_color)
    draw.text((40, 25), title, fill=fg_color)
    draw.text((40, 68), subtitle, fill=fg_color)
    # Synthetic watermark banner
    draw.rectangle([w - 220, 20, w - 20, 50], fill="#C8453B", outline="#FFFFFF")
    draw.text((w - 205, 27), "SYNTHETIC SAMPLE", fill="#FFFFFF")

def draw_paper_texture(w: int, h: int, tint=(245, 241, 233)) -> Image.Image:
    """Generates an aged parchment paper texture."""
    base = Image.new("RGB", (w, h), color=tint)
    draw = ImageDraw.Draw(base)
    # Add subtle faint grid lines and noise
    for y in range(0, h, 28):
        draw.line([(0, y), (w, y)], fill=(235, 230, 220), width=1)
    # Subtle border
    draw.rectangle([15, 15, w - 15, h - 15], outline=(200, 192, 178), width=2)
    return base

def draw_official_stamp(draw: ImageDraw.ImageDraw, x: int, y: int, text1: str, text2: str, color=(160, 45, 40, 200)):
    # Draw double circular seal
    draw.ellipse([x, y, x + 110, y + 110], outline=color, width=3)
    draw.ellipse([x + 6, y + 6, x + 104, y + 104], outline=color, width=1)
    draw.text((x + 18, y + 35), text1, fill=color)
    draw.text((x + 22, y + 55), text2, fill=color)

def generate_samples():
    random.seed(42)
    w, h = 900, 1200
    
    docs_metadata = [
        {
            "id": "SYN-01",
            "filename": "synthetic_01_star_health_insurance.png",
            "drawer": "Insurance",
            "document_type": "Comprehensive Health Insurance Policy",
            "provider": "Star Health & Allied Insurance Co.",
            "identifier": "POL-SH-2024-8849102",
            "issue_date": "2025-11-26",
            "expiry_date": "2026-11-25", # Amber (52 days)
            "amount": "₹ 18,450.00",
            "notes": "Annual family floater cover for 4 members.",
            "skew": 0.0,
            "header_color": "#1B365D",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 650, "conf": 0.98},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 500, "conf": 0.96},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 580, "conf": 0.97},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.94},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.95},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 480, "conf": 0.91},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        },
        {
            "id": "SYN-02",
            "filename": "synthetic_02_national_auto_insurance.png",
            "drawer": "Vehicle",
            "document_type": "Private Car Package Policy Schedule",
            "provider": "National General Insurance Corp.",
            "identifier": "MOT-NG-773104-V",
            "issue_date": "2025-10-23",
            "expiry_date": "2026-10-22", # Urgent Red (18 days)
            "amount": "₹ 12,890.00",
            "notes": "Vehicle No: DL-03-CC-4910 (Hyundai Creta SX).",
            "skew": 0.8,
            "header_color": "#2A4B37",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 650, "conf": 0.97},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 520, "conf": 0.95},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 560, "conf": 0.96},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.93},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.98},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 480, "conf": 0.92},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        },
        {
            "id": "SYN-03",
            "filename": "synthetic_03_property_tax_receipt.png",
            "drawer": "Property",
            "document_type": "Municipal Property Tax Assessment Receipt",
            "provider": "Municipal Corporation Directorate of Revenue",
            "identifier": "PTX-2025-WARD14-882",
            "issue_date": "2026-04-10",
            "expiry_date": "2027-03-31", # Calm (178 days)
            "amount": "₹ 7,640.00",
            "notes": "Unit No. 402, Greenfield Apartments, Sector 14.",
            "skew": -0.6,
            "header_color": "#5A3825",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 670, "conf": 0.95},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 580, "conf": 0.94},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 600, "conf": 0.96},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.92},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.94},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 460, "conf": 0.90},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        },
        {
            "id": "SYN-04",
            "filename": "synthetic_04_vehicle_rc_smartcard.png",
            "drawer": "Vehicle",
            "document_type": "Motor Vehicle Registration Certificate",
            "provider": "Transport Department / Registering Authority",
            "identifier": "RC-MH-12-FG-5512",
            "issue_date": "2021-08-14",
            "expiry_date": "2036-08-13", # 15 years validity (Calm)
            "amount": "₹ 1,500.00",
            "notes": "Class of Vehicle: LMV-Car / Fuel: Petrol-Hybrid.",
            "skew": 0.0,
            "header_color": "#3B4D61",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 660, "conf": 0.94},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 580, "conf": 0.91},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 550, "conf": 0.88},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.89},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.95},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 450, "conf": 0.79},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.98}
            }
        },
        {
            "id": "SYN-05",
            "filename": "synthetic_05_ecopure_water_purifier_warranty.png",
            "drawer": "Warranties",
            "document_type": "2-Year Extended Service & Warranty Certificate",
            "provider": "EcoPure Water Technologies Ltd.",
            "identifier": "WAR-EP-99104-RO",
            "issue_date": "2024-12-11",
            "expiry_date": "2026-12-10", # Amber (67 days)
            "amount": "₹ 3,200.00",
            "notes": "Covers RO membrane, booster pump, sediment filters.",
            "skew": 0.5,
            "header_color": "#0E5A6F",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 680, "conf": 0.96},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 530, "conf": 0.95},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 550, "conf": 0.97},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.92},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.96},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 460, "conf": 0.88},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        },
        {
            "id": "SYN-06",
            "filename": "synthetic_06_apex_refrigerator_compressor.png",
            "drawer": "Warranties",
            "document_type": "5-Year Inverter Compressor Warranty Guarantee",
            "provider": "Apex Home Appliances Consumer Care",
            "identifier": "APX-INV-COMP-4819",
            "issue_date": "2024-03-15",
            "expiry_date": "2029-03-14", # Calm (890 days)
            "amount": "₹ 0.00 (Standard Guarantee)",
            "notes": "Model: FrostFree 450L Twin Cool. Authorized technician installation.",
            "skew": -0.4,
            "header_color": "#4A3323",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 690, "conf": 0.97},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 540, "conf": 0.95},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 560, "conf": 0.94},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.91},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.97},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 520, "conf": 0.84},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        },
        {
            "id": "SYN-07",
            "filename": "synthetic_07_national_identity_card.png",
            "drawer": "Identity",
            "document_type": "Citizen National Identity Document",
            "provider": "Unique Identification & Census Authority",
            "identifier": "ID-8841-9920-4182",
            "issue_date": "2019-06-22",
            "expiry_date": "2099-12-31", # Calm / Permanent
            "amount": "N/A",
            "notes": "Name: Rajesh V. Sharma, DOB: 1962-04-12. Blood Group: O+",
            "skew": 0.0,
            "header_color": "#23334A",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 650, "conf": 0.98},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 560, "conf": 0.96},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 580, "conf": 0.99},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.93},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.91},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 420, "conf": 0.75},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        },
        {
            "id": "SYN-08",
            "filename": "synthetic_08_driving_license_renewal.png",
            "drawer": "Identity",
            "document_type": "Motor Driving License Validity Slip",
            "provider": "State Transport Licensing Department",
            "identifier": "DL-04-2015-0099412",
            "issue_date": "2021-10-17",
            "expiry_date": "2026-10-16", # Urgent Red (12 days)
            "amount": "₹ 450.00",
            "notes": "Authorized vehicles: MCWG, LMV-NT. Renewal mandatory before expiry.",
            "skew": -0.7,
            "header_color": "#4A2323",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 660, "conf": 0.95},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 550, "conf": 0.94},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 580, "conf": 0.96},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.90},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.98},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 450, "conf": 0.91},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        },
        {
            "id": "SYN-09",
            "filename": "synthetic_09_residential_lease_agreement.png",
            "drawer": "Property",
            "document_type": "11-Month Tenancy & Lease Contract",
            "provider": "Estate Registrar & Notary Public",
            "identifier": "LSE-2024-SEC22-094",
            "issue_date": "2025-12-03",
            "expiry_date": "2026-11-02", # Urgent Red (29 days)
            "amount": "₹ 35,000.00 / month",
            "notes": "Security deposit ₹ 70,000. 1-month notice period for renewal.",
            "skew": 0.4,
            "header_color": "#3D2B4F",
            "fields_layout": {
                "document_type": {"ymin": 25, "xmin": 40, "ymax": 60, "xmax": 660, "conf": 0.96},
                "provider": {"ymin": 68, "xmin": 40, "ymax": 95, "xmax": 540, "conf": 0.95},
                "identifier": {"ymin": 210, "xmin": 280, "ymax": 245, "xmax": 580, "conf": 0.97},
                "issue_date": {"ymin": 290, "xmin": 280, "ymax": 325, "xmax": 460, "conf": 0.93},
                "expiry_date": {"ymin": 335, "xmin": 280, "ymax": 370, "xmax": 460, "conf": 0.97},
                "amount": {"ymin": 420, "xmin": 280, "ymax": 455, "xmax": 550, "conf": 0.92},
                "drawer": {"ymin": 20, "xmin": 700, "ymax": 55, "xmax": 880, "conf": 0.99}
            }
        }
    ]

    generated_records = []
    
    for meta in docs_metadata:
        img = draw_paper_texture(w, h)
        draw = ImageDraw.Draw(img)
        
        # Header banner
        draw_header_banner(
            draw, w,
            title=meta["document_type"],
            subtitle=f"Official Record: {meta['provider']}",
            bg_color=meta["header_color"],
            fg_color="#FFFFFF"
        )
        
        # Metadata Table Box
        table_top = 180
        table_bottom = 600
        draw.rectangle([40, table_top, w - 40, table_bottom], outline="#B8B0A2", fill="#FDFBF7", width=2)
        
        # Rows
        rows = [
            ("DOCUMENT IDENTIFIER", meta["identifier"]),
            ("ISSUING AUTHORITY", meta["provider"]),
            ("DATE OF ISSUE", meta["issue_date"]),
            ("DATE OF EXPIRY / RENEWAL", meta["expiry_date"]),
            ("RECORDED AMOUNT / FEE", meta["amount"]),
            ("ASSIGNED CABINET DRAWER", meta["drawer"])
        ]
        
        y_cursor = table_top + 15
        for label, val in rows:
            draw.line([50, y_cursor + 35, w - 50, y_cursor + 35], fill="#EAE5DC", width=1)
            draw.text((60, y_cursor + 8), label, fill="#70685C")
            draw.text((320, y_cursor + 8), val, fill="#1A1C20")
            y_cursor += 65
            
        # Descriptive notes section
        notes_top = 630
        draw.rectangle([40, notes_top, w - 40, notes_top + 160], outline="#D6CFBF", fill="#FAF8F2", width=1)
        draw.text((60, notes_top + 15), "SPECIAL CONDITIONS & FILING MEMORANDUM:", fill="#5D5344")
        draw.text((60, notes_top + 45), meta["notes"], fill="#252A30")
        draw.text((60, notes_top + 80), "This electronic reproduction is an authorized local document twin.", fill="#7B7365")
        draw.text((60, notes_top + 105), "Retain original stamped hardcopy in corresponding physical drawer.", fill="#7B7365")
        
        # Official Stamps & Seals
        draw_official_stamp(draw, w - 240, 840, "RECORDED", "VERIFIED", color=(180, 50, 45, 230))
        draw_official_stamp(draw, 100, 850, "THE ALMIRAH", "OFFLINE ARCHIVE", color=(40, 75, 130, 230))
        
        # Signatures
        draw.line([w - 320, 1060, w - 60, 1060], fill="#504A40", width=2)
        draw.text((w - 300, 1070), "AUTHORIZED SIGNATORY / NOTARY", fill="#6B6254")
        # Scripted signature curve
        sig_points = [(w - 300 + i * 20, 1045 - int(math.sin(i * 0.9) * 15) + (i % 2) * 5) for i in range(12)]
        draw.line(sig_points, fill="#1B2540", width=2)
        
        # Apply deliberate skew if specified
        skew = meta.get("skew", 0.0)
        if abs(skew) > 0.0:
            img = img.rotate(skew, resample=Image.Resampling.BICUBIC, fillcolor=(235, 230, 220))
            
        out_path = OUTPUT_DIR / meta["filename"]
        img.save(out_path, "PNG", optimize=True)
        
        # Prepare sample record
        generated_records.append({
            "id": meta["id"],
            "filename": meta["filename"],
            "image_url": f"/synthetic/{meta['filename']}",
            "file_path": str(out_path),
            "checksum": f"sha256-{meta['id'].lower()}-f389104",
            "is_synthetic": True,
            "is_confirmed": True,
            "created_at": "2025-01-15T10:00:00Z",
            "confirmed_at": "2025-01-15T10:05:00Z",
            "confirmed_document_type": meta["document_type"],
            "confirmed_provider": meta["provider"],
            "confirmed_identifier": meta["identifier"],
            "confirmed_issue_date": meta["issue_date"],
            "confirmed_expiry_date": meta["expiry_date"],
            "confirmed_amount": meta["amount"],
            "confirmed_drawer": meta["drawer"],
            "notes": meta["notes"],
            "extraction": {
                "document_type": {
                    "value": meta["document_type"],
                    "confidence": meta["fields_layout"]["document_type"]["conf"],
                    "bounding_box": {"ymin": meta["fields_layout"]["document_type"]["ymin"], "xmin": meta["fields_layout"]["document_type"]["xmin"], "ymax": meta["fields_layout"]["document_type"]["ymax"], "xmax": meta["fields_layout"]["document_type"]["xmax"], "page": 1}
                },
                "provider": {
                    "value": meta["provider"],
                    "confidence": meta["fields_layout"]["provider"]["conf"],
                    "bounding_box": {"ymin": meta["fields_layout"]["provider"]["ymin"], "xmin": meta["fields_layout"]["provider"]["xmin"], "ymax": meta["fields_layout"]["provider"]["ymax"], "xmax": meta["fields_layout"]["provider"]["xmax"], "page": 1}
                },
                "identifier": {
                    "value": meta["identifier"],
                    "confidence": meta["fields_layout"]["identifier"]["conf"],
                    "bounding_box": {"ymin": meta["fields_layout"]["identifier"]["ymin"], "xmin": meta["fields_layout"]["identifier"]["xmin"], "ymax": meta["fields_layout"]["identifier"]["ymax"], "xmax": meta["fields_layout"]["identifier"]["xmax"], "page": 1}
                },
                "issue_date": {
                    "value": meta["issue_date"],
                    "confidence": meta["fields_layout"]["issue_date"]["conf"],
                    "bounding_box": {"ymin": meta["fields_layout"]["issue_date"]["ymin"], "xmin": meta["fields_layout"]["issue_date"]["xmin"], "ymax": meta["fields_layout"]["issue_date"]["ymax"], "xmax": meta["fields_layout"]["issue_date"]["xmax"], "page": 1}
                },
                "expiry_date": {
                    "value": meta["expiry_date"],
                    "confidence": meta["fields_layout"]["expiry_date"]["conf"],
                    "bounding_box": {"ymin": meta["fields_layout"]["expiry_date"]["ymin"], "xmin": meta["fields_layout"]["expiry_date"]["xmin"], "ymax": meta["fields_layout"]["expiry_date"]["ymax"], "xmax": meta["fields_layout"]["expiry_date"]["xmax"], "page": 1}
                },
                "amount": {
                    "value": meta["amount"],
                    "confidence": meta["fields_layout"]["amount"]["conf"],
                    "bounding_box": {"ymin": meta["fields_layout"]["amount"]["ymin"], "xmin": meta["fields_layout"]["amount"]["xmin"], "ymax": meta["fields_layout"]["amount"]["ymax"], "xmax": meta["fields_layout"]["amount"]["xmax"], "page": 1}
                },
                "drawer": {
                    "value": meta["drawer"],
                    "confidence": meta["fields_layout"]["drawer"]["conf"],
                    "bounding_box": {"ymin": meta["fields_layout"]["drawer"]["ymin"], "xmin": meta["fields_layout"]["drawer"]["xmin"], "ymax": meta["fields_layout"]["drawer"]["ymax"], "xmax": meta["fields_layout"]["drawer"]["xmax"], "page": 1}
                }
            }
        })
        
    with open(SAMPLES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(generated_records, f, indent=2)
        
    print(f"Successfully generated {len(generated_records)} synthetic documents in {OUTPUT_DIR}")

if __name__ == "__main__":
    generate_samples()
