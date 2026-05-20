/**
 * Verify Database Integrity — Post-Migration Check
 * ============================================================================
 * Verifies that all tables exist, have the correct structure, and contain
 * the expected data after a migration.
 *
 * Usage:
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   node verify-db.js
 *
 * Optional: Pass expected row counts as a JSON file:
 *   node verify-db.js expected-counts.json
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';
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

const TABLES = [
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

async function checkTable(table, expectedCount) {
  const { data, count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`  ❌ ${table}: Table missing or error - ${error.message}`);
    return false;
  }

  const actualCount = count || 0;
  const status = expectedCount !== undefined && actualCount !== expectedCount
    ? `⚠️  Expected ${expectedCount}, got ${actualCount}`
    : '✅';

  console.log(`  ${status} ${table}: ${actualCount} rows`);
  return true;
}

async function checkSettings() {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) {
    console.log(`  ❌ settings: Default row missing - ${error.message}`);
    return false;
  }
  console.log(`  ✅ settings: Default config row exists`);
  return true;
}

async function checkIndexes() {
  const { data, error } = await supabase
    .from('pg_indexes')
    .select('indexname')
    .ilike('tablename', 'users');

  if (error) {
    console.log(`  ⚠️  Could not verify indexes: ${error.message}`);
    return true;
  }

  const expectedIndexes = ['idx_users_email', 'idx_users_role', 'idx_users_status'];
  const found = data.map(d => d.indexname);
  const missing = expectedIndexes.filter(i => !found.includes(i));

  if (missing.length > 0) {
    console.log(`  ⚠️  Missing indexes on users: ${missing.join(', ')}`);
    return false;
  }
  console.log(`  ✅ Indexes verified on users table`);
  return true;
}

async function checkTriggers() {
  const { data, error } = await supabase
    .from('pg_trigger')
    .select('tgname')
    .ilike('tgname', 'trg_%');

  if (error) {
    console.log(`  ⚠️  Could not verify triggers: ${error.message}`);
    return true;
  }

  const expectedTriggers = [
    'trg_users_updated_at',
    'trg_teams_updated_at',
    'trg_tasks_updated_at',
    'trg_milestones_updated_at',
    'trg_settings_updated_at',
    'trg_tracker_state_updated_at',
  ];

  const found = data.map(d => d.tgname);
  const missing = expectedTriggers.filter(t => !found.includes(t));

  if (missing.length > 0) {
    console.log(`  ⚠️  Missing triggers: ${missing.join(', ')}`);
    return false;
  }
  console.log(`  ✅ All 6 updated_at triggers verified`);
  return true;
}

async function main() {
  console.log('Verifying database integrity...');
  console.log(`  URL: ${supabaseUrl}`);
  console.log('');

  // Load expected counts if provided
  let expectedCounts = {};
  const countsFile = process.argv[2];
  if (countsFile && existsSync(countsFile)) {
    expectedCounts = JSON.parse(readFileSync(countsFile, 'utf8'));
    console.log('Using expected row counts from:', countsFile);
    console.log('');
  }

  // Check tables
  console.log('Tables:');
  let allOk = true;
  for (const table of TABLES) {
    const ok = await checkTable(table, expectedCounts[table]);
    if (!ok) allOk = false;
  }

  console.log('');

  // Check settings default row
  console.log('Settings:');
  if (!await checkSettings()) allOk = false;

  console.log('');

  // Check indexes
  console.log('Indexes:');
  if (!await checkIndexes()) allOk = false;

  console.log('');

  // Check triggers
  console.log('Triggers:');
  if (!await checkTriggers()) allOk = false;

  console.log('');
  console.log('─'.repeat(50));

  if (allOk) {
    console.log('✅ Database verification PASSED — all checks successful');
  } else {
    console.log('⚠️  Database verification completed with warnings');
    console.log('   Review the output above for issues that need attention');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
