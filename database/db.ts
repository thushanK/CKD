import { SQLiteDatabase } from "expo-sqlite";

async function migrateDbIfNeeded(db: SQLiteDatabase) {
	const DATABASE_VERSION = 1;
	let result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
	console.log(result);

	let currentDbVersion = result ? result.user_version : 0;
	if (currentDbVersion >= DATABASE_VERSION) {
		return;
	}
	if (currentDbVersion === 0) {
		await db.execAsync(`
  PRAGMA journal_mode = 'wal';
  CREATE TABLE IF NOT EXISTS water_intake (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount INTEGER NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        );
  `);
		// await db.runAsync("INSERT INTO todos (value, intValue) VALUES (?, ?)", "hello", 1);
		// await db.runAsync("INSERT INTO todos (value, intValue) VALUES (?, ?)", "world", 2);
		currentDbVersion = 1;
	}
	// if (currentDbVersion === 1) {
	//   Add more migrations
	// }
	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export default migrateDbIfNeeded;
