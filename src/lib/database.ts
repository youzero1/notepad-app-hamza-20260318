import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Note } from './entities/Note';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/notepad.db';

// Ensure data directory exists
const dataDir = path.dirname(path.resolve(DATABASE_PATH));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: path.resolve(DATABASE_PATH),
    synchronize: true,
    logging: false,
    entities: [Note],
  });

  await dataSource.initialize();
  return dataSource;
}
