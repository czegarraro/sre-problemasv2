
import csv
import collections
import sys
import os

# Force UTF-8 output for Windows console
sys.stdout.reconfigure(encoding='utf-8')

def analyze_alerts(file_path):
    print(f"ANÁLISIS PROFESIONAL DE ALERTAS: {file_path}")
    print("="*60)
    
    if not os.path.exists(file_path):
        print("Error: Archivo no encontrado.")
        return

    with open(file_path, 'r', encoding='latin-1', errors='replace') as f: # Latin-1 is common for Excel CSVs in Spanish
        # Sniff delimiter
        try:
            sample = f.read(2048)
            f.seek(0)
            dialect = csv.Sniffer().sniff(sample)
        except:
            dialect = 'excel'
            
        reader = csv.DictReader(f) #, dialect=dialect)
        
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        print(f"Cabeceras Detectadas: {headers}")
        
        # Heuristic to find the Description Column (Likely contains the Alert Name)
        # We look for common names
        desc_candidates = ['breve descripción', 'resumen', 'description', 'short description', 'asunto', 'título', 'summary', 'detalle']
        desc_col = next((h for h in headers if h.lower() in desc_candidates), None)
        
        # If not matched by name, maybe the 12th column? Or we just pick one with long text later?
        # Let's fallback to 'Elemento' for CI.
        ci_col = next((h for h in headers if 'elemento' in h.lower() or 'ci' == h.lower() or 'configuration item' in h.lower()), None)
        
        print(f"Columna de Descripción (Título): {desc_col or 'NO DETECTADA'}")
        print(f"Columna de CI (Elemento): {ci_col or 'NO DETECTADA'}")

        alerts = []
        for row in reader:
            # If no desc col found, try to find the longest value in the row to guess description
            if not desc_col:
                # exclude known non-desc columns
                candidates = {k: v for k, v in row.items() if k not in ['Número', 'Prioridad', 'Estado', 'Abierto', 'Cerrado']}
                if candidates:
                    desc_col = max(candidates, key=lambda k: len(candidates[k]) if candidates[k] else 0)
            
            alerts.append(row)
            
    print(f"Total Incidentes Analizados: {len(alerts)}")
    
    # 1. Top Noisy CIs
    if ci_col:
        ci_counts = collections.Counter(row.get(ci_col, 'Unknown') for row in alerts)
        print("\nTOP 10 ELEMENTOS (CIs) MÁS RUIDOSOS:")
        print(f"{'#':<5} {'CI / Elemento':<50} {'Incidentes':<10}")
        print("-" * 70)
        for name, count in ci_counts.most_common(10):
            print(f"{count:<5} {str(name)[:48]:<50} {count:<10}")

    # 2. Top Alert Titles (Patterns)
    if desc_col:
        # Normalize: Take first 50 chars to group similar alerts (ignoring specific IDs often at end)
        title_counts = collections.Counter(row.get(desc_col, '').strip() for row in alerts)
        
        print("\nTOP 10 MOTIVOS DE ALERTA (PATRONES):")
        print(f"{'#':<5} {'Patrón de Alerta':<80} {'Frecuencia':<10}")
        print("-" * 100)
        for name, count in title_counts.most_common(10):
            # Clean up newlines
            clean_name = str(name).replace('\n', ' ')[:78]
            print(f"{count:<5} {clean_name:<80} {count:<10}")

        # 3. Recommendations
        print("\n" + "="*60)
        print("RECOMENDACIONES DE AFINAMIENTO EN DYNATRACE")
        print("="*60)
        
        total = len(alerts)
        if total > 0:
            for name, count in title_counts.most_common(5):
                percent = (count / total) * 100
                print(f"\n[ALERTA]: {name[:100]}...")
                print(f"  > Impacto: {count} incidentes ({percent:.1f}% del total)")
                
                # Heuristic Recommendations
                desc_lower = name.lower()
                if "cpu" in desc_lower:
                    print("  > ACCIÓN: Ajustar umbral de CPU Saturation. Considerar aumentar la ventana de observación (ej. de 3 min a 5 min) para evitar picos transitorios.")
                elif "memory" in desc_lower or "memoria" in desc_lower:
                    print("  > ACCIÓN: Revisar Memory Usage. Verificar si es Java/Garbage Collection (activar GC metrics) o memoria del SO. Ajustar umbral si es un comportamiento base.")
                elif "disk" in desc_lower or "disco" in desc_lower:
                    print("  > ACCIÓN: Ajustar Low Disk Space. Cambiar la lógica de % a valor fijo (MB) si son discos grandes, o ignorar particiones temporales.")
                elif "service" in desc_lower or "servicio" in desc_lower or "failure" in desc_lower:
                    print("  > ACCIÓN: Revisar Failure Rate. Filtrar errores HTTP 404/400 si no son críticos. Usar 'Automated Baselines' en lugar de umbrales fijos.")
                elif "process" in desc_lower or "proceso" in desc_lower:
                    print("  > ACCIÓN: Process Unavailable. Verificar si el proceso tiene reinicios programados. Definir 'Maintenance Windows' para horarios conocidos.")
                elif "synthetic" in desc_lower:
                    print("  > ACCIÓN: Synthetic Monitor Failed. Verificar estabilidad de la prueba desde todas las ubicaciones. Si es intermitente, aumentar el conteo de reintentos.")
                else:
                    print("  > ACCIÓN: Analizar si es una alerta de 'Availability' o 'Performance'. Si es frecuente y se cierra rápido, aumentar el umbral de tiempo de alerta.")

if __name__ == "__main__":
    analyze_alerts('Alertas.csv')
