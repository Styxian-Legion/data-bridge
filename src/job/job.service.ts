import { Pool } from "pg";
import { redis } from "../../db/redis";

import JobRepository from "./job.repository";
import ResponseError from "../../utils/response-error";

export default class JobService {

    static async createJob(data: { name: string; connector_ids: string[]; mapping_id: string }) {
        const job = await JobRepository.createJob(data);
        if (!job) {
            throw new ResponseError({
                status: 500,
                code: "JOB_CREATION_FAILED",
                message: "Failed to create job.",
            });
        }
        return job;
    }

    static async getJobs() {
        try {
            const jobs = await JobRepository.getJobs();
            return jobs;
        } catch (error) {
            throw new ResponseError({
                status: 500,
                code: "JOB_RETRIEVAL_FAILED",
                message: "Failed to retrieve jobs.",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }

    static async getJobByName(name: string) {
        const job = await JobRepository.getJobByName(name);
        if (!job) {
            throw new ResponseError({
                status: 404,
                code: "JOB_NOT_FOUND",
                message: `Job with name "${name}" not found.`,
            });
        }
        return job;
    }

    static async runJob(name: string) {

        const job = await JobRepository.getJobByName(name);

        if (!job) {
            throw new ResponseError({
                status: 404,
                code: "JOB_NOT_FOUND",
                message: `Job with name "${name}" not found.`,
            });
        }

        if (!job.connectors?.length) {
            throw new ResponseError({
                status: 400,
                code: "NO_CONNECTORS",
                message: "No connectors associated with this job.",
            });
        }

        const mapping = job.mappings[0];

        const tableName = sanitizeIdentifier(mapping.table_name);
        const redisKey = mapping.redis_key;

        const redisRaw = await redis.get(redisKey);

        if (!redisRaw) {
            throw new ResponseError({
                status: 404,
                code: "REDIS_DATA_NOT_FOUND",
                message: "No data found in Redis."
            });
        }

        const redisData = JSON.parse(redisRaw);

        if (!Array.isArray(redisData) || redisData.length === 0) {
            throw new ResponseError({
                status: 400,
                code: "EMPTY_REDIS_DATA",
                message: "Redis data empty."
            });
        }

        const redisKeys = Object.keys(redisData[0]).map(sanitizeIdentifier);

        const results = [];

        for (const connector of job.connectors) {

            if (connector.dialect !== "postgresql") continue;

            const pool = new Pool({
                host: connector.host,
                port: connector.port || 5432,
                database: connector.database,
                user: connector.username,
                password: connector.password,
            });

            const client = await pool.connect();

            try {

                // =========================
                // CHECK TABLE EXIST
                // =========================
                const tableCheck = await client.query(`
                SELECT to_regclass($1) as exists
            `, [tableName]);

                if (!tableCheck.rows[0].exists) {

                    const columnsSQL = redisKeys.map(k => {
                        const sampleValue = redisData[0][k];
                        return `"${k}" ${detectPostgresType(sampleValue)}`;
                    }).join(",");

                    await client.query(`
                    CREATE TABLE "${tableName}" (
                        id SERIAL PRIMARY KEY,
                        ${columnsSQL},
                        ingested_at TIMESTAMP DEFAULT NOW()
                    )
                `);
                }

                // =========================
                // CHECK MISSING COLUMNS
                // =========================
                const existingColsRes = await client.query(`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = $1
            `, [tableName]);

                const existingCols = existingColsRes.rows.map(r => r.column_name);

                const missingCols = redisKeys.filter(col => !existingCols.includes(col));

                for (const col of missingCols) {

                    const sampleValue = redisData[0][col];

                    await client.query(`
                    ALTER TABLE "${tableName}"
                    ADD COLUMN "${col}" ${detectPostgresType(sampleValue)}
                `);
                }

                // =========================
                // INSERT DATA (APPEND ONLY)
                // =========================
                const BATCH_SIZE = 1000;

                for (let i = 0; i < redisData.length; i += BATCH_SIZE) {

                    const batch = redisData.slice(i, i + BATCH_SIZE);

                    const colsSQL = redisKeys.map(k => `"${k}"`).join(",");

                    const values: any[] = [];
                    const placeholders: string[] = [];

                    batch.forEach((row) => {

                        const rowValues = redisKeys.map(k => row[k]);

                        const rowPlaceholders = rowValues.map((_, colIndex) => {
                            return `$${values.length + colIndex + 1}`;
                        });

                        values.push(...rowValues);
                        placeholders.push(`(${rowPlaceholders.join(",")})`);
                    });

                    await client.query(`
                    INSERT INTO "${tableName}" (${colsSQL})
                    VALUES ${placeholders.join(",")}
                `, values);
                }

                results.push({
                    connector_id: connector.connector_id,
                    database: connector.database
                });

            } finally {
                client.release();
                await pool.end();
            }
        }

        return {
            status: 200,
            code: "JOB_RAN",
            message: "Job ran successfully.",
            data: results
        };
    }

}



function sanitizeIdentifier(name: string) {
    return name.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
}


function detectPostgresType(value: any): string {
    if (typeof value === "number") return "NUMERIC";
    if (typeof value === "boolean") return "BOOLEAN";
    if (value instanceof Date) return "TIMESTAMP";
    return "TEXT";
}


