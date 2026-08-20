import { TemplateModel } from '../models/Template.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getTemplates = asyncHandler(async (req, res) => {
  const { type, is_active } = req.query;
  const isActive = is_active !== undefined ? is_active === 'true' : undefined;

  const templates = await TemplateModel.findAll({ type, isActive });
  res.json({ success: true, data: templates });
});

export const getTemplate = asyncHandler(async (req, res) => {
  const template = await TemplateModel.findById(req.params.id);
  res.json({ success: true, data: template });
});

export const createTemplate = asyncHandler(async (req, res) => {
  const template = await TemplateModel.create(req.body);
  res.status(201).json({ success: true, message: 'Template created', data: template });
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await TemplateModel.update(req.params.id, req.body);
  res.json({ success: true, message: 'Template updated', data: template });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  await TemplateModel.delete(req.params.id);
  res.json({ success: true, message: 'Template deleted' });
});
