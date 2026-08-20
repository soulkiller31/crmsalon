import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const TABLE = 'message_logs';

export const MessageLogModel = {
  async findAll({ status, type, page = 1, limit = 20 }) {
    let query = supabase
      .from(TABLE)
      .select('*, customers(name), message_templates(name)', { count: 'exact' })
      .order('sent_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new AppError('Failed to fetch message logs', 500);

    return { data: data || [], total: count || 0, page, limit };
  },

  async create(log) {
    const { data, error } = await supabase.from(TABLE).insert(log).select().single();
    if (error) throw new AppError('Failed to create message log', 500);
    return data;
  },

  async wasSentToday(customerId, type) {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('type', type)
      .eq('status', 'sent')
      .gte('sent_at', `${today}T00:00:00`);

    if (error) return false;
    return (count || 0) > 0;
  },

  async wasSentWithinDays(customerId, type, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffIso = cutoff.toISOString();

    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('type', type)
      .eq('status', 'sent')
      .gte('sent_at', cutoffIso);

    if (error) return false;
    return (count || 0) > 0;
  },

  async getStats() {
    const { count: total } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    const { count: sent } = await supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('status', 'sent');
    const { count: failed } = await supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('status', 'failed');

    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', `${today}T00:00:00`);

    return {
      total: total || 0,
      sent: sent || 0,
      failed: failed || 0,
      today: todayCount || 0,
    };
  },
};
