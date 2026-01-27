
import csv
import collections
import sys
import os

# No special encoding force - standard console
# sys.stdout.reconfigure(encoding='utf-8')

def analyze_alerts(file_path):
    print("ANALISIS RAPIDO DE ALERTAS (V3)")
    
    if not os.path.exists(file_path):
        print("No file")
        return

    with open(file_path, 'r', encoding='latin-1', errors='replace') as f:
        reader = csv.DictReader(f)
        
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        
        # Heuristic for description
        desc_candidates = ['breve descripcion', 'resumen', 'description', 'short description', 'asunto', 'titulo', 'summary', 'detalle', 'elemento']
        desc_col = next((h for h in headers if any(cand in h.lower() for cand in desc_candidates)), None)
        
        if not desc_col:
            # Fallback: check values
            rows = list(reader)
            if not rows: return
            
            # Find longest string column
            sample = rows[0]
            desc_col = max(sample, key=lambda k: len(sample[k]) if sample[k] else 0)
            
            # Reset reader
            f.seek(0)
            next(f) # skip header
            reader = csv.DictReader(f) # Re-init

        alerts = [row.get(desc_col, '').strip() for row in reader]

    total = len(alerts)
    counts = collections.Counter(alerts)
    
    print(f"Total: {total}")
    print("TOP 5 ALERTAS:")
    for name, count in counts.most_common(5):
        percent = (count/total)*100
        print(f"{count} ({percent:.1f}%) - {name[:60]}")
        
        # Simple recommendation
        if "cpu" in name.lower(): print("  -> TUNE: CPU Saturation (increase window)")
        elif "mem" in name.lower(): print("  -> TUNE: Memory usage (GC/OS check)")
        elif "disk" in name.lower(): print("  -> TUNE: Low Disk Space (use MB, not %)")
        else: print("  -> TUNE: Check Frequency/Threshold")

if __name__ == "__main__":
    analyze_alerts('Alertas.csv')
