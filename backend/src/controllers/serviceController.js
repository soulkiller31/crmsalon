import { ServiceModel } from '../models/Service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getServices = asyncHandler(async (_req, res) => {
  const services = await ServiceModel.findAll();
  res.json({ success: true, data: services });
});

export const createService = asyncHandler(async (req, res) => {
  const service = await ServiceModel.create(req.body);
  res.status(201).json({ success: true, message: 'Service created', data: service });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await ServiceModel.update(req.params.id, req.body);
  res.json({ success: true, message: 'Service updated', data: service });
});

export const deleteService = asyncHandler(async (req, res) => {
  await ServiceModel.delete(req.params.id);
  res.json({ success: true, message: 'Service deleted' });
});
