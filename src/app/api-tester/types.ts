import type { KeyValue } from "@/components/KeyValueEditor";

export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type Method = (typeof METHODS)[number];

export type BodyType = "json" | "raw" | "form";
export type AuthType = "none" | "bearer" | "apiKey";

export type Request = {
  method: Method;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  bodyType: BodyType;
  bodyJson: string;
  bodyRaw: string;
  bodyForm: KeyValue[];
  authType: AuthType;
  bearerToken: string;
  apiKeyLocation: "header" | "query";
  apiKeyName: string;
  apiKeyValue: string;
};

export const initialRequest: Request = {
  method: "GET",
  url: "",
  params: [{ key: "", value: "" }],
  headers: [{ key: "", value: "" }],
  bodyType: "json",
  bodyJson: "{}",
  bodyRaw: "",
  bodyForm: [{ key: "", value: "" }],
  authType: "none",
  bearerToken: "",
  apiKeyLocation: "header",
  apiKeyName: "X-Api-Key",
  apiKeyValue: "",
};

export type Ui = {
  activeTab: "params" | "headers" | "body";
  responseTab: "body" | "headers";
  loading: boolean;
};

export const initialUi: Ui = {
  activeTab: "params",
  responseTab: "body",
  loading: false,
};
