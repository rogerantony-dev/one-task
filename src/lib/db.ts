import type { SQLiteDatabase } from "expo-sqlite";
import type { Request } from "@/app/api-tester/types";

const DATABASE_VERSION = 1;

export type CollectionRow = {
  id: number;
  name: string;
  base_url_prod: string;
  base_url_dev: string;
  base_url_custom: string | null;
};

export type RequestRow = {
  id: number;
  collection_id: number;
  name: string | null;
  method: string;
  path: string;
  params_json: string;
  headers_json: string;
  body_type: string;
  body_json: string;
  body_raw: string;
  body_form_json: string;
  auth_type: string;
  bearer_token: string;
  api_key_location: string;
  api_key_name: string;
  api_key_value: string;
};

export type RequestPayload = Omit<Request, "url"> & { path: string };
export type CollectionInsert = {
  name: string;
  baseUrlProd: string;
  baseUrlDev: string | null;
  baseUrlCustom: string | null;
};

export async function initSchema(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        base_url_prod TEXT NOT NULL DEFAULT '',
        base_url_dev TEXT NOT NULL DEFAULT '',
        base_url_custom TEXT
      );
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        name TEXT,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        params_json TEXT NOT NULL,
        headers_json TEXT NOT NULL,
        body_type TEXT NOT NULL,
        body_json TEXT NOT NULL,
        body_raw TEXT NOT NULL,
        body_form_json TEXT NOT NULL,
        auth_type TEXT NOT NULL,
        bearer_token TEXT NOT NULL,
        api_key_location TEXT NOT NULL,
        api_key_name TEXT NOT NULL,
        api_key_value TEXT NOT NULL,
        FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_requests_collection_id ON requests (collection_id);
    `);
  }

  await db.runAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

function requestToRow(collectionId: number, name: string | null, r: RequestPayload): Omit<RequestRow, "id"> {
  return {
    collection_id: collectionId,
    name,
    method: r.method,
    path: r.path,
    params_json: JSON.stringify(r.params),
    headers_json: JSON.stringify(r.headers),
    body_type: r.bodyType,
    body_json: r.bodyJson,
    body_raw: r.bodyRaw,
    body_form_json: JSON.stringify(r.bodyForm),
    auth_type: r.authType,
    bearer_token: r.bearerToken,
    api_key_location: r.apiKeyLocation,
    api_key_name: r.apiKeyName,
    api_key_value: r.apiKeyValue,
  };
}

function rowToRequest(row: RequestRow): Request & { id: number; name: string | null } {
  return {
    id: row.id,
    name: row.name,
    method: row.method as Request["method"],
    url: row.path,
    params: JSON.parse(row.params_json),
    headers: JSON.parse(row.headers_json),
    bodyType: row.body_type as Request["bodyType"],
    bodyJson: row.body_json,
    bodyRaw: row.body_raw,
    bodyForm: JSON.parse(row.body_form_json),
    authType: row.auth_type as Request["authType"],
    bearerToken: row.bearer_token,
    apiKeyLocation: row.api_key_location as Request["apiKeyLocation"],
    apiKeyName: row.api_key_name,
    apiKeyValue: row.api_key_value,
  };
}

export async function getCollections(db: SQLiteDatabase): Promise<CollectionRow[]> {
  const rows = await db.getAllAsync<CollectionRow>("SELECT * FROM collections ORDER BY name");
  return rows;
}

export async function getCollection(db: SQLiteDatabase, id: number): Promise<CollectionRow | null> {
  const row = await db.getFirstAsync<CollectionRow>("SELECT * FROM collections WHERE id = ?", id);
  return row ?? null;
}

export async function createCollection(
  db: SQLiteDatabase,
  data: CollectionInsert
): Promise<CollectionRow> {
  const result = await db.runAsync(
    "INSERT INTO collections (name, base_url_prod, base_url_dev, base_url_custom) VALUES (?, ?, ?, ?)",
    data.name,
    data.baseUrlProd,
    data.baseUrlDev ?? "",
    data.baseUrlCustom
  );
  const row = await db.getFirstAsync<CollectionRow>("SELECT * FROM collections WHERE id = ?", result.lastInsertRowId);
  if (!row) throw new Error("Failed to read created collection");
  return row;
}

export async function updateCollection(
  db: SQLiteDatabase,
  id: number,
  data: Partial<CollectionInsert>
): Promise<void> {
  const updates: string[] = [];
  const values: (string | null)[] = [];
  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.baseUrlProd !== undefined) {
    updates.push("base_url_prod = ?");
    values.push(data.baseUrlProd);
  }
  if (data.baseUrlDev !== undefined) {
    updates.push("base_url_dev = ?");
    values.push(data.baseUrlDev ?? "");
  }
  if (data.baseUrlCustom !== undefined) {
    updates.push("base_url_custom = ?");
    values.push(data.baseUrlCustom);
  }
  if (updates.length === 0) return;
  values.push(String(id));
  await db.runAsync(
    `UPDATE collections SET ${updates.join(", ")} WHERE id = ?`,
    ...values
  );
}

export async function deleteCollection(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM requests WHERE collection_id = ?", id);
  await db.runAsync("DELETE FROM collections WHERE id = ?", id);
}

export type SavedRequest = Request & { id: number; name: string | null };

export async function getRequests(db: SQLiteDatabase, collectionId: number): Promise<SavedRequest[]> {
  const rows = await db.getAllAsync<RequestRow>(
    "SELECT * FROM requests WHERE collection_id = ? ORDER BY name, id",
    collectionId
  );
  return rows.map(rowToRequest);
}

export async function getRequest(db: SQLiteDatabase, id: number): Promise<SavedRequest | null> {
  const row = await db.getFirstAsync<RequestRow>("SELECT * FROM requests WHERE id = ?", id);
  return row ? rowToRequest(row) : null;
}

export async function saveRequest(
  db: SQLiteDatabase,
  collectionId: number,
  payload: RequestPayload,
  name: string | null,
  existingId?: number
): Promise<SavedRequest> {
  const row = requestToRow(collectionId, name, payload);
  if (existingId != null) {
    await db.runAsync(
      `UPDATE requests SET
        collection_id = ?, name = ?, method = ?, path = ?, params_json = ?, headers_json = ?,
        body_type = ?, body_json = ?, body_raw = ?, body_form_json = ?,
        auth_type = ?, bearer_token = ?, api_key_location = ?, api_key_name = ?, api_key_value = ?
      WHERE id = ?`,
      row.collection_id,
      row.name,
      row.method,
      row.path,
      row.params_json,
      row.headers_json,
      row.body_type,
      row.body_json,
      row.body_raw,
      row.body_form_json,
      row.auth_type,
      row.bearer_token,
      row.api_key_location,
      row.api_key_name,
      row.api_key_value,
      existingId
    );
    const updated = await getRequest(db, existingId);
    if (!updated) throw new Error("Failed to read updated request");
    return updated;
  }
  const result = await db.runAsync(
    `INSERT INTO requests (
      collection_id, name, method, path, params_json, headers_json,
      body_type, body_json, body_raw, body_form_json,
      auth_type, bearer_token, api_key_location, api_key_name, api_key_value
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    row.collection_id,
    row.name,
    row.method,
    row.path,
    row.params_json,
    row.headers_json,
    row.body_type,
    row.body_json,
    row.body_raw,
    row.body_form_json,
    row.auth_type,
    row.bearer_token,
    row.api_key_location,
    row.api_key_name,
    row.api_key_value
  );
  const created = await getRequest(db, result.lastInsertRowId as number);
  if (!created) throw new Error("Failed to read created request");
  return created;
}

export async function deleteRequest(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM requests WHERE id = ?", id);
}
