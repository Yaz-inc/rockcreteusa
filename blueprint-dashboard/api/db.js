/**
 * Database Client — Supabase-powered data layer
 * ============================================================================
 * Replaces blob-helpers.js with proper PostgreSQL via Supabase.
 * All reads/writes go through the Supabase client using the service_role key.
 *
 * Required environment variables:
 *   SUPABASE_URL       — Project URL (https://xxx.supabase.co)
 *   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS)
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

/* ── Singleton Supabase client ─────────────────────────────────────────── */

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  }
  _supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabase;
}

/* ── Generic helpers ────────────────────────────────────────────────────── */

function setJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch { return {}; }
  }
  return {};
}

function generateId(prefix) {
  const { randomBytes } = require('crypto');
  return prefix + '-' + randomBytes(4).toString('hex') + Date.now().toString(36).slice(-4);
}

function stripSensitive(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

// Convert camelCase user object (from API/frontend) to snake_case for DB
function userToRow(u) {
  return {
    id: u.id,
    email: u.email,
    password_hash: u.passwordHash || u.password_hash,
    name: u.name,
    display_name: u.displayName || u.display_name || '',
    role: u.role,
    avatar: u.avatar || null,
    phone: u.phone || '',
    title: u.title || '',
    organization: u.organization || '',
    preferences: u.preferences || { language: 'en', theme: 'auto' },
    module_access: u.moduleAccess || u.module_access || {},
    last_login_at: u.lastLoginAt || u.last_login_at || null,
    created_at: u.createdAt || u.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: u.createdBy || u.created_by || 'system',
    status: u.status || 'active',
    invited_by: u.invitedBy || u.invited_by || null,
    temp_password: u.tempPassword || u.temp_password || false,
  };
}

// Convert DB row (snake_case) to camelCase for API
function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    displayName: row.display_name,
    role: row.role,
    avatar: row.avatar,
    phone: row.phone,
    title: row.title,
    organization: row.organization,
    preferences: row.preferences,
    moduleAccess: row.module_access,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    status: row.status,
    invitedBy: row.invited_by,
    tempPassword: row.temp_password,
    assignedTasks: row.assigned_tasks || [],
  };
}

/* ── Session cookie helpers ─────────────────────────────────────────────── */

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'rockcrete-default-secret-change-me-in-production';
}

function signSession(payload) {
  const { createHmac } = require('crypto');
  const secret = getSessionSecret();
  const data = JSON.stringify(payload);
  const sig = createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ ...payload, _sig: sig })).toString('base64url');
}

function verifySession(cookie) {
  try {
    const { createHmac } = require('crypto');
    const decoded = JSON.parse(Buffer.from(cookie, 'base64url').toString('utf8'));
    const { _sig, ...payload } = decoded;
    const secret = getSessionSecret();
    const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (_sig.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < _sig.length; i++) {
      mismatch |= _sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSessionFromRequest(req) {
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(/rockcrete_session=([^;]+)/);
  if (!match) return null;
  return verifySession(match[1]);
}

function setSessionCookie(res, userId, role) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signSession({ userId, role, expiresAt });
  res.setHeader('Set-Cookie', [
    `rockcrete_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=604800',
    process.env.VERCEL_URL ? 'Secure' : '',
  ].filter(Boolean).join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', [
    'rockcrete_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
  ].join('; '));
}

/* ── User database operations ───────────────────────────────────────────── */

async function getAllUsers() {
  const sb = getSupabase();
  const { data, error } = await sb.from('users').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToUser);
}

async function getUserById(id) {
  const sb = getSupabase();
  const { data, error } = await sb.from('users').select('*').eq('id', id).single();
  if (error || !data) return null;
  return rowToUser(data);
}

async function getUserByEmail(email) {
  const sb = getSupabase();
  const { data, error } = await sb.from('users').select('*').ilike('email', email).single();
  if (error || !data) return null;
  return rowToUser(data);
}

async function upsertUser(userData) {
  const sb = getSupabase();
  const row = userToRow(userData);
  const { data, error } = await sb.from('users').upsert(row, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return rowToUser(data);
}

async function updateUser(id, updates) {
  const sb = getSupabase();
  // Convert camelCase updates to snake_case
  const row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.displayName !== undefined) row.display_name = updates.displayName;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.passwordHash !== undefined) row.password_hash = updates.passwordHash;
  if (updates.role !== undefined) row.role = updates.role;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.organization !== undefined) row.organization = updates.organization;
  if (updates.preferences !== undefined) row.preferences = updates.preferences;
  if (updates.moduleAccess !== undefined) row.module_access = updates.moduleAccess;
  if (updates.lastLoginAt !== undefined) row.last_login_at = updates.lastLoginAt;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.invitedBy !== undefined) row.invited_by = updates.invitedBy;
  if (updates.tempPassword !== undefined) row.temp_password = updates.tempPassword;
  if (updates.avatar !== undefined) row.avatar = updates.avatar;
  row.updated_at = new Date().toISOString();

  const { data, error } = await sb.from('users').update(row).eq('id', id).select().single();
  if (error) throw error;
  return rowToUser(data);
}

async function deleteUser(id) {
  const sb = getSupabase();
  const { error } = await sb.from('users').delete().eq('id', id);
  if (error) throw error;
}

async function getUserCount() {
  const sb = getSupabase();
  const { count, error } = await sb.from('users').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

/* ── Settings operations ────────────────────────────────────────────────── */

const DEFAULT_SETTINGS = {
  email: {
    fromName: 'Rockcrete USA Blueprint',
    fromEmail: 'noreply@newmindsgroup.com',
    replyTo: 'app@newmindsgroup.com',
    resendApiKey: '',
  },
  system: {
    sessionDurationDays: 7,
    resetCodeExpiryMinutes: 15,
    maxLoginAttempts: 5,
    maxResetAttempts: 5,
    loginLockoutMinutes: 15,
  },
  branding: {
    portalName: 'Rockcrete USA Blueprint',
    companyName: 'Rockcrete USA',
    managementCompany: 'New Minds Group',
  }
};

async function getSettings() {
  const sb = getSupabase();
  const { data, error } = await sb.from('settings').select('*').eq('id', 1).single();
  if (error || !data) return { ...DEFAULT_SETTINGS };
  return {
    email: { ...DEFAULT_SETTINGS.email, ...(data.email_config || {}) },
    system: { ...DEFAULT_SETTINGS.system, ...(data.system_config || {}) },
    branding: { ...DEFAULT_SETTINGS.branding, ...(data.branding_config || {}) },
  };
}

async function saveSettings(settings) {
  const sb = getSupabase();
  const row = {
    id: 1,
    email_config: settings.email || {},
    system_config: settings.system || {},
    branding_config: settings.branding || {},
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb.from('settings').upsert(row, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data;
}

/* ── Milestones operations ──────────────────────────────────────────────── */

async function getAllMilestones() {
  const sb = getSupabase();
  const { data, error } = await sb.from('milestones').select('*').order('order_num', { ascending: true });
  if (error) throw error;
  // Group by task_id to match the old blob shape
  const grouped = {};
  for (const row of (data || [])) {
    if (!grouped[row.task_id]) {
      grouped[row.task_id] = {
        taskId: row.task_id,
        milestones: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
    grouped[row.task_id].milestones.push({
      id: row.id,
      title: row.title,
      order: row.order_num,
      status: row.status,
      completedAt: row.completed_at,
      completedBy: row.completed_by,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
  return grouped;
}

async function getMilestonesByTask(taskId) {
  const sb = getSupabase();
  const { data, error } = await sb.from('milestones').select('*').eq('task_id', taskId).order('order_num', { ascending: true });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    order: row.order_num,
    status: row.status,
    completedAt: row.completed_at,
    completedBy: row.completed_by,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

async function createMilestone(ms) {
  const sb = getSupabase();
  const row = {
    id: ms.id || generateId('ms'),
    task_id: ms.taskId,
    title: ms.title,
    order_num: ms.order || 0,
    status: ms.status || 'not-started',
    completed_at: ms.completedAt || null,
    completed_by: ms.completedBy || null,
    notes: ms.notes || '',
  };
  const { data, error } = await sb.from('milestones').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function updateMilestone(id, updates) {
  const sb = getSupabase();
  const row = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.order !== undefined) row.order_num = updates.order;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.completedAt !== undefined) row.completed_at = updates.completedAt;
  if (updates.completedBy !== undefined) row.completed_by = updates.completedBy;
  if (updates.notes !== undefined) row.notes = updates.notes;

  const { data, error } = await sb.from('milestones').update(row).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deleteMilestone(id) {
  const sb = getSupabase();
  const { error } = await sb.from('milestones').delete().eq('id', id);
  if (error) throw error;
}

/* ── Progress updates operations ────────────────────────────────────────── */

async function getProgressUpdates(taskId) {
  const sb = getSupabase();
  let query = sb.from('progress_updates').select('*').order('created_at', { ascending: false }).limit(500);
  if (taskId) query = query.eq('task_id', taskId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    taskId: row.task_id,
    milestoneId: row.milestone_id,
    submittedBy: row.submitted_by,
    role: row.role,
    type: row.type,
    message: row.message,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    createdAt: row.created_at,
  }));
}

async function createProgressUpdate(update) {
  const sb = getSupabase();
  const row = {
    id: update.id || generateId('upd'),
    task_id: update.taskId,
    milestone_id: update.milestoneId || null,
    submitted_by: update.submittedBy || '',
    role: update.role || 'webdev',
    type: update.type || 'note',
    message: update.message || '',
    previous_status: update.previousStatus || null,
    new_status: update.newStatus || null,
  };
  const { data, error } = await sb.from('progress_updates').insert(row).select().single();
  if (error) throw error;
  return {
    id: data.id,
    taskId: data.task_id,
    milestoneId: data.milestone_id,
    submittedBy: data.submitted_by,
    role: data.role,
    type: data.type,
    message: data.message,
    previousStatus: data.previous_status,
    newStatus: data.new_status,
    createdAt: data.created_at,
  };
}

/* ── Tracker state operations ───────────────────────────────────────────── */

async function getTrackerState() {
  const sb = getSupabase();
  const { data, error } = await sb.from('tracker_state').select('*');
  if (error) throw error;
  // Convert rows to the old { tasks: {}, accessRequests: {} } shape
  const state = { tasks: {}, accessRequests: {} };
  for (const row of (data || [])) {
    const sd = row.state_data || {};
    if (sd._type === 'accessRequest') {
      state.accessRequests[row.task_id] = sd;
    } else {
      state.tasks[row.task_id] = sd;
    }
  }
  return state;
}

async function saveTrackerState(state) {
  const sb = getSupabase();
  // Upsert each task/accessRequest as a row
  const rows = [];
  for (const [taskId, taskData] of Object.entries(state.tasks || {})) {
    rows.push({
      task_id: taskId,
      state_data: { ...taskData, _type: 'task' },
      updated_at: new Date().toISOString(),
    });
  }
  for (const [taskId, arData] of Object.entries(state.accessRequests || {})) {
    rows.push({
      task_id: taskId,
      state_data: { ...arData, _type: 'accessRequest' },
      updated_at: new Date().toISOString(),
    });
  }

  if (rows.length === 0) return;

  // Delete existing and re-insert (simplest upsert strategy for complex JSONB)
  const { error: delError } = await sb.from('tracker_state').delete().neq('task_id', '__never__');
  if (delError) throw delError;

  const { error: insError } = await sb.from('tracker_state').insert(rows);
  if (insError) throw insError;
}

async function patchTrackerTasks(taskPatches) {
  const sb = getSupabase();
  for (const patch of taskPatches) {
    if (!patch.id) continue;
    // Get existing
    const { data: existing } = await sb.from('tracker_state').select('state_data').eq('task_id', patch.id).single();
    const current = (existing?.state_data && existing.state_data._type === 'task') ? existing.state_data : {};
    const merged = { ...current, ...patch };
    delete merged._type; // Don't expose internal type
    const row = { task_id: patch.id, state_data: { ...merged, _type: 'task' }, updated_at: new Date().toISOString() };
    const { error } = await sb.from('tracker_state').upsert(row, { onConflict: 'task_id' });
    if (error) console.error('Tracker patch error for', patch.id, error.message);
  }
}

async function patchTrackerAccessRequests(arPatches) {
  const sb = getSupabase();
  for (const patch of arPatches) {
    if (!patch.id) continue;
    const { data: existing } = await sb.from('tracker_state').select('state_data').eq('task_id', patch.id).single();
    const current = (existing?.state_data && existing.state_data._type === 'accessRequest') ? existing.state_data : {};
    const merged = { ...current, ...patch };
    delete merged._type;
    const row = { task_id: patch.id, state_data: { ...merged, _type: 'accessRequest' }, updated_at: new Date().toISOString() };
    const { error } = await sb.from('tracker_state').upsert(row, { onConflict: 'task_id' });
    if (error) console.error('Tracker AR patch error for', patch.id, error.message);
  }
}

/* ── Reset tokens operations ────────────────────────────────────────────── */

async function getResetTokens(email) {
  const sb = getSupabase();
  let query = sb.from('reset_tokens').select('*').order('created_at', { ascending: false });
  if (email) query = query.ilike('email', email);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    email: row.email,
    code: row.code,
    expiresAt: row.expires_at,
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    used: row.used,
    createdAt: row.created_at,
  }));
}

async function createResetToken(token) {
  const sb = getSupabase();
  const row = {
    id: token.id || generateId('rst'),
    user_id: token.userId,
    email: token.email,
    code: token.code,
    expires_at: token.expiresAt,
    attempts: 0,
    max_attempts: token.maxAttempts || 5,
    used: false,
  };
  const { data, error } = await sb.from('reset_tokens').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function invalidateResetTokens(email) {
  const sb = getSupabase();
  const { error } = await sb.from('reset_tokens').update({ used: true }).ilike('email', email).eq('used', false);
  if (error) throw error;
}

async function updateResetToken(id, updates) {
  const sb = getSupabase();
  const row = {};
  if (updates.attempts !== undefined) row.attempts = updates.attempts;
  if (updates.used !== undefined) row.used = updates.used;
  const { error } = await sb.from('reset_tokens').update(row).eq('id', id);
  if (error) throw error;
}

async function cleanupOldResetTokens() {
  const sb = getSupabase();
  // Mark expired tokens as used
  const { error } = await sb.from('reset_tokens')
    .update({ used: true })
    .lt('expires_at', new Date().toISOString())
    .eq('used', false);
  if (error) console.error('Reset token cleanup error:', error.message);
}

/* ── Teams operations ───────────────────────────────────────────────────── */

async function getAllTeams() {
  const sb = getSupabase();
  const { data, error } = await sb.from('teams').select(`
    *,
    team_members (
      id, user_id, position, joined_at,
      users ( id, name, display_name, email, role, avatar, status )
    )
  `).order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(team => ({
    id: team.id,
    name: team.name,
    description: team.description,
    createdBy: team.created_by,
    createdAt: team.created_at,
    updatedAt: team.updated_at,
    members: (team.team_members || []).map(tm => ({
      id: tm.id,
      userId: tm.user_id,
      position: tm.position,
      joinedAt: tm.joined_at,
      user: tm.users ? stripSensitive(rowToUser(tm.users)) : null,
    })),
  }));
}

async function getTeamById(id) {
  const sb = getSupabase();
  const { data, error } = await sb.from('teams').select(`
    *,
    team_members (
      id, user_id, position, joined_at,
      users ( id, name, display_name, email, role, avatar, status )
    )
  `).eq('id', id).single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    members: (data.team_members || []).map(tm => ({
      id: tm.id,
      userId: tm.user_id,
      position: tm.position,
      joinedAt: tm.joined_at,
      user: tm.users ? stripSensitive(rowToUser(tm.users)) : null,
    })),
  };
}

async function createTeam(teamData) {
  const sb = getSupabase();
  const row = {
    id: teamData.id || generateId('team'),
    name: teamData.name,
    description: teamData.description || '',
    created_by: teamData.createdBy || teamData.created_by,
  };
  const { data, error } = await sb.from('teams').insert(row).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, description: data.description, createdBy: data.created_by, createdAt: data.created_at, updatedAt: data.updated_at, members: [] };
}

async function updateTeam(id, updates) {
  const sb = getSupabase();
  const row = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.description !== undefined) row.description = updates.description;
  const { data, error } = await sb.from('teams').update(row).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deleteTeam(id) {
  const sb = getSupabase();
  const { error } = await sb.from('teams').delete().eq('id', id);
  if (error) throw error;
}

async function addTeamMember(teamId, userId, position) {
  const sb = getSupabase();
  const row = {
    id: generateId('tm'),
    team_id: teamId,
    user_id: userId,
    position: position || '',
  };
  const { data, error } = await sb.from('team_members').insert(row).select().single();
  if (error) throw error;
  return { id: data.id, teamId: data.team_id, userId: data.user_id, position: data.position, joinedAt: data.joined_at };
}

async function updateTeamMember(id, updates) {
  const sb = getSupabase();
  const row = {};
  if (updates.position !== undefined) row.position = updates.position;
  const { error } = await sb.from('team_members').update(row).eq('id', id);
  if (error) throw error;
}

async function removeTeamMember(id) {
  const sb = getSupabase();
  const { error } = await sb.from('team_members').delete().eq('id', id);
  if (error) throw error;
}

async function removeTeamMemberByUserAndTeam(teamId, userId) {
  const sb = getSupabase();
  const { error } = await sb.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId);
  if (error) throw error;
}

/* ── Tasks operations (Team Management) ─────────────────────────────────── */

async function getAllTasks() {
  const sb = getSupabase();
  const { data, error } = await sb.from('tasks').select(`
    *,
    assignee:users ( id, name, display_name, email, role, avatar )
  `).order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee_id,
    teamId: task.team_id,
    dueDate: task.due_date,
    phase: task.phase,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    createdBy: task.created_by,
    assignee: task.assignee ? stripSensitive(rowToUser(task.assignee)) : null,
  }));
}

async function getTaskById(id) {
  const sb = getSupabase();
  const { data, error } = await sb.from('tasks').select(`
    *,
    assignee:users ( id, name, display_name, email, role, avatar )
  `).eq('id', id).single();
  if (error || !data) return null;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assigneeId: data.assignee_id,
    teamId: data.team_id,
    dueDate: data.due_date,
    phase: data.phase,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    assignee: data.assignee ? stripSensitive(rowToUser(data.assignee)) : null,
  };
}

async function createTask(taskData) {
  const sb = getSupabase();
  const row = {
    id: taskData.id || generateId('task'),
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'not_started',
    priority: taskData.priority || 'medium',
    assignee_id: taskData.assigneeId || null,
    team_id: taskData.teamId || null,
    due_date: taskData.dueDate || null,
    phase: taskData.phase || '',
    created_by: taskData.createdBy || taskData.created_by,
  };
  const { data, error } = await sb.from('tasks').insert(row).select().single();
  if (error) throw error;
  return getTaskById(data.id);
}

async function updateTask(id, updates) {
  const sb = getSupabase();
  const row = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.priority !== undefined) row.priority = updates.priority;
  if (updates.assigneeId !== undefined) row.assignee_id = updates.assigneeId;
  if (updates.teamId !== undefined) row.team_id = updates.teamId;
  if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
  if (updates.phase !== undefined) row.phase = updates.phase;
  const { data, error } = await sb.from('tasks').update(row).eq('id', id).select().single();
  if (error) throw error;
  return getTaskById(data.id);
}

async function deleteTask(id) {
  const sb = getSupabase();
  const { error } = await sb.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

async function getTasksByAssignee(userId) {
  const sb = getSupabase();
  const { data, error } = await sb.from('tasks').select('*').eq('assignee_id', userId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee_id,
    teamId: task.team_id,
    dueDate: task.due_date,
    phase: task.phase,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    createdBy: task.created_by,
  }));
}

async function getTasksByTeam(teamId) {
  const sb = getSupabase();
  const { data, error } = await sb.from('tasks').select(`
    *,
    assignee:users ( id, name, display_name, email, role, avatar )
  `).eq('team_id', teamId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee_id,
    teamId: task.team_id,
    dueDate: task.due_date,
    phase: task.phase,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    createdBy: task.created_by,
    assignee: task.assignee ? stripSensitive(rowToUser(task.assignee)) : null,
  }));
}

/* ── Module access defaults by role ─────────────────────────────────────── */

const MODULE_REGISTRY = [
  { id: 'home',         name: 'Home Dashboard',      category: 'Navigation' },
  { id: 'schedule',     name: 'Schedule',             category: 'Navigation' },
  { id: 'tracker',      name: 'Project Tracker',      category: 'Project' },
  { id: 'progress',     name: 'Team Progress',        category: 'Project' },
  { id: 'scope',        name: 'Scope',                category: 'Project' },
  { id: 'risks',        name: 'Risks & Open Items',   category: 'Project' },
  { id: 'phase-1',      name: 'Phase 1: Discovery',   category: 'Phases' },
  { id: 'phase-2',      name: 'Phase 2: Design',      category: 'Phases' },
  { id: 'phase-3',      name: 'Phase 3: Build',       category: 'Phases' },
  { id: 'phase-4',      name: 'Phase 4: Post-Launch', category: 'Phases' },
  { id: 'integrations', name: 'Integrations',         category: 'Technical' },
  { id: 'migration',    name: 'Data Migration',       category: 'Technical' },
  { id: 'performance',  name: 'Performance Targets',  category: 'Technical' },
  { id: 'deliverables', name: 'Deliverables',         category: 'Project' },
  { id: 'team',         name: 'Team & Contacts',      category: 'Navigation' },
  { id: 'documents',    name: 'Documents',            category: 'Project' },
  { id: 'panel',        name: 'Operations Panel',     category: 'Admin' },
  { id: 'pricing',      name: 'Pricing & Invoicing',  category: 'Admin' },
  { id: 'profile',      name: 'My Profile',           category: 'Personal' },
  { id: 'users',        name: 'User Management',      category: 'Admin' },
  { id: 'settings',     name: 'System Settings',      category: 'Admin' },
];

const VALID_ROLES = ['super_admin', 'admin', 'pm', 'webdev', 'devops', 'seo', 'ui_ux', 'team', 'client_admin', 'client'];
const ACCESS_LEVELS = ['none', 'read', 'write', 'admin'];

function getDefaultModuleAccess(role) {
  const allModules = MODULE_REGISTRY.map(m => m.id);
  const noAdmin = ['users', 'settings'];
  const noStaff = ['users', 'settings', 'pricing', 'panel'];
  const noClient = ['users', 'settings', 'pricing', 'panel', 'risks'];
  const noClientRead = ['users', 'settings', 'pricing', 'panel', 'risks', 'tracker', 'progress'];

  const defaults = {
    super_admin:   Object.fromEntries(allModules.map(m => [m, 'admin'])),
    admin:         Object.fromEntries(allModules.map(m => [m, noAdmin.includes(m) ? 'none' : 'admin'])),
    pm:            Object.fromEntries(allModules.map(m => [m, [...noAdmin, 'pricing'].includes(m) ? 'none' : 'write'])),
    webdev:        Object.fromEntries(allModules.map(m => [m, noStaff.includes(m) ? 'none' : 'write'])),
    devops:        Object.fromEntries(allModules.map(m => [m, [...noStaff, 'scope', 'risks', 'deliverables'].includes(m) ? 'none' : 'write'])),
    seo:           Object.fromEntries(allModules.map(m => [m, [...noStaff, 'migration', 'performance'].includes(m) ? 'none' : 'read'])),
    ui_ux:         Object.fromEntries(allModules.map(m => [m, [...noStaff, 'migration'].includes(m) ? 'none' : 'write'])),
    team:          Object.fromEntries(allModules.map(m => [m, noStaff.includes(m) ? 'none' : 'write'])),
    client_admin:  Object.fromEntries(allModules.map(m => [m, noClient.includes(m) ? 'none' : 'read'])),
    client:        Object.fromEntries(allModules.map(m => [m, noClientRead.includes(m) ? 'none' : 'read'])),
  };
  return defaults[role] || defaults.client;
}

/* ── Auth helpers ────────────────────────────────────────────────────────── */

async function requireAuth(req) {
  const session = getSessionFromRequest(req);
  if (!session) return { user: null, session: null };
  const user = await getUserById(session.userId);
  if (!user || user.status !== 'active') return { user: null, session: null };
  return { user, session };
}

function requireSuperAdmin(user) {
  return user && user.role === 'super_admin';
}

/* ── Export ──────────────────────────────────────────────────────────────── */

export {
  getSupabase,
  setJson, parseBody, generateId, stripSensitive,
  getSessionSecret, signSession, verifySession,
  getSessionFromRequest, setSessionCookie, clearSessionCookie,
  // User operations
  getAllUsers, getUserById, getUserByEmail, upsertUser, updateUser, deleteUser, getUserCount,
  // Settings
  getSettings, saveSettings, DEFAULT_SETTINGS,
  // Milestones
  getAllMilestones, getMilestonesByTask, createMilestone, updateMilestone, deleteMilestone,
  // Progress
  getProgressUpdates, createProgressUpdate,
  // Tracker state
  getTrackerState, saveTrackerState, patchTrackerTasks, patchTrackerAccessRequests,
  // Reset tokens
  getResetTokens, createResetToken, invalidateResetTokens, updateResetToken, cleanupOldResetTokens,
  // Teams
  getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam,
  addTeamMember, updateTeamMember, removeTeamMember, removeTeamMemberByUserAndTeam,
  // Tasks (Team Management)
  getAllTasks, getTaskById, createTask, updateTask, deleteTask, getTasksByAssignee, getTasksByTeam,
  // Constants & helpers
  MODULE_REGISTRY, VALID_ROLES, ACCESS_LEVELS, getDefaultModuleAccess,
  // Auth
  requireAuth, requireSuperAdmin,
  // Conversion helpers
  userToRow, rowToUser,
};
