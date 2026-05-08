const cron = require("node-cron");
const db = require("../config/db");
const {
  sendExpiredMedicineAlert,
  sendNearExpiryAlert,
  sendLowStockAlert,
} = require("../services/emailService");

const ALERT_ROLES = ["MANAGER", "STOREKEEPER"];
const parsedNearExpiryMonths = Number(process.env.NEAR_EXPIRY_MONTHS || 6);
const NEAR_EXPIRY_MONTHS =
  Number.isFinite(parsedNearExpiryMonths) && parsedNearExpiryMonths > 0
    ? Math.max(1, Math.floor(parsedNearExpiryMonths))
    : 6;
const DAILY_ALERT_CRON = process.env.EXPIRY_ALERT_CRON || "0 7 * * *";

const getRecipientsByRoles = async (roles) => {
  const placeholders = roles.map(() => "?").join(", ");
  const [rows] = await db.query(
    `SELECT email, name, role
     FROM users
     WHERE role IN (${placeholders})
       AND email IS NOT NULL
       AND email <> ''`,
    roles,
  );

  return rows;
};

const getExpiredItems = async () => {
  const [rows] = await db.query(`
    SELECT
      m.name,
      b.batch_code,
      b.expiry_date,
      b.quantity,
      b.position
    FROM batches b
    JOIN medicines m ON m.id = b.medicine_id
    WHERE b.expiry_date < CURDATE()
      AND b.quantity > 0
      AND m.is_deleted = 0
    ORDER BY b.expiry_date ASC, m.name ASC
  `);

  return rows;
};

const getNearExpiryItems = async () => {
  const [rows] = await db.query(
    `
    SELECT
      m.name,
      b.batch_code,
      b.expiry_date,
      b.quantity,
      b.position
    FROM batches b
    JOIN medicines m ON m.id = b.medicine_id
    WHERE b.expiry_date >= CURDATE()
      AND b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? MONTH)
      AND b.quantity > 0
      AND m.is_deleted = 0
    ORDER BY b.expiry_date ASC, m.name ASC
  `,
    [NEAR_EXPIRY_MONTHS],
  );

  return rows;
};

const getLowStockItems = async () => {
  const [rows] = await db.query(`
    SELECT
      m.id AS medicine_id,
      m.name,
      COALESCE(SUM(b.quantity), 0) AS current_stock,
      m.min_stock,
      (m.min_stock - COALESCE(SUM(b.quantity), 0)) AS deficit
    FROM medicines m
    LEFT JOIN batches b ON b.medicine_id = m.id AND b.quantity > 0
    WHERE m.is_deleted = 0
      AND m.min_stock > 0
    GROUP BY m.id, m.name, m.min_stock
    HAVING current_stock <= m.min_stock
    ORDER BY deficit DESC, m.name ASC
  `);

  return rows;
};

const sendAlertToRecipients = async ({ recipients, items, type, send }) => {
  if (items.length === 0) {
    console.log(`[ExpiryAlertJob] No ${type} items found.`);
    return;
  }

  if (recipients.length === 0) {
    console.log(`[ExpiryAlertJob] No recipients found for ${type} alert.`);
    return;
  }

  for (const recipient of recipients) {
    try {
      await send(recipient.email, items);
      console.log(
        `[ExpiryAlertJob] Sent ${type} alert to ${recipient.email} (${recipient.role}).`,
      );
    } catch (err) {
      console.error(
        `[ExpiryAlertJob] Failed sending ${type} alert to ${recipient.email}:`,
        err.message,
      );
    }
  }

  console.log(
    `[ExpiryAlertJob] ${type}: ${items.length} item(s), ${recipients.length} recipient(s).`,
  );
};

const runExpiryAlertJob = async () => {
  let expiryRecipients = [];
  let managerRecipients = [];

  try {
    expiryRecipients = await getRecipientsByRoles(ALERT_ROLES);
    managerRecipients = expiryRecipients.filter((recipient) => recipient.role === "MANAGER");
  } catch (err) {
    console.error("[ExpiryAlertJob] Failed loading alert recipients:", err.message);
    return;
  }

  if (expiryRecipients.length === 0) {
    console.log("[ExpiryAlertJob] No MANAGER or STOREKEEPER email recipients found.");
    return;
  }

  try {
    const expiredItems = await getExpiredItems();
    await sendAlertToRecipients({
      recipients: expiryRecipients,
      items: expiredItems,
      type: "expired medicine",
      send: sendExpiredMedicineAlert,
    });
  } catch (err) {
    console.error("[ExpiryAlertJob] Failed checking expired medicines:", err.message);
  }

  try {
    const nearExpiryItems = await getNearExpiryItems();
    await sendAlertToRecipients({
      recipients: expiryRecipients,
      items: nearExpiryItems,
      type: "near-expiry medicine",
      send: sendNearExpiryAlert,
    });
  } catch (err) {
    console.error("[ExpiryAlertJob] Failed checking near-expiry medicines:", err.message);
  }

  try {
    const lowStockItems = await getLowStockItems();
    await sendAlertToRecipients({
      recipients: managerRecipients,
      items: lowStockItems,
      type: "low-stock",
      send: sendLowStockAlert,
    });
  } catch (err) {
    console.error("[ExpiryAlertJob] Failed checking low stock:", err.message);
  }
};

cron.schedule(DAILY_ALERT_CRON, runExpiryAlertJob, {
  timezone: process.env.TZ || "Asia/Ho_Chi_Minh",
});

console.log(
  `[ExpiryAlertJob] Registered cron job "${DAILY_ALERT_CRON}" for MANAGER and STOREKEEPER recipients.`,
);

module.exports = {
  runExpiryAlertJob,
};
