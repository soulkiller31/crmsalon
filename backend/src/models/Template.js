import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const TABLE = 'message_templates';

export const TemplateModel = {
  async findAll({ type, isActive } = {}) {
    let query = supabase.from(TABLE).select('*').order('type').order('name');

    if (type) query = query.eq('type', type);
    if (isActive !== undefined) query = query.eq('is_active', isActive);

    const { data, error } = await query;
    if (error) throw new AppError('Failed to fetch templates', 500);
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) throw new AppError('Template not found', 404);
    return data;
  },

  async findActiveByType(type) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) throw new AppError('Failed to fetch template', 500);
    return data;
  },

  async findFirstActiveByTypes(types = []) {
    if (!types.length) return null;

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .in('type', types)
      .eq('is_active', true);

    if (error) throw new AppError('Failed to fetch template', 500);

    return types
      .map((type) => (data || []).find((template) => template.type === type))
      .find(Boolean) || null;
  },

  async create(template) {
    const { data, error } = await supabase.from(TABLE).insert(template).select().single();
    if (error) throw new AppError('Failed to create template', 500);
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
    if (error) throw new AppError('Failed to update template', 500);
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new AppError('Failed to delete template', 500);
  },
};
