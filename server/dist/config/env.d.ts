export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    CORS_ORIGIN: string;
    OPENAI_MODEL: string;
    DEFAULT_PROVIDER: "openai" | "local";
    MAX_HISTORY_MESSAGES: number;
    REQUEST_BODY_LIMIT: string;
    OPENAI_API_KEY?: string | undefined;
};
