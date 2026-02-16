import pg from "../../db/pg";

export default class ConnectorRepository {

    static async connectorExists(host: string, port: number, database: string, username: string) {
        const query = `SELECT COUNT(*) AS count
                       FROM connectors
                       WHERE host = $1 AND port = $2 AND database = $3 AND username = $4`;
        const result = await pg.query(query, [host, port, database, username]);
        return result.rows[0].count > 0;
    }

    static async createConnector(data: { dialect: string, host: string, port: number, database: string, username: string, password: string }) {
        const query = `INSERT INTO connectors (dialect, host, port, database, username, password)
                       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, dialect, host, port, database, username, created_at`;
        const values = [data.dialect, data.host, data.port, data.database, data.username, data.password];
        const result = await pg.query(query, values);
        return result.rows[0];
    }

    static async getConnectors() {
        const query = `SELECT id, dialect, host, port, database, username, created_at FROM connectors`;
        const result = await pg.query(query);
        return result.rows;
    }

    static async getConnectorById(id: number | string) {
        const query = `SELECT id, dialect, host, port, database, username, created_at FROM connectors WHERE id = $1`;
        const result = await pg.query(query, [id]);
        return result.rows[0];
    }

    static async updateConnector(id: number | string, data: { dialect: string, host: string, port: number, database: string, username: string, password: string }) {
        const query = `UPDATE connectors
                       SET dialect = $1, host = $2, port = $3, database = $4, username = $5, password = $6
                       WHERE id = $7
                       RETURNING id, dialect, host, port, database, username, created_at`;
        const values = [data.dialect, data.host, data.port, data.database, data.username, data.password, id];
        const result = await pg.query(query, values);
        return result.rows[0];
    }

    static async deleteConnector(id: number | string) {
        const query = `DELETE FROM connectors WHERE id = $1`;
        await pg.query(query, [id]);
        return true;
    }

}