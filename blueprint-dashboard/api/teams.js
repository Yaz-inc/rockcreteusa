/**
 * Teams API — Team management, positions, and task assignment
 * ============================================================================
 * Allows admins and project managers to create teams, add members with
 * custom positions/roles, and assign tasks to team members.
 *
 * Database: Supabase
 * Auth: Requires valid session cookie
 *
 * Access control:
 *   - super_admin, admin: Full CRUD on teams, members, tasks
 *   - pm, webdev: Can view teams, create tasks, assign to self
 *   - client_admin: Can view teams, manage their own team members
 *   - client: Read-only access
 * ============================================================================
 */

import {
  setJson, parseBody, generateId, stripSensitive,
  getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam,
  addTeamMember, updateTeamMember, removeTeamMember,
  getAllTasks, getTaskById, createTask, updateTask, deleteTask,
  getTasksByAssignee, getTasksByTeam,
  getUserById, upsertUser,
  requireAuth, requireSuperAdmin, getDefaultModuleAccess,
  VALID_ROLES,
} from './db.js';

import { randomBytes } from 'crypto';

function canManageTeams(role) {
  return ['super_admin', 'admin', 'client_admin'].includes(role);
}

function canEditTasks(role) {
  return ['super_admin', 'admin', 'pm', 'webdev', 'team'].includes(role);
}

/* ── Password hashing for invitations ───────────────────────────────────── */

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hash = Buffer.from(bits).toString('hex');
  return `pbkdf2:100000:${salt}:${hash}`;
}

/* ── Handler ────────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  try {
    const { user } = await requireAuth(req);
    if (!user) {
      return setJson(res, 401, { error: 'Not authenticated' });
    }

    const action = req.query?.action || '';
    const userRole = user.role;

    /* ══════════════════════════════════════════════════════════════════════
       TEAMS
       ══════════════════════════════════════════════════════════════════════ */

    /* ── GET: List all teams / Get single team ─────────────────────────── */
    if (req.method === 'GET' && action === 'list') {
      const teams = await getAllTeams();
      return setJson(res, 200, { teams, total: teams.length });
    }

    if (req.method === 'GET' && action === 'get') {
      const teamId = req.query?.teamId;
      if (!teamId) return setJson(res, 400, { error: 'teamId is required' });
      const team = await getTeamById(teamId);
      if (!team) return setJson(res, 404, { error: 'Team not found' });
      return setJson(res, 200, { team });
    }

    /* ── POST: Create team ─────────────────────────────────────────────── */
    if (req.method === 'POST' && action === 'create') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to create teams' });
      }

      const body = parseBody(req);
      const name = String(body.name || '').trim();
      const description = String(body.description || '').trim();

      if (!name) {
        return setJson(res, 400, { error: 'Team name is required' });
      }

      const team = await createTeam({
        name,
        description,
        createdBy: user.id,
      });

      // Auto-add creator as team lead
      await addTeamMember(team.id, user.id, 'Team Lead');

      return setJson(res, 201, { ok: true, team });
    }

    /* ── PUT: Update team ──────────────────────────────────────────────── */
    if (req.method === 'PUT' && action === 'update') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to update teams' });
      }

      const body = parseBody(req);
      const teamId = body.teamId;

      if (!teamId) return setJson(res, 400, { error: 'teamId is required' });

      const existing = await getTeamById(teamId);
      if (!existing) return setJson(res, 404, { error: 'Team not found' });

      const updates = {};
      if (body.name) updates.name = String(body.name).trim();
      if (body.description !== undefined) updates.description = String(body.description).trim();

      await updateTeam(teamId, updates);
      const team = await getTeamById(teamId);
      return setJson(res, 200, { ok: true, team });
    }

    /* ── DELETE: Delete team ───────────────────────────────────────────── */
    if (req.method === 'DELETE' && action === 'delete') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to delete teams' });
      }

      const body = parseBody(req);
      const teamId = body.teamId;

      if (!teamId) return setJson(res, 400, { error: 'teamId is required' });

      await deleteTeam(teamId);
      return setJson(res, 200, { ok: true, message: 'Team deleted' });
    }

    /* ══════════════════════════════════════════════════════════════════════
       TEAM MEMBERS
       ══════════════════════════════════════════════════════════════════════ */

    /* ── POST: Add member to team ──────────────────────────────────────── */
    if (req.method === 'POST' && action === 'add-member') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to add team members' });
      }

      const body = parseBody(req);
      const teamId = body.teamId;
      const userId = body.userId;
      const position = String(body.position || '').trim();

      if (!teamId || !userId) {
        return setJson(res, 400, { error: 'teamId and userId are required' });
      }

      const team = await getTeamById(teamId);
      if (!team) return setJson(res, 404, { error: 'Team not found' });

      const targetUser = await getUserById(userId);
      if (!targetUser) return setJson(res, 404, { error: 'User not found' });

      const member = await addTeamMember(teamId, userId, position);
      const updatedTeam = await getTeamById(teamId);
      return setJson(res, 201, { ok: true, member, team: updatedTeam });
    }

    /* ── POST: Invite new user and add to team ─────────────────────────── */
    if (req.method === 'POST' && action === 'invite-member') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to invite team members' });
      }

      const body = parseBody(req);
      const teamId = body.teamId;
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim();
      const role = String(body.role || 'team').toLowerCase();
      const position = String(body.position || '').trim();
      const title = String(body.title || position || '').trim();

      if (!teamId || !email || !name) {
        return setJson(res, 400, { error: 'teamId, email, and name are required' });
      }

      const team = await getTeamById(teamId);
      if (!team) return setJson(res, 404, { error: 'Team not found' });

      // Check if user already exists
      const { getUserByEmail } = await import('./db.js');
      let targetUser = await getUserByEmail(email);

      if (!targetUser) {
        // Create new user with temp password
        const tempPassword = randomBytes(6).toString('base64url').slice(0, 12);
        const passwordHash = await hashPassword(tempPassword);

        targetUser = await upsertUser({
          id: generateId('usr'),
          email,
          passwordHash,
          name,
          displayName: name.split(' ')[0] || name,
          role,
          phone: '',
          title,
          organization: '',
          preferences: { language: 'en', theme: 'auto' },
          moduleAccess: getDefaultModuleAccess(role),
          lastLoginAt: null,
          createdBy: user.id,
          status: 'invited',
          invitedBy: user.id,
          tempPassword: true,
        });

        // Send invitation email
        const { getSettings } = await import('./db.js');
        const settings = await getSettings();
        const emailConfig = settings?.email || {};
        const apiKey = emailConfig.resendApiKey || process.env.RESEND_API_KEY || '';
        const fromEmail = emailConfig.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@newmindsgroup.com';
        const fromName = emailConfig.fromName || process.env.RESEND_FROM_NAME || 'Rockcrete USA Blueprint';

        if (apiKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
              to: [email],
              subject: `You're Invited to Team "${team.name}" — Rockcrete USA Blueprint`,
              html: `
                <div style="font-family:'Inter',system-ui,sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#fafaf7;border-radius:12px;">
                  <h2 style="color:#1e3a5f;margin:0 0 1rem;">Team Invitation</h2>
                  <p style="color:#3a3f44;font-size:0.95rem;">Hello ${name},</p>
                  <p style="color:#3a3f44;font-size:0.95rem;"><strong>${user.displayName || user.name}</strong> has invited you to join the team <strong>"${team.name}"</strong> as <strong>${position || role.replace('_', ' ')}</strong> on the Rockcrete USA Blueprint Portal.</p>
                  <div style="background:#1e3a5f;color:#fff;padding:1.25rem;border-radius:8px;margin:1.5rem 0;">
                    <p style="margin:0 0 0.5rem;font-size:0.85rem;opacity:0.8;">Your temporary credentials:</p>
                    <p style="margin:0;font-size:0.95rem;"><strong>Email:</strong> ${email}</p>
                    <p style="margin:0;font-size:0.95rem;"><strong>Password:</strong> ${tempPassword}</p>
                  </div>
                  <p style="color:#6b7177;font-size:0.85rem;">Please log in and change your password immediately.</p>
                  <a href="${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://blueprint-dashboard-chi.vercel.app'}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:600;margin-top:0.5rem;">Open Portal</a>
                </div>
              `,
            }),
          });
        }

        // Return temp password if no email was sent
        var inviteResult = {
          tempPassword: apiKey ? '(sent via email)' : tempPassword,
          emailSent: !!apiKey,
        };
      }

      // Add user to team
      const member = await addTeamMember(teamId, targetUser.id, position);
      const updatedTeam = await getTeamById(teamId);

      return setJson(res, 201, {
        ok: true,
        member,
        team: updatedTeam,
        user: stripSensitive(targetUser),
        ...(inviteResult || {}),
        message: targetUser.status === 'invited'
          ? (inviteResult?.emailSent ? 'Invitation sent via email' : 'User created. Share the temporary password manually.')
          : 'Existing user added to team',
      });
    }

    /* ── PUT: Update team member position ──────────────────────────────── */
    if (req.method === 'PUT' && action === 'update-member') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to update team members' });
      }

      const body = parseBody(req);
      const memberId = body.memberId;
      const position = String(body.position || '').trim();

      if (!memberId) return setJson(res, 400, { error: 'memberId is required' });

      await updateTeamMember(memberId, { position });
      return setJson(res, 200, { ok: true, message: 'Member position updated' });
    }

    /* ── POST: Remove member from team ─────────────────────────────────── */
    if (req.method === 'POST' && action === 'remove-member') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to remove team members' });
      }

      const body = parseBody(req);
      const memberId = body.memberId;

      if (!memberId) return setJson(res, 400, { error: 'memberId is required' });

      await removeTeamMember(memberId);
      return setJson(res, 200, { ok: true, message: 'Member removed from team' });
    }

    /* ══════════════════════════════════════════════════════════════════════
       TASKS (Team Management)
       ══════════════════════════════════════════════════════════════════════ */

    /* ── GET: List tasks ───────────────────────────────────────────────── */
    if (req.method === 'GET' && action === 'tasks') {
      const teamId = req.query?.teamId;
      const assigneeId = req.query?.assigneeId;

      let tasks;
      if (teamId) {
        tasks = await getTasksByTeam(teamId);
      } else if (assigneeId) {
        tasks = await getTasksByAssignee(assigneeId);
      } else {
        tasks = await getAllTasks();
      }

      return setJson(res, 200, { tasks, total: tasks.length });
    }

    /* ── POST: Create task ─────────────────────────────────────────────── */
    if (req.method === 'POST' && action === 'create-task') {
      if (!canEditTasks(userRole) && !canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Staff access required to create tasks' });
      }

      const body = parseBody(req);
      const title = String(body.title || '').trim();
      const description = String(body.description || '').trim();
      const assigneeId = body.assigneeId || null;
      const teamId = body.teamId || null;
      const dueDate = body.dueDate || null;
      const priority = String(body.priority || 'medium').toLowerCase();
      const phase = String(body.phase || '').trim();

      if (!title) {
        return setJson(res, 400, { error: 'Task title is required' });
      }

      const task = await createTask({
        title,
        description,
        status: 'not_started',
        priority,
        assigneeId,
        teamId,
        dueDate,
        phase,
        createdBy: user.id,
      });

      return setJson(res, 201, { ok: true, task });
    }

    /* ── PUT: Update task ──────────────────────────────────────────────── */
    if (req.method === 'PUT' && action === 'update-task') {
      if (!canEditTasks(userRole) && !canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Staff access required to update tasks' });
      }

      const body = parseBody(req);
      const taskId = body.taskId;

      if (!taskId) return setJson(res, 400, { error: 'taskId is required' });

      const existing = await getTaskById(taskId);
      if (!existing) return setJson(res, 404, { error: 'Task not found' });

      const updates = {};
      if (body.title !== undefined) updates.title = String(body.title).trim();
      if (body.description !== undefined) updates.description = String(body.description).trim();
      if (body.status !== undefined) updates.status = String(body.status);
      if (body.priority !== undefined) updates.priority = String(body.priority);
      if (body.assigneeId !== undefined) updates.assigneeId = body.assigneeId;
      if (body.teamId !== undefined) updates.teamId = body.teamId;
      if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
      if (body.phase !== undefined) updates.phase = String(body.phase);

      const task = await updateTask(taskId, updates);
      return setJson(res, 200, { ok: true, task });
    }

    /* ── POST: Assign task to user ─────────────────────────────────────── */
    if (req.method === 'POST' && action === 'assign-task') {
      if (!canManageTeams(userRole) && !canEditTasks(userRole)) {
        return setJson(res, 403, { error: 'Staff access required to assign tasks' });
      }

      const body = parseBody(req);
      const taskId = body.taskId;
      const assigneeId = body.assigneeId || null;

      if (!taskId) return setJson(res, 400, { error: 'taskId is required' });

      const existing = await getTaskById(taskId);
      if (!existing) return setJson(res, 404, { error: 'Task not found' });

      const task = await updateTask(taskId, { assigneeId });
      return setJson(res, 200, { ok: true, task });
    }

    /* ── DELETE: Delete task ───────────────────────────────────────────── */
    if (req.method === 'DELETE' && action === 'delete-task') {
      if (!canManageTeams(userRole)) {
        return setJson(res, 403, { error: 'Admin access required to delete tasks' });
      }

      const body = parseBody(req);
      const taskId = body.taskId;

      if (!taskId) return setJson(res, 400, { error: 'taskId is required' });

      await deleteTask(taskId);
      return setJson(res, 200, { ok: true, message: 'Task deleted' });
    }

    /* ── Method / action not found ────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return setJson(res, 400, {
      error: 'Invalid or missing action parameter',
      validActions: [
        'list', 'get', 'create', 'update', 'delete',
        'add-member', 'invite-member', 'update-member', 'remove-member',
        'tasks', 'create-task', 'update-task', 'assign-task', 'delete-task',
      ],
    });

  } catch (error) {
    console.error('Teams API error:', error);
    return setJson(res, 500, { error: 'Teams operation failed', message: error.message });
  }
}
