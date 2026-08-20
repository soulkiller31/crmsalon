import { MessageLogModel } from '../models/MessageLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getMessageLogs = asyncHandler(async (req, res) => {
  const { status, type, page, limit } = req.query;

  const result = await MessageLogModel.findAll({
    status,
    type,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });

  res.json({ success: true, data: result });
});

export const getMessageLogStats = asyncHandler(async (_req, res) => {
  const stats = await MessageLogModel.getStats();
  res.json({ success: true, data: stats });
});
