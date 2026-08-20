import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const TABLE = 'customers';

const sameMonthDay = (dateValue, month, day) => {
  if (!dateValue) return false;
  const value = String(dateValue);
  const parts = value.split('-');
  if (parts.length !== 3) return false;
  return parts[1] === month && parts[2] === day;
};

const normalizeGender = (gender) => String(gender || '').trim().toLowerCase();

const daysSinceDate = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

const isFollowUpDue = (customer, gender, minDaysSinceVisit) => {
  const normalizedGender = normalizeGender(customer.gender);
  const elapsedDays = daysSinceDate(customer.last_visit);

  return normalizedGender === gender && elapsedDays !== null && elapsedDays >= minDaysSinceVisit;
};

export const CustomerModel = {
  async findAll({ search, gender, isActive, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' }) {
    let query = supabase.from(TABLE).select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (gender) query = query.eq('gender', gender);
    if (isActive !== undefined && isActive !== '') {
      query = query.eq('is_active', isActive === 'true' || isActive === true);
    }

    const validSortFields = ['name', 'phone', 'created_at', 'last_visit', 'birthday'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(field, { ascending: sortOrder === 'asc' });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new AppError('Failed to fetch customers', 500);

    return { data: data || [], total: count || 0, page, limit };
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) throw new AppError('Customer not found', 404);
    return data;
  },

  async findByPhone(phone) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('phone', phone).maybeSingle();
    if (error) throw new AppError('Database error', 500);
    return data;
  },

  async create(customer) {
    const { data, error } = await supabase.from(TABLE).insert(customer).select().single();
    if (error) throw new AppError(error.message || 'Failed to create customer', 500);
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
    if (error) throw new AppError('Failed to update customer', 500);
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new AppError('Failed to delete customer', 500);
  },

  async bulkCreate(customers) {
    const { data, error } = await supabase.from(TABLE).insert(customers).select();
    if (error) throw new AppError(error.message || 'Failed to import customers', 500);
    return data;
  },

  async getStats() {
    const { count: total, error: totalError } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true });

    const { count: active, error: activeError } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const { data: activeCustomers, error: activeCustomersError } = await supabase
      .from(TABLE)
      .select('birthday, last_visit, gender')
      .eq('is_active', true);

    if (totalError || activeError || activeCustomersError) {
      throw new AppError('Failed to fetch stats', 500);
    }

    const birthdaysToday = (activeCustomers || []).filter((customer) =>
      sameMonthDay(customer.birthday, month, day)
    ).length;

    const followUpDue = (activeCustomers || []).filter((customer) =>
      isFollowUpDue(customer, 'female', 15) || isFollowUpDue(customer, 'male', 75)
    ).length;

    return {
      total: total || 0,
      active: active || 0,
      birthdaysToday: birthdaysToday || 0,
      followUpDue: followUpDue || 0,
    };
  },

  async findBirthdaysToday() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_active', true);

    if (error) throw new AppError('Failed to fetch birthday customers', 500);
    return (data || []).filter((customer) => sameMonthDay(customer.birthday, month, day));
  },

  async findAnniversariesToday() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_active', true);

    if (error) throw new AppError('Failed to fetch anniversary customers', 500);
    return (data || []).filter((customer) => sameMonthDay(customer.anniversary, month, day));
  },

  async findFollowUpDue({ gender, minDaysSinceVisit }) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_active', true)
      .not('last_visit', 'is', null);

    if (error) throw new AppError('Failed to fetch follow-up customers', 500);
    return (data || []).filter((customer) => isFollowUpDue(customer, gender, minDaysSinceVisit));
  },

  async findAllActive() {
    const { data, error } = await supabase.from(TABLE).select('*').eq('is_active', true);
    if (error) throw new AppError('Failed to fetch customers', 500);
    return data || [];
  },
};
