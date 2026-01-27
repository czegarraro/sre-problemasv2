
import csv
import collections
import sys
import os

# Force UTF-8 output for Windows console/redirection
sys.stdout.reconfigure(encoding='utf-8')

def analyze_alerts(file_path):
    print(f"Analyzing {file_path}...")
    
    if not os.path.exists(file_path):
        print("File not found.")
        return

    # Detected columns based on preview: Número,Tipo de tarea,Prioridad...
    # We need to find the specific column for the Alert Name/Title.
    
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        # Try to deduce dialect
        try:
            sample = f.read(1024)
            f.seek(0)
            dialect = csv.Sniffer().sniff(sample)
            has_header = csv.Sniffer().has_header(sample)
        except:
            dialect = 'excel' # Default to standard comma
            has_header = True
            f.seek(0)
            
        reader = csv.DictReader(f) #, dialect=dialect)
        
        # Normlize headers to lowercase for easier access
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        print(f"Detected Headers: {headers}")

        print("\n--- SAMPLE DATA (First 3 rows) ---")
        for i, row in enumerate(reader):
            if i >= 3: break
            print(f"Row {i+1}: {row}")
            
        return

if __name__ == "__main__":
    analyze_alerts('Alertas.csv')
