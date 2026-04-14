import { NextResponse } from "next/server";
import { read, toPlain } from "@/lib/neo4j";

export async function GET() {
  try {
    const audiences = await read(
      `MATCH (a:AudienceProfile)-[:TARGETS_ROLE]->(r:Role)
       RETURN a, r.name AS roleName, r.orgLevel AS orgLevel
       ORDER BY a.name`
    );

    const formats = await read(
      `MATCH (f:OutputFormat) RETURN f ORDER BY f.name`
    );

    return NextResponse.json({
      audiences: audiences.map((row) => {
        const r = toPlain(row) as Record<string, unknown>;
        return { ...(r.a as object), roleName: r.roleName, orgLevel: r.orgLevel };
      }),
      formats: formats.map((row) => toPlain((row as Record<string, unknown>).f)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
