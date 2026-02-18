import pg from "../../db/pg";

export default class MappingRepository {

    static async createMapping(data: { name: string, table_name: string, source_file: string, redis_key: string }) {
        const query = `
            INSERT INTO mappings (name, table_name, source_file, redis_key)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, table_name, source_file, redis_key, created_at
        `;
        const values = [data.name, data.table_name, data.source_file, data.redis_key];
        const { rows } = await pg.query(query, values);
        return rows[0];
    }

    static async getMappings() {
        const query = `
            SELECT id, name, table_name, source_file, redis_key, created_at
            FROM mappings
        `;
        const { rows } = await pg.query(query);
        return rows;
    }

    static async getMappingById(id: number | string) {
        const query = `
            SELECT id, name, table_name, source_file, redis_key, created_at
            FROM mappings
            WHERE id = $1
        `;
        const values = [id];
        const { rows } = await pg.query(query, values);
        return rows[0];
    }

    static async deleteMapping(id: number | string) {
        const query = `
            DELETE FROM mappings
            WHERE id = $1
        `;
        const values = [id];
        await pg.query(query, values);
        return true;
    }

}