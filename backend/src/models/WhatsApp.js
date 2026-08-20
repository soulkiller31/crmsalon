import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const WhatsAppModel = {
  async getSession() {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new AppError('Failed to fetch WhatsApp session', 500);
    return data;
  },

  async updateSession(updates) {
    const existing = await this.getSession();

    if (existing) {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new AppError('Failed to update WhatsApp session', 500);
      return data;
    }

    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .insert(updates)
      .select()
      .single();

    if (error) throw new AppError('Failed to create WhatsApp session', 500);
    return data;
  },
};

export const SettingsModel = {
  async get(key) {
    const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle();
    if (error) throw new AppError('Failed to fetch setting', 500);
    return data?.value;
  },

  async getString(key, fallback = '') {
    const v = await this.get(key);
    if (v === undefined || v === null) return fallback;
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      if (typeof v.v === 'string') return v.v;
      return fallback;
    }
    return String(v);
  },

  async getBoolean(key, fallback = true) {
    const v = await this.get(key);
    if (v === undefined || v === null) return fallback;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v !== 'false';
    return Boolean(v);
  },

  async set(key, value) {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw new AppError('Failed to update setting', 500);
    return data;
  },

  async getAll() {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) throw new AppError('Failed to fetch settings', 500);
    return data || [];
  },
};
