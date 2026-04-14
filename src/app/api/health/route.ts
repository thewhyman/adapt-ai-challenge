import { NextResponse } from "next/server";
import { read } from "@/lib/neo4j";

export async function GET() {
  try {
    const rows = await read<{ type: string; count: number }>(
      "MATCH (n) RETURN labels(n)[0] AS type, count(n) AS count ORDER BY type"
    );

    const counts: Record<string, number> = {};
    for (const row of rows) {
      if (row.type) counts[row.type] = Number(row.count);
    }

    return NextResponse.json({ status: "ok", neo4j: counts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
