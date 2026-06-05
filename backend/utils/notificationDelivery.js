import nodemailer from 'nodemailer';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { normalizeInternationalPhone, PHONE_FORMAT_MESSAGE } from './phone.js';

const getProfilePhone = async (recipientRole, recipientUserId) => {
  const Model = recipientRole === 'teacher' ? Teacher : Student;
  const profile = await Model.findOne({ user: recipientUserId }).lean();
  return profile?.phone || '';
};

const normalizeTwilioStatus = (status) => {
  if (['delivered', 'sent'].includes(status)) return status;
  if (['queued', 'accepted', 'scheduled', 'sending'].includes(status)) return 'queued';
  if (['undelivered', 'failed'].includes(status)) return status;
  return 'queued';
};

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const getTwilioMessage = async ({ accountSid, authToken, messageSid }) => {
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}.json`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    },
  });

  if (!response.ok) return null;
  return response.json();
};

const sendEmail = async ({ to, subject, message }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // En developpement, on garde la notification en base meme si le SMTP n'est pas encore branche.
    return {
      status: 'dev',
      detail: 'SMTP non configure',
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: subject || 'Notification academique',
    text: message,
  });

  return { status: 'sent', detail: 'Email envoye' };
};

const sendSms = async ({ recipientRole, recipientUserId, message }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const phone = await getProfilePhone(recipientRole, recipientUserId);
  let to = '';

  try {
    to = normalizeInternationalPhone(phone);
  } catch {
    return {
      status: 'dev',
      detail: `SMS non envoye: numero invalide. ${PHONE_FORMAT_MESSAGE}`,
    };
  }

  if (!to) {
    return {
      status: 'dev',
      detail: 'SMS non envoye: aucun numero de telephone renseigne. Notification plateforme conservee.',
    };
  }

  if (!accountSid || !authToken || !from) {
    // Meme logique que pour les emails: la plateforme reste testable sans compte SMS payant.
    return { status: 'dev', detail: `SMS non configure. Numero cible: ${to}` };
  }

  const maskPhone = (number) => `${number.slice(0, 4)}****${number.slice(-3)}`;
  const params = new URLSearchParams({ To: to, From: from, Body: message });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { status: 'failed', detail: errorText.slice(0, 240) };
  }

  let twilioMessage = await response.json();
  let twilioStatus = twilioMessage.status || 'queued';

  if (normalizeTwilioStatus(twilioStatus) === 'queued') {
    await wait(1000);
    const refreshed = await getTwilioMessage({
      accountSid,
      authToken,
      messageSid: twilioMessage.sid,
    });
    twilioMessage = refreshed || twilioMessage;
    twilioStatus = twilioMessage.status || twilioStatus;
  }

  return {
    status: normalizeTwilioStatus(twilioStatus),
    detail: `Twilio ${twilioStatus}. SID ${twilioMessage.sid}. Vers ${maskPhone(to)}.`,
  };
};

export const deliverNotification = async ({ channel, recipient, recipientRole, recipientUserId, subject, message }) => {
  if (channel === 'sms') {
    return sendSms({ recipientRole, recipientUserId, message });
  }

  return sendEmail({ to: recipient, subject, message });
};
