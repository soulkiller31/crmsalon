import { InvoiceModel } from '../models/Invoice.js';
import { CustomerModel } from '../models/Customer.js';
import { MessageLogModel } from '../models/MessageLog.js';
import { SettingsModel } from '../models/WhatsApp.js';
import whatsappService from '../services/whatsappService.js';
import { generateInvoicePdf } from '../services/invoicePdfService.js';
import config from '../config/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import os from 'os';
import path from 'path';
import fs from 'fs';

const normalizeGender = (gender) => {
  if (gender === undefined) return undefined;
  if (gender === null || gender === '') return null;
  return String(gender).trim().toLowerCase();
};

const calcTotals = (items, discount = 0, taxRate = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);
  const discountAmt = Number(discount) || 0;
  const taxable = Math.max(subtotal - discountAmt, 0);
  const tax = taxRate ? (taxable * Number(taxRate)) / 100 : 0;
  const total = taxable + tax;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discountAmt * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

const formatInvoiceMessage = (invoice, salonName, salonAddress, salonPhone) => {
  const customerName = invoice.customer_name || 'Valued Customer';
  const invoiceDate = new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const invoiceNo = String(invoice.invoice_number).padStart(4, '0');

  const lines = [
    `Hello ${customerName}! 🙏`,
    '',
    `Thank you for visiting *${salonName}* today!`,
    'We are delighted to serve you. Please find your invoice details below:',
    '',
    '━━━━━━━━━━━━━━━━',
    `*INVOICE #${invoiceNo}*`,
    `Date: ${invoiceDate}`,
    '━━━━━━━━━━━━━━━━',
    '',
    '*Bill To:*',
    customerName,
    `Phone: ${invoice.customer_phone}`,
  ];

  if (invoice.customer_address) lines.push(`Address: ${invoice.customer_address}`);
  lines.push('', '*Services / Items:*');

  (invoice.items || []).forEach((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    lines.push(`• ${item.description}  ×${qty}  —  ₹${(qty * price).toFixed(2)}`);
  });

  lines.push(
    '',
    `Subtotal: ₹${Number(invoice.subtotal).toFixed(2)}`,
  );

  if (Number(invoice.discount) > 0) {
    lines.push(`Discount: -₹${Number(invoice.discount).toFixed(2)}`);
  }
  if (Number(invoice.tax) > 0) {
    lines.push(`Tax: ₹${Number(invoice.tax).toFixed(2)}`);
  }

  lines.push(
    '',
    `*Grand Total: ₹${Number(invoice.total).toFixed(2)}*`,
    '',
    `🌟 *Thank you so much for choosing ${salonName}!*`,
    'We hope you had a wonderful experience with us.',
    'We look forward to welcoming you again soon!',
    '',
    'With warm regards,',
    `*${salonName}*`,
  );

  if (salonAddress) lines.push(salonAddress);
  if (salonPhone) lines.push(`📞 ${salonPhone}`);

  if (invoice.notes) {
    lines.push('', `_Note: ${invoice.notes}_`);
  }

  return lines.join('\n');
};

export const getNextInvoiceNumber = asyncHandler(async (_req, res) => {
  const nextNumber = await InvoiceModel.getNextNumber();
  res.json({ success: true, data: { invoice_number: nextNumber } });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await InvoiceModel.findAll({
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });
  res.json({ success: true, data: result });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await InvoiceModel.findById(req.params.id);
  res.json({ success: true, data: invoice });
});

export const saveCustomerAndSendWhatsApp = asyncHandler(async (req, res) => {
  const {
    customer: customerData,
    items = [],
    discount = 0,
    tax_rate = 0,
    notes,
    send_whatsapp = true,
  } = req.body;

  if (!customerData?.name?.trim() || !customerData?.phone?.trim()) {
    throw new AppError('Customer name and phone are required', 400);
  }

  if (!items.length) {
    throw new AppError('At least one invoice item is required', 400);
  }

  let customer = await CustomerModel.findByPhone(customerData.phone);
  const customerPayload = {
    name: customerData.name.trim(),
    phone: customerData.phone.trim(),
    email: customerData.email || null,
    address: customerData.address || null,
    birthday: customerData.birthday || null,
    anniversary: customerData.anniversary || null,
    last_visit: customerData.last_visit || new Date().toISOString().split('T')[0],
    gender: normalizeGender(customerData.gender),
    notes: customerData.notes || null,
    is_active: customerData.is_active ?? true,
  };

  if (customer) {
    customer = await CustomerModel.update(customer.id, customerPayload);
  } else {
    customer = await CustomerModel.create(customerPayload);
  }

  const totals = calcTotals(items, discount, tax_rate);
  const invoice = await InvoiceModel.create({
    customer_id: customer.id,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email,
    customer_address: customer.address,
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    notes: notes || null,
    whatsapp_sent: false,
  });

  let whatsappResult = null;

  if (send_whatsapp) {
    if (!whatsappService.getStatus().isConnected) {
      throw new AppError('Customer and invoice saved, but WhatsApp is not connected', 400);
    }

    const salonName = await SettingsModel.getString('salon_name', config.salonName);
    const salonAddress = await SettingsModel.getString('salon_address', config.salonAddress);
    const salonPhone = await SettingsModel.getString('salon_phone', config.salonPhone);
    const salonGstin = await SettingsModel.getString('salon_gstin', '');

    // Generate PDF invoice
    let tmpPdfPath = null;
    try {
      const pdfBuffer = await generateInvoicePdf(invoice, salonName, salonAddress, salonPhone, salonGstin);
      tmpPdfPath = path.join(os.tmpdir(), `invoice-${invoice.invoice_number}-${Date.now()}.pdf`);
      fs.writeFileSync(tmpPdfPath, pdfBuffer);
      console.log(`[Invoice] PDF generated: ${tmpPdfPath} (${pdfBuffer.length} bytes)`);
    } catch (pdfErr) {
      console.warn('[Invoice] PDF generation failed:', pdfErr.message);
      throw new AppError(`Invoice saved but PDF generation failed: ${pdfErr.message}`, 500);
    }

    const invoiceNo = String(invoice.invoice_number).padStart(4, '0');
    const caption = `Hello ${invoice.customer_name}! 🙏\n\nPlease find your invoice *#${invoiceNo}* from *${salonName}* attached.\n\n*Total: ₹${Number(invoice.total).toFixed(2)}*\n\nThank you for visiting us! 🌟`;
    const filename = `Invoice-${invoiceNo}.pdf`;

    try {
      await whatsappService.sendDocument(customer.phone, tmpPdfPath, filename, caption);
      console.log('[Invoice] PDF sent to', customer.phone);

      await MessageLogModel.create({
        customer_id: customer.id,
        phone: customer.phone,
        message: caption,
        type: 'invoice',
        status: 'sent',
      });
      await InvoiceModel.markWhatsAppSent(invoice.id);
      whatsappResult = { sent: true };
    } catch (err) {
      await MessageLogModel.create({
        customer_id: customer.id,
        phone: customer.phone,
        message: caption,
        type: 'invoice',
        status: 'failed',
        error_message: err.message,
      });
      throw new AppError(`Saved but WhatsApp failed: ${err.message}`, 500);
    } finally {
      if (tmpPdfPath) { try { fs.unlinkSync(tmpPdfPath); } catch { /* ignore */ } }
    }
  }

  const nextNumber = await InvoiceModel.getNextNumber();

  res.status(201).json({
    success: true,
    message: whatsappResult?.sent
      ? 'Customer saved, invoice created, and WhatsApp sent'
      : 'Customer saved and invoice created',
    data: {
      customer,
      invoice,
      next_invoice_number: nextNumber,
      whatsapp: whatsappResult,
    },
  });
});

export const downloadInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await InvoiceModel.findById(req.params.id);

  const salonName = await SettingsModel.getString('salon_name', config.salonName);
  const salonAddress = await SettingsModel.getString('salon_address', config.salonAddress);
  const salonPhone = await SettingsModel.getString('salon_phone', config.salonPhone);
  const salonGstin = await SettingsModel.getString('salon_gstin', '');

  const pdfBuffer = await generateInvoicePdf(invoice, salonName, salonAddress, salonPhone, salonGstin);

  const invoiceNo = String(invoice.invoice_number).padStart(4, '0');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNo}.pdf"`);
  res.send(pdfBuffer);
});

export const resendInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await InvoiceModel.findById(req.params.id);

  // Use provided phone or fall back to original customer phone
  const phone = (req.body.phone || invoice.customer_phone || '').trim();
  if (!phone) throw new AppError('Phone number is required', 400);

  if (!whatsappService.getStatus().isConnected) {
    throw new AppError('WhatsApp is not connected', 400);
  }

  const salonName = await SettingsModel.getString('salon_name', config.salonName);
  const salonAddress = await SettingsModel.getString('salon_address', config.salonAddress);
  const salonPhone = await SettingsModel.getString('salon_phone', config.salonPhone);
  const salonGstin = await SettingsModel.getString('salon_gstin', '');

  const pdfBuffer = await generateInvoicePdf(invoice, salonName, salonAddress, salonPhone, salonGstin);
  const invoiceNo = String(invoice.invoice_number).padStart(4, '0');
  const tmpPdfPath = path.join(os.tmpdir(), `invoice-resend-${invoice.invoice_number}-${Date.now()}.pdf`);
  fs.writeFileSync(tmpPdfPath, pdfBuffer);

  const caption = `Hello! 🙏\n\nPlease find invoice *#${invoiceNo}* from *${salonName}* attached.\n\n*Total: ₹${Number(invoice.total).toFixed(2)}*\n\nThank you! 🌟`;
  const filename = `Invoice-${invoiceNo}.pdf`;

  try {
    await whatsappService.sendDocument(phone, tmpPdfPath, filename, caption);

    await MessageLogModel.create({
      customer_id: invoice.customer_id,
      phone,
      message: caption,
      type: 'invoice',
      status: 'sent',
    });

    res.json({ success: true, message: `Invoice #${invoiceNo} resent to ${phone}` });
  } catch (err) {
    await MessageLogModel.create({
      customer_id: invoice.customer_id,
      phone,
      message: caption,
      type: 'invoice',
      status: 'failed',
      error_message: err.message,
    });
    throw new AppError(`Resend failed: ${err.message}`, 500);
  } finally {
    try { fs.unlinkSync(tmpPdfPath); } catch { /* ignore */ }
  }
});

export const getInvoiceReport = asyncHandler(async (req, res) => {
  const { filter = 'month', start, end } = req.query;

  const VALID = ['today', 'month', 'all', 'custom'];
  if (!VALID.includes(filter)) {
    throw new AppError(`Invalid filter "${filter}". Must be one of: ${VALID.join(', ')}`, 400);
  }

  if (filter === 'custom' && (!start || !end)) {
    throw new AppError('start and end query params are required when filter=custom', 400);
  }

  const rows = await InvoiceModel.getReport({ filter, start, end });
  res.json({ success: true, data: rows });
});

export const exportVisitReport = asyncHandler(async (req, res) => {
  const { filter = 'month', start, end } = req.query;

  const VALID = ['today', 'month', 'all', 'custom'];
  if (!VALID.includes(filter)) throw new AppError(`Invalid filter "${filter}"`, 400);
  if (filter === 'custom' && (!start || !end)) throw new AppError('start and end required when filter=custom', 400);

  const rows = await InvoiceModel.getReport({ filter, start, end });

  // Build Excel using xlsx (already installed)
  const { utils, write } = await import('xlsx');

  const wsData = [
    ['S.No', 'Customer Name', 'Phone', 'DOB', 'Anniversary', 'Services', 'Amount (Rs.)', 'Visit Date'],
    ...rows.map((row, i) => [
      i + 1,
      row.customer_name,
      row.customer_phone,
      row.birthday || '',
      row.anniversary || '',
      (row.items || []).map(item => item.description).join(', '),
      Number(row.total),
      new Date(row.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    ]),
  ];

  const ws = utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 40 }, { wch: 14 }, { wch: 14 },
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Visit Report');

  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
  const dateStr = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="visit-report-${dateStr}.xlsx"`);
  res.send(buf);
});

export const getBusinessReport = asyncHandler(async (req, res) => {
  const { filter = 'month', start, end } = req.query;

  const VALID = ['today', 'month', 'all', 'custom'];
  if (!VALID.includes(filter)) throw new AppError(`Invalid filter "${filter}"`, 400);
  if (filter === 'custom' && (!start || !end)) throw new AppError('start and end required when filter=custom', 400);

  const rows = await InvoiceModel.getReport({ filter, start, end });

  // Total revenue and visits
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.total), 0);
  const totalVisits = rows.length;
  const avgPerVisit = totalVisits > 0 ? totalRevenue / totalVisits : 0;

  // Unique customers
  const uniqueCustomers = new Set(rows.map(r => r.customer_phone)).size;

  // Top services — count how many times each service appears
  const serviceCount = {};
  rows.forEach(row => {
    (row.items || []).forEach(item => {
      const name = item.description || 'Unknown';
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
  });
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Top customers by revenue
  const customerRevenue = {};
  const customerVisits = {};
  rows.forEach(row => {
    const key = row.customer_phone;
    customerRevenue[key] = (customerRevenue[key] || 0) + Number(row.total);
    customerVisits[key] = (customerVisits[key] || 0) + 1;
    // Store name alongside phone
    if (!customerRevenue[`${key}_name`]) customerRevenue[`${key}_name`] = row.customer_name;
  });
  const topCustomers = Object.entries(customerRevenue)
    .filter(([key]) => !key.endsWith('_name'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phone, revenue]) => ({
      name: customerRevenue[`${phone}_name`] || phone,
      phone,
      revenue: Math.round(revenue * 100) / 100,
      visits: customerVisits[phone] || 0,
    }));

  // Daily revenue breakdown (for charts — group by date)
  const dailyRevenue = {};
  rows.forEach(row => {
    const date = row.created_at.split('T')[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(row.total);
  });
  const dailyBreakdown = Object.entries(dailyRevenue)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
      label: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    }));

  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalVisits,
        uniqueCustomers,
        avgPerVisit: Math.round(avgPerVisit * 100) / 100,
      },
      topServices,
      topCustomers,
      dailyBreakdown,
    },
  });
});

export const exportBusinessReport = asyncHandler(async (req, res) => {
  const { filter = 'month', start, end } = req.query;

  const VALID = ['today', 'month', 'all', 'custom'];
  if (!VALID.includes(filter)) throw new AppError(`Invalid filter "${filter}"`, 400);
  if (filter === 'custom' && (!start || !end)) throw new AppError('start and end required when filter=custom', 400);

  const rows = await InvoiceModel.getReport({ filter, start, end });
  const { utils, write } = await import('xlsx');

  // Sheet 1: Summary
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.total), 0);
  const totalVisits = rows.length;
  const uniqueCustomers = new Set(rows.map(r => r.customer_phone)).size;
  const avgPerVisit = totalVisits > 0 ? totalRevenue / totalVisits : 0;

  const summaryData = [
    ['Metric', 'Value'],
    ['Total Revenue (Rs.)', Math.round(totalRevenue * 100) / 100],
    ['Total Visits', totalVisits],
    ['Unique Customers', uniqueCustomers],
    ['Avg per Visit (Rs.)', Math.round(avgPerVisit * 100) / 100],
    ['Period', filter === 'custom' ? `${start} to ${end}` : filter],
    ['Generated On', new Date().toLocaleDateString('en-IN')],
  ];

  // Sheet 2: Top Services
  const serviceCount = {};
  rows.forEach(row => {
    (row.items || []).forEach(item => {
      const name = item.description || 'Unknown';
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
  });
  const topServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]);
  const servicesData = [
    ['Service Name', 'Count'],
    ...topServices.map(([name, count]) => [name, count]),
  ];

  // Sheet 3: Top Customers
  const customerRevenue = {};
  const customerVisits = {};
  rows.forEach(row => {
    const key = row.customer_phone;
    customerRevenue[key] = (customerRevenue[key] || 0) + Number(row.total);
    customerVisits[key] = (customerVisits[key] || 0) + 1;
    if (!customerRevenue[`${key}_name`]) customerRevenue[`${key}_name`] = row.customer_name;
  });
  const topCustomersData = [
    ['Customer Name', 'Phone', 'Total Revenue (Rs.)', 'Visits'],
    ...Object.entries(customerRevenue)
      .filter(([key]) => !key.endsWith('_name'))
      .sort((a, b) => b[1] - a[1])
      .map(([phone, revenue]) => [
        customerRevenue[`${phone}_name`] || phone,
        phone,
        Math.round(revenue * 100) / 100,
        customerVisits[phone] || 0,
      ]),
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, utils.aoa_to_sheet(summaryData), 'Summary');
  utils.book_append_sheet(wb, utils.aoa_to_sheet(servicesData), 'Top Services');
  utils.book_append_sheet(wb, utils.aoa_to_sheet(topCustomersData), 'Top Customers');

  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
  const dateStr = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="business-report-${dateStr}.xlsx"`);
  res.send(buf);
});
