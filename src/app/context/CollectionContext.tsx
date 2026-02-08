import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSQLiteContext } from "expo-sqlite";
import * as db from "@/lib/db";
import type { Request } from "@/app/api-tester/types";

export type BaseUrlKind = "prod" | "dev" | "custom";

type CollectionContextValue = {
  collections: db.CollectionRow[];
  currentCollectionId: number | null;
  currentCollection: db.CollectionRow | null;
  baseUrlKind: BaseUrlKind;
  currentBaseUrl: string;
  savedRequests: db.SavedRequest[];
  setCurrentCollection: (id: number | null) => void;
  setBaseUrlKind: (kind: BaseUrlKind) => void;
  createCollection: (data: db.CollectionInsert) => Promise<db.CollectionRow>;
  updateCollection: (id: number, data: Partial<db.CollectionInsert>) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  refreshCollections: () => Promise<void>;
  saveRequest: (
    payload: Omit<Request, "url"> & { path: string },
    name: string | null,
    existingId?: number
  ) => Promise<db.SavedRequest>;
  loadRequest: (id: number) => Promise<db.SavedRequest | null>;
  deleteRequest: (id: number) => Promise<void>;
  refreshRequests: () => Promise<void>;
};

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function useCollectionContext(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error("useCollectionContext must be used within CollectionProvider");
  return ctx;
}

function normalizeBaseUrl(url: string): string {
  const s = url.trim();
  if (!s) return "";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export function CollectionProvider({ children }: { children: ReactNode }) {
  const sqlite = useSQLiteContext();
  const [collections, setCollections] = useState<db.CollectionRow[]>([]);
  const [currentCollectionId, setCurrentCollectionId] = useState<number | null>(null);
  const [baseUrlKind, setBaseUrlKindState] = useState<BaseUrlKind>("dev");
  const [savedRequests, setSavedRequests] = useState<db.SavedRequest[]>([]);

  const refreshCollections = useCallback(async () => {
    const list = await db.getCollections(sqlite);
    setCollections(list);
  }, [sqlite]);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  const currentCollection = useMemo(
    () => collections.find((c) => c.id === currentCollectionId) ?? null,
    [collections, currentCollectionId]
  );

  const currentBaseUrl = useMemo(() => {
    if (!currentCollection) return "";
    const raw =
      baseUrlKind === "prod"
        ? currentCollection.base_url_prod
        : baseUrlKind === "dev"
          ? currentCollection.base_url_dev
          : currentCollection.base_url_custom ?? "";
    return normalizeBaseUrl(raw);
  }, [currentCollection, baseUrlKind]);

  const refreshRequests = useCallback(async () => {
    if (currentCollectionId == null) {
      setSavedRequests([]);
      return;
    }
    const list = await db.getRequests(sqlite, currentCollectionId);
    setSavedRequests(list);
  }, [sqlite, currentCollectionId]);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  const setCurrentCollection = useCallback((id: number | null) => {
    setCurrentCollectionId(id);
  }, []);

  const setBaseUrlKind = useCallback((kind: BaseUrlKind) => {
    setBaseUrlKindState(kind);
  }, []);

  const createCollection = useCallback(
    async (data: db.CollectionInsert) => {
      const row = await db.createCollection(sqlite, data);
      await refreshCollections();
      return row;
    },
    [sqlite, refreshCollections]
  );

  const updateCollection = useCallback(
    async (id: number, data: Partial<db.CollectionInsert>) => {
      await db.updateCollection(sqlite, id, data);
      await refreshCollections();
    },
    [sqlite, refreshCollections]
  );

  const deleteCollection = useCallback(
    async (id: number) => {
      await db.deleteCollection(sqlite, id);
      if (currentCollectionId === id) setCurrentCollectionId(null);
      await refreshCollections();
    },
    [sqlite, currentCollectionId, refreshCollections]
  );

  const saveRequest = useCallback(
    async (
      payload: Omit<Request, "url"> & { path: string },
      name: string | null,
      existingId?: number
    ) => {
      if (currentCollectionId == null) throw new Error("No collection selected");
      const saved = await db.saveRequest(sqlite, currentCollectionId, payload, name, existingId);
      await refreshRequests();
      return saved;
    },
    [sqlite, currentCollectionId, refreshRequests]
  );

  const loadRequest = useCallback(
    async (id: number) => {
      return db.getRequest(sqlite, id);
    },
    [sqlite]
  );

  const deleteRequest = useCallback(
    async (id: number) => {
      await db.deleteRequest(sqlite, id);
      await refreshRequests();
    },
    [sqlite, refreshRequests]
  );

  const value: CollectionContextValue = useMemo(
    () => ({
      collections,
      currentCollectionId,
      currentCollection,
      baseUrlKind,
      currentBaseUrl,
      savedRequests,
      setCurrentCollection,
      setBaseUrlKind,
      createCollection,
      updateCollection,
      deleteCollection,
      refreshCollections,
      saveRequest,
      loadRequest,
      deleteRequest,
      refreshRequests,
    }),
    [
      collections,
      currentCollectionId,
      currentCollection,
      baseUrlKind,
      currentBaseUrl,
      savedRequests,
      setCurrentCollection,
      setBaseUrlKind,
      createCollection,
      updateCollection,
      deleteCollection,
      refreshCollections,
      saveRequest,
      loadRequest,
      deleteRequest,
      refreshRequests,
    ]
  );

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}
