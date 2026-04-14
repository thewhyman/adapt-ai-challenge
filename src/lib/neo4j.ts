import neo4j, { Driver, Session, ManagedTransaction, Node as Neo4jNode } from "neo4j-driver";

let driver: Driver | null = null;

function getDriver(): Driver {
  if (driver) return driver;

  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    throw new Error("Missing Neo4j environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)");
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  return driver;
}

export async function read<T = Record<string, unknown>>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const session: Session = getDriver().session({
    database: process.env.NEO4J_DATABASE,
  });
  try {
    const result = await session.executeRead((tx: ManagedTransaction) =>
      tx.run(query, params)
    );
    return result.records.map((r) => r.toObject() as T);
  } finally {
    await session.close();
  }
}

export async function write<T = Record<string, unknown>>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const session: Session = getDriver().session({
    database: process.env.NEO4J_DATABASE,
  });
  try {
    const result = await session.executeWrite((tx: ManagedTransaction) =>
      tx.run(query, params)
    );
    return result.records.map((r) => r.toObject() as T);
  } finally {
    await session.close();
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

/**
 * Convert Neo4j types (Integer, DateTime, Node) to plain JS values.
 * Recursively walks objects and arrays.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPlain(value: any): any {
  if (value === null || value === undefined) return value;
  if (neo4j.isInt(value)) return value.toNumber();
  if (neo4j.isDateTime(value)) return value.toString();
  if (value instanceof Neo4jNode) return toPlain(value.properties);
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toPlain(v);
    }
    return out;
  }
  return value;
}
