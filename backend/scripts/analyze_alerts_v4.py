
import csv
import collections
import sys
import os

def analyze_alerts(file_path):
    print(f"ANALYZING {file_path}")
    
    if not os.path.exists(file_path):
        print("No file")
        return

    with open(file_path, 'r', encoding='latin-1', errors='replace') as f:
        reader = csv.DictReader(f)
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        rows = list(reader)
        
    best_col = None
    max_score = -1
    
    for col in headers:
        values = [row.get(col, '') for row in rows]
        valid_values = [v for v in values if v and v.strip() not in ['#N/A', 'Unknown', 'None', '', '0', '1']]
        
        if not valid_values: continue
        
        # Score = (Unique Values * Average Length) / Total Rows
        unique_count = len(set(valid_values))
        avg_len = sum(len(v) for v in valid_values) / len(valid_values)
        
        # We prefer columns with significant text but some repetition (alerts repeat)
        # If unique_count == len(rows), it's probably an ID -> bad for grouping
        # If unique_count is very low (e.g. 5), it might be status -> bad for specific alert name
        
        score = (avg_len * 2) - (abs(len(rows) - unique_count) * 0.1)
        if unique_count < 5: score -= 50 # Penalize low cardinality (Status)
        if unique_count > len(rows) * 0.9: score -= 50 # Penalize high cardinality (IDs)
        
        if score > max_score:
            max_score = score
            best_col = col

    print(f"Best Column Detected: '{best_col}' (Score: {max_score:.2f})")
    
    if not best_col:
        print("Could not detect a good description column.")
        return

    alert_counts = collections.Counter(row.get(best_col, '').strip() for row in rows)
    
    print(f"Total Alerts: {len(rows)}")
    print("TOP 10 COMMON ALERTS:")
    for name, count in alert_counts.most_common(10):
         # Skip if empty or bad
         if not name or name == '#N/A': continue
         
         print(f"- [{count}] {name[:60]}")
         
         # Recommendation
         rec = ""
         name_l = name.lower()
         if "cpu" in name_l: rec = "Check CPU Saturation / Increase Observation Window"
         elif "memory" in name_l: rec = "Check Memory / GC Metrics"
         elif "disk" in name_l: rec = "Check Disk Space (MB vs %)"
         elif "service" in name_l: rec = "Check Failure Rate / Ignore 404s"
         elif "synthetic" in name_l: rec = "Check Synthetic Stability"
         elif "process" in name_l: rec = "Check Process Availability"
         
         if rec: print(f"  -> RECOMMENDATION: {rec}")

if __name__ == "__main__":
    analyze_alerts('Alertas.csv')
