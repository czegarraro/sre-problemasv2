# Entregables: Filtro Dinámico de Squads para Dynatrace

## 1. Query DQL (Dynatrace Query Language)

Para extraer los valores únicos de `tn-squad` que se encuentran anidados dentro del array de la evidencia (`evidenceDetails`), la consulta adaptada sería la siguiente:

```dql
fetch events
| filter event.kind == "PROBLEM"
| expand evidenceDetails = coalesce(evidenceDetails, [])
| expand tags = coalesce(evidenceDetails[].data.entityTags, [])
| filter tags.key == "tn-squad"
| summarize count(), by: { squad = tags.value }
```

_(Nota: Puesto que Dynatrace anida las entidades afectadas en la evidencia, la extracción requiere expandir esos arrays antes de filtrar)._

---

## 2. Serverless Function (Vercel API Route)

Un endpoint de Next.js/Vercel modularizado en TypeScript estricto para recuperar y cachear temporalmente los squads.

**Ruta:** `api/squads/index.ts`

```typescript
import { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";

// El cliente se cachea globalmente para Lambdas/Serverless
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI as string);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const problemsCol = db.collection("problems");

    // Aggregation pipeline para extraer los tags anidados
    const pipeline = [
      { $unwind: "$evidenceDetails.details" },
      { $unwind: "$evidenceDetails.details.data.entityTags" },
      { $match: { "evidenceDetails.details.data.entityTags.key": "tn-squad" } },
      {
        $group: {
          _id: "$evidenceDetails.details.data.entityTags.value",
          problemCount: { $sum: 1 },
        },
      },
      { $project: { _id: 0, tagValue: "$_id", name: "$_id", problemCount: 1 } },
      { $sort: { name: 1 } },
    ];

    const squads = await problemsCol.aggregate(pipeline).toArray();

    // Cache-Control para Vercel Edge Network
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

    return res.status(200).json({ success: true, data: squads });
  } catch (error) {
    console.error("Error fetching squads:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
}
```

---

## 3. Componente UI: Select (TypeScript)

Componente tipado que consume la API anterior dinámicamente.

**Ruta:** `src/components/SquadSelect.tsx`

```tsx
import React, { useEffect, useState } from "react";

export interface Squad {
  name: string;
  tagValue: string;
  problemCount: number;
}

interface SquadSelectProps {
  onSquadChange: (squadValue: string | null) => void;
  selectedSquad?: string | null;
}

export const SquadSelect: React.FC<SquadSelectProps> = ({
  onSquadChange,
  selectedSquad = null,
}) => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSquads = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/squads");
        const result = await response.json();
        if (result.success) {
          setSquads(result.data);
        }
      } catch (error) {
        console.error("Failed to load squads:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSquads();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onSquadChange(val === "all" ? null : val);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label
        htmlFor="squad-select"
        className="text-xs font-medium text-gray-400 uppercase"
      >
        Seleccionar Squad
      </label>
      <select
        id="squad-select"
        value={selectedSquad || "all"}
        onChange={handleChange}
        disabled={isLoading}
        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todos los Squads</option>
        {squads.map((squad) => (
          <option key={squad.tagValue} value={squad.tagValue}>
            {squad.name} ({squad.problemCount})
          </option>
        ))}
      </select>
    </div>
  );
};
```

---

## 4. Instrucciones de Deploy en Vercel

1. Guarda el componente `SquadSelect.tsx` en tu carpeta de UI components del frontend.
2. Si usas Next.js o Vercel Serverless, guarda la función backend en la carpeta `api/squads/index.ts`.
3. Simplemente ejecuta:
   ```bash
   git add .
   git commit -m "feat: implement modular squad filter via nested entityTags"
   git push origin main
   ```
4. Vercel detectará el commit en `main`, compilará el frontend estricto de TS y desplegará la Severless Function automáticamente.
