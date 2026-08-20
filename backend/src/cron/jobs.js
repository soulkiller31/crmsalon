import config from '../config/index.js';
import { CustomerModel } from '../models/Customer.js';
import { TemplateModel } from '../models/Template.js';
import { MessageLogModel } from '../models/MessageLog.js';
import { SettingsModel } from '../models/WhatsApp.js';
import whatsappService from '../services/whatsappService.js';
import { interpolateTemplate } from '../services/messageService.js';

const getSalonName = async () => {
  return SettingsModel.getString('salon_name', config.salonName);
};

const FOLLOW_UP_RULES = {
  female: {
    type: 'follow_up_female',
    minDaysSinceVisit: 15,
    templateTypes: ['follow_up_female', 'follow_up'],
    label: 'female follow-up',
  },
  male: {
    type: 'follow_up_male',
    minDaysSinceVisit: 75,
    templateTypes: ['follow_up_male', 'follow_up'],
    label: 'male follow-up',
  },
};

const shouldSkipCustomer = async (customer, type, skipWindowDays) => {
  if (type === 'birthday' || type === 'anniversary') {
    return MessageLogModel.wasSentToday(customer.id, type);
  }
  if (skipWindowDays) {
    return MessageLogModel.wasSentWithinDays(customer.id, type, skipWindowDays);
  }
  if (type === 'monthly_offer') {
    return MessageLogModel.wasSentWithinDays(customer.id, type, 28);
  }
  return false;
};

const sendBulkMessages = async (customers, type, options = {}) => {
  const template = await TemplateModel.findFirstActiveByTypes(options.templateTypes || [type]);
  if (!template) {
    console.log(`[Cron] No active template for type: ${type}`);
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const salonName = await getSalonName();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const customer of customers) {
    if (await shouldSkipCustomer(customer, type, options.skipWindowDays)) {
      skipped++;
      continue;
    }

    const message = interpolateTemplate(template.content, customer, salonName);

    try {
      if (whatsappService.getStatus().isConnected) {
        await whatsappService.sendMessage(customer.phone, message);
        await MessageLogModel.create({
          customer_id: customer.id,
          template_id: template.id,
          phone: customer.phone,
          message,
          type,
          status: 'sent',
        });
        sent++;
      } else {
        await MessageLogModel.create({
          customer_id: customer.id,
          template_id: template.id,
          phone: customer.phone,
          message,
          type,
          status: 'failed',
          error_message: 'WhatsApp not connected',
        });
        failed++;
      }

      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      await MessageLogModel.create({
        customer_id: customer.id,
        template_id: template.id,
        phone: customer.phone,
        message,
        type,
        status: 'failed',
        error_message: err.message,
      });
      failed++;
    }
  }

  return { sent, failed, skipped };
};

export const CronJobs = {
  async sendBirthdayMessages() {
    console.log('[Cron] Running birthday messages...');
    const customers = await CustomerModel.findBirthdaysToday();
    console.log(`[Cron] Found ${customers.length} birthday customers`);
    return sendBulkMessages(customers, 'birthday');
  },

  async sendAnniversaryMessages() {
    console.log('[Cron] Running anniversary messages...');
    const customers = await CustomerModel.findAnniversariesToday();
    console.log(`[Cron] Found ${customers.length} anniversary customers`);
    return sendBulkMessages(customers, 'anniversary');
  },

  async sendMonthlyOffers() {
    console.log('[Cron] Running monthly offer messages...');
    const customers = await CustomerModel.findAllActive();
    console.log(`[Cron] Sending monthly offers to ${customers.length} customers`);
    return sendBulkMessages(customers, 'monthly_offer');
  },

  async sendFollowUpMessages() {
    console.log('[Cron] Running gender-based follow-up messages...');
    const femaleResult = await this.sendFemaleFollowUpMessages();
    const maleResult = await this.sendMaleFollowUpMessages();

    return {
      sent: femaleResult.sent + maleResult.sent,
      failed: femaleResult.failed + maleResult.failed,
      skipped: femaleResult.skipped + maleResult.skipped,
      breakdown: {
        follow_up_female: femaleResult,
        follow_up_male: maleResult,
      },
    };
  },

  async sendFemaleFollowUpMessages() {
    const rule = FOLLOW_UP_RULES.female;
    console.log('[Cron] Running female follow-up messages...');
    const customers = await CustomerModel.findFollowUpDue({
      gender: 'female',
      minDaysSinceVisit: rule.minDaysSinceVisit,
    });
    console.log(`[Cron] Found ${customers.length} ${rule.label} customers`);
    return sendBulkMessages(customers, rule.type, {
      templateTypes: rule.templateTypes,
      skipWindowDays: rule.minDaysSinceVisit,
    });
  },

  async sendMaleFollowUpMessages() {
    const rule = FOLLOW_UP_RULES.male;
    console.log('[Cron] Running male follow-up messages...');
    const customers = await CustomerModel.findFollowUpDue({
      gender: 'male',
      minDaysSinceVisit: rule.minDaysSinceVisit,
    });
    console.log(`[Cron] Found ${customers.length} ${rule.label} customers`);
    return sendBulkMessages(customers, rule.type, {
      templateTypes: rule.templateTypes,
      skipWindowDays: rule.minDaysSinceVisit,
    });
  },
};
