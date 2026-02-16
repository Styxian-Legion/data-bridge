import dotenv from "dotenv";

dotenv.config();

export const APP_CONFIG = {
    NAME: process.env.APP_NAME,
    VERSION: process.env.APP_VERSION,
    HOST: process.env.APP_HOST,
    PORT: process.env.APP_PORT,
    ENVIRONMENT: process.env.APP_ENVIRONMENT,
    DOMAIN: process.env.APP_DOMAIN
}

export const REDIS_CONFIG = {
    HOST: process.env.REDIS_HOST,
    PORT: Number(process.env.REDIS_PORT),
    PASSWORD: process.env.REDIS_PASS
}

export const PG_CONFIG = {
    HOST: process.env.PG_DB_HOST,
    PORT: process.env.PG_DB_PORT,
    USER: process.env.PG_DB_USER,
    PASSWORD: process.env.PG_DB_PASS,
    DATABASE: process.env.PG_DB_NAME,
    MAX_CONNECTION: process.env.PG_MAX_CONNECTION,
    IDLE_TIMEOUT: process.env.PG_IDLE_TIMEOUT,
    CONNECTION_TIMEOUT: process.env.PG_CONNECTION_TIMEOUT
}