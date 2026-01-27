
import csv
import collections
import sys
import os
import datetime

# Force standard encoding for Windows console redirection
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

def parse_date(date_str):
    # Try multiple formats common in exports
    formats = [
        "%d/%m/%Y %H:%M:%S", 
        "%d/%m/%Y %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%d-%m-%Y"
    ]
    for fmt in formats:
        try:
            return datetime.datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None

def analyze_deep(file_path):
    print("=== DYNATRACE DEEP TUNING ANALYSIS ===")
    
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return

    with open(file_path, 'r', encoding='latin-1', errors='replace') as f:
        reader = csv.DictReader(f)
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        rows = list(reader)

    print(f"Total Raw Alerts: {len(rows)}")
    
    # 1. Column Detection (Heuristic)
    desc_col = next((h for h in headers if any(x in h.lower() for x in ['descri', 'detail', 'summary', 'título'])), None)
    ci_col = next((h for h in headers if any(x in h.lower() for x in ['ci', 'configuration', 'elemento'])), None)
    date_col = next((h for h in headers if any(x in h.lower() for x in ['created', 'fecha', 'creado', 'apertura'])), None)
    
    print(f"Mappings -> Desc: {desc_col} | CI: {ci_col} | Date: {date_col}")

    if not desc_col:
        print("CRITICAL: No description column found. Aborting deep analysis.")
        return

    # 2. Pattern Analysis
    patterns = collections.Counter()
    ci_noise = collections.Counter()
    dates = []
    
    normalized_rows = []
    
    for row in rows:
        raw_desc = row.get(desc_col, '').strip()
        ci = row.get(ci_col, 'Unknown').strip()
        date_val = row.get(date_col, '')
        
        # Normalize Description (Remove specific IDs, percentages, IPs)
        # Simple heuristic: take first 50 chars as the "Pattern"
        pattern = raw_desc[:50]
        
        patterns[pattern] += 1
        ci_noise[ci] += 1
        
        dt = parse_date(date_val)
        if dt: dates.append(dt)

    # 3. High Volume Patterns (False Positive Candidates)
    print("\n[NOISE PATTERNS - TOP 10]")
    print(f"{'Count':<8} | {'Influence':<6} | {'Pattern Prefix'}")
    print("-" * 60)
    for p, c in patterns.most_common(10):
        if not p: continue
        influence = (c / len(rows)) * 100
        print(f"{c:<8} | {influence:.1f}%   | {p}")

    # 4. Ingesta Scope (Time Analysis)
    print("\n[INGESTA TIMELINE]")
    if dates:
        dates.sort()
        start = dates[0]
        end = dates[-1]
        days = (end - start).days
        print(f"Range: {start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}")
        print(f"Total Days: {days}")
        
        # Check Oct/Nov/Dec coverage
        oct_count = sum(1 for d in dates if d.month == 10)
        nov_count = sum(1 for d in dates if d.month == 11)
        dec_count = sum(1 for d in dates if d.month == 12)
        jan_count = sum(1 for d in dates if d.month == 1)
        
        print(f"Volume by Month:")
        print(f"  - October: {oct_count}")
        print(f"  - November: {nov_count}")
        print(f"  - December: {dec_count}")
        print(f"  - January: {jan_count}")
    else:
        print("No parsable dates found to verify 90-day scope.")

    # 5. Strategic Tuning Recommendations
    print("\n[STRATEGIC TUNING PLAN]")
    
    # Analyze Top 3 Patterns for specific advice
    top_patterns = [p[0].lower() for p in patterns.most_common(5) if p[0]]
    
    for p in top_patterns:
        print(f"\nTarget Pattern: '{p[:40]}...'")
        if "cpu" in p:
            print("  -> TYPE: Infrastructure / Saturation")
            print("  -> ACTION: Increase 'CPU saturation' sliding window.")
            print("  -> CFG: Settings > Anomaly Detection > Hosts > CPU > Threshold 95% for 5 mins (up from 3).")
        elif "connection" in p or "fail" in p or "timeout" in p:
            print("  -> TYPE: Availability / Connectivity")
            print("  -> ACTION: Enable 'Retry on error' in Synthetic/Http Monitors.")
            print("  -> CFG: Extension settings > Advanced > Retry on connection failure (x2).")
        elif "disk" in p:
            print("  -> TYPE: Resources / Disk")
            print("  -> ACTION: Switch from % to Fixed Value (MB).")
            print("  -> CFG: Disk anomaly rules > Set 'Free space less than' to 2GB (ignore %).")
        elif "process" in p:
            print("  -> TYPE: Process Availability")
            print("  -> ACTION: Define Maintenance Window or Disable 'Process Unavailable' for non-criticals.")
        else:
            print("  -> TYPE: General Anomaly")
            print("  -> ACTION: Review automated baselining. If frequent, set static threshold.")

if __name__ == "__main__":
    analyze_deep('Alertas.csv')
