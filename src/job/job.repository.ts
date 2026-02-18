import pg from "../../db/pg";

export default class JobRepository {
    static async createJob(data: { name: string; connector_ids: string[]; mapping_id: string }) {

        const client = await pg.connect();

        try {
            await client.query("BEGIN");

            const { name, connector_ids, mapping_id } = data;

            const mappingCheck = await client.query(
                "SELECT id FROM mappings WHERE id = $1",
                [mapping_id]
            );

            if (mappingCheck.rowCount === 0) {
                throw new Error(`Mapping with ID ${mapping_id} does not exist.`);
            }

            const connectorCheck = await client.query(
                "SELECT id FROM connectors WHERE id = ANY($1::bigint[])",
                [connector_ids]
            );

            if (connectorCheck.rowCount !== connector_ids.length) {
                throw new Error("One or more connector IDs are invalid.");
            }

            for (const connector_id of connector_ids) {
                await client.query(
                    `
                INSERT INTO mapping_connectors 
                (name, mapping_id, connector_id, status)
                VALUES ($1, $2, $3, 'pending')
                `,
                    [name, mapping_id, connector_id]
                );
            }

            await client.query("COMMIT");

            return {
                name,
                mapping_id,
                connector_ids
            };

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    static async getJobs() {
        const query = `
        SELECT DISTINCT ON (name) name
        FROM mapping_connectors
        ORDER BY name, id DESC
    `;
        const { rows } = await pg.query(query);
        return rows;
    }

    static async getJobByName(name: string) {
        const query = `
        SELECT 
            mc.name,
            mc.status,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'mapping_id', m.id,
                        'mapping_name', m.name,
                        'table_name', m.table_name,
                        'redis_key', m.redis_key
                    )
                ) FILTER (WHERE m.id IS NOT NULL),
                '[]'
            ) AS mappings,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'connector_id', c.id,
                        'dialect', c.dialect,
                        'host', c.host,
                        'port', c.port,
                        'database', c.database,
                        'username', c.username,
                        'password', c.password
                    )
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'
            ) AS connectors

        FROM mapping_connectors mc
        JOIN mappings m ON m.id = mc.mapping_id
        JOIN connectors c ON c.id = mc.connector_id

        WHERE mc.name = $1
        GROUP BY mc.name, mc.status
    `;

        const { rows } = await pg.query(query, [name]);
        return rows[0] ?? null;
    }

}