import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const TABLE = 'services';

export const ServiceModel = {
  async findAll() {
    const { data, error } = await supabase.from(TABLE).select('*').order('name');
    if (error) throw new AppError('Failed to fetch services', 500);
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) throw new AppError('Service not found', 404);
    return data;
  },

  async create(service) {
    const { data, error } = await supabase.from(TABLE).insert(service).select().single();
    if (error) throw new AppError('Failed to create service', 500);
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
    if (error) throw new AppError('Failed to update service', 500);
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new AppError('Failed to delete service', 500);
  },
};
