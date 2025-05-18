import { SQLiteDatabase } from "expo-sqlite";

async function migrateDbIfNeeded(db: SQLiteDatabase) {
	const DATABASE_VERSION = 1;
	let result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");

	let currentDbVersion = result ? result.user_version : 0;

	console.log({ currentDbVersion, DATABASE_VERSION });
	// await db.execAsync("DROP TABLE IF EXISTS water_goal");

	// if (currentDbVersion >= DATABASE_VERSION) {
	// 	return;
	// }
	// if (currentDbVersion === 1) {
	await db.execAsync(`
			PRAGMA journal_mode = 'wal';
			CREATE TABLE IF NOT EXISTS water_intake (id INTEGER PRIMARY KEY NOT NULL, amount INTEGER NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
			CREATE TABLE IF NOT EXISTS water_goal (id INTEGER PRIMARY KEY NOT NULL, amount INTEGER NOT NULL);
			`);
	currentDbVersion = 1;
	// }

	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export default migrateDbIfNeeded;
