import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const TABLE = 'invoices';

export const InvoiceModel = {
  async getNextNumber() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('invoice_number')
      .order('invoice_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new AppError('Failed to fetch next invoice number', 500);
    return (data?.invoice_number || 0) + 1;
  },

  async findAll({ page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw new AppError('Failed to fetch invoices', 500);
    return { data: data || [], total: count || 0, page, limit };
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) throw new AppError('Invoice not found', 404);
    return data;
  },

  async create(invoice) {
    const { data, error } = await supabase.from(TABLE).insert(invoice).select().single();
    if (error) throw new AppError(error.message || 'Failed to create invoice', 500);
    return data;
  },

  async markWhatsAppSent(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ whatsapp_sent: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Failed to update invoice', 500);
    return data;
  },
};
