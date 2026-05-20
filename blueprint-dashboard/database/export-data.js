/**
 * Export Data from Supabase — Generates seed-data.sql
 * ============================================================================
 * Exports all existing data from the current Supabase database into a
 * seed-data.sql file with INSERT statements. This file can then be run
 * against a new Supabase instance to restore all data.
 *
 * Usage:
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   node export-data.js
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (value instanceof Date) return `'${value.toISOString()}'`;
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateInserts(table, rows) {
  if (!rows || rows.length === 0) return `-- No data in ${table}\n`;

  const columns = Object.keys(rows[0]);
  const values = rows.map(row =>
    `(${columns.map(col => escapeSql(row[col])).join(', ')})`
  );

  return [
    `-- ── ${table.toUpperCase()} (${rows.length} rows) ──`,
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES`,
    values.join(',\n') + ';',
    ''
  ].join('\n');
}

async function exportTable(table) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`Error exporting ${table}:`, error.message);
    return `-- Error exporting ${table}: ${error.message}\n`;
  }
  console.log(`  Exported ${data?.length || 0} rows from ${table}`);
  return generateInserts(table, data || []);
}

async function main() {
  console.log('Exporting data from Supabase...');
  console.log(`  URL: ${supabaseUrl}`);

  const tables = [
    'users',
    'teams',
    'team_members',
    'tasks',
    'milestones',
    'progress_updates',
    'tracker_state',
    'settings',
    'reset_tokens',
  ];

  let sql = `-- ============================================================================
-- Rockcrete USA Blueprint Dashboard V18 — Seed Data (Auto-Generated)
-- ============================================================================
-- Generated: ${new Date().toISOString()}
-- Source: ${supabaseUrl}
--
-- Run this SQL AFTER schema.sql to restore all existing data.
-- ============================================================================

`;

  for (const table of tables) {
    sql += await exportTable(table);
    sql += '\n';
  }

  const outputPath = join(__dirname, 'seed-data.sql');
  writeFileSync(outputPath, sql, 'utf8');
  console.log(`\nSeed data written to: ${outputPath}`);
  console.log('You can now run this file against a new Supabase instance.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
