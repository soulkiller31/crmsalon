import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { AdminModel } from '../models/Admin.js';
import { AppError } from '../middleware/errorHandler.js';

export const AuthService = {
  async login(email, password) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();

    let admin = null;

    try {
      admin = await AdminModel.findByEmail(normalizedEmail);
      // #region debug-point F:backend-db-result
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'login-failed',
          runId: 'pre-fix',
          hypothesisId: 'F',
          location: 'backend/src/services/authService.js:db-result',
          msg: '[DEBUG] Admin lookup completed',
          data: {
            email: normalizedEmail,
            foundAdmin: Boolean(admin),
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    } catch (error) {
      // #region debug-point G:backend-db-error
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'login-failed',
          runId: 'pre-fix',
          hypothesisId: 'G',
          location: 'backend/src/services/authService.js:db-error',
          msg: '[DEBUG] Admin lookup failed',
          data: {
            email: normalizedEmail,
            message: error.message,
            statusCode: error.statusCode,
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (error instanceof AppError && error.statusCode === 401) {
        throw error;
      }

      console.warn('[Auth] Database lookup failed, using fallback admin credentials:', error.message);
    }

    if (admin) {
      const isValid = await bcrypt.compare(normalizedPassword, admin.password_hash);
      // #region debug-point H:backend-admin-password-check
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'login-failed',
          runId: 'pre-fix',
          hypothesisId: 'H',
          location: 'backend/src/services/authService.js:admin-password-check',
          msg: '[DEBUG] Stored admin password check completed',
          data: {
            email: normalizedEmail,
            isValid,
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!isValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name },
      };
    }

    if (
      normalizedEmail === config.admin.email?.trim().toLowerCase() &&
      normalizedPassword === config.admin.password
    ) {
      // #region debug-point I:backend-fallback-admin
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'login-failed',
          runId: 'pre-fix',
          hypothesisId: 'I',
          location: 'backend/src/services/authService.js:fallback-admin',
          msg: '[DEBUG] Fallback admin login path used',
          data: {
            email: normalizedEmail,
            configuredAdminEmail: config.admin.email,
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const token = jwt.sign(
        { id: 'fallback-admin', email: config.admin.email, name: config.admin.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        token,
        admin: { id: 'fallback-admin', email: config.admin.email, name: config.admin.name },
      };
    }

    throw new AppError('Invalid email or password', 401);
  },

  async getProfile(adminId) {
    return AdminModel.findById(adminId);
  },

  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
};
