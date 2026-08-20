import { CustomerModel } from '../models/Customer.js';
import { ExcelService } from '../services/excelService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const normalizeGender = (gender) => {
  if (gender === undefined) return undefined;
  if (gender === null || gender === '') return null;
  return String(gender).trim().toLowerCase();
};

export const getCustomers = asyncHandler(async (req, res) => {
  const { search, gender, is_active, page, limit, sort_by, sort_order } = req.query;

  const result = await CustomerModel.findAll({
    search,
    gender,
    isActive: is_active,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    sortBy: sort_by,
    sortOrder: sort_order,
  });

  res.json({ success: true, data: result });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findById(req.params.id);
  res.json({ success: true, data: customer });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const existing = await CustomerModel.findByPhone(req.body.phone);
  if (existing) {
    throw new AppError('Customer with this phone number already exists', 409);
  }

  const customer = await CustomerModel.create({
    ...req.body,
    gender: normalizeGender(req.body.gender),
  });
  res.status(201).json({ success: true, message: 'Customer created', data: customer });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  if (req.body.phone) {
    const existing = await CustomerModel.findByPhone(req.body.phone);
    if (existing && existing.id !== req.params.id) {
      throw new AppError('Phone number already in use', 409);
    }
  }

  const customer = await CustomerModel.update(req.params.id, {
    ...req.body,
    gender: normalizeGender(req.body.gender),
  });
  res.json({ success: true, message: 'Customer updated', data: customer });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  await CustomerModel.delete(req.params.id);
  res.json({ success: true, message: 'Customer deleted' });
});

export const importCustomers = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const result = await ExcelService.importCustomers(req.file.buffer);
  res.json({ success: true, message: 'Import completed', data: result });
});

export const exportCustomers = asyncHandler(async (req, res) => {
  const { data } = await CustomerModel.findAll({ limit: 10000 });
  const buffer = ExcelService.exportCustomers(data);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');
  res.send(buffer);
});

export const getCustomerStats = asyncHandler(async (_req, res) => {
  const stats = await CustomerModel.getStats();
  res.json({ success: true, data: stats });
});
