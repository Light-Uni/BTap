const nodemailer = require("nodemailer");

const mailConfig = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 587),
  user: process.env.MAIL_USERNAME,
  pass: process.env.MAIL_PASSWORD,
  fromEmail: process.env.MAIL_FROM_EMAIL || process.env.MAIL_USERNAME,
  fromName: process.env.MAIL_FROM_NAME || "1102 POS",
};

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.port === 465,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.pass,
  },
});

const getFromAddress = () => `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`;

const ensureMailConfig = () => {
  if (!mailConfig.user || !mailConfig.pass || !mailConfig.fromEmail) {
    throw new Error("Missing mail config. Please set MAIL_USERNAME, MAIL_PASSWORD, and MAIL_FROM_EMAIL.");
  }
};

const sendMail = async ({ to, subject, html }) => {
  ensureMailConfig();

  const info = await transporter.sendMail({
    to,
    from: getFromAddress(),
    subject,
    html,
  });

  console.log(
    `[EmailService] Sent "${subject}" to ${to}. Accepted: ${info.accepted.join(", ") || "-"}; Rejected: ${info.rejected.join(", ") || "-"}`,
  );

  return info;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

exports.sendResetEmail = async (to, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await sendMail({
    to,
    subject: "Dat lai mat khau",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;">
        <h3 style="margin:0 0 12px;">Dat lai mat khau</h3>
        <p>Ban vua yeu cau dat lai mat khau cho tai khoan trong he thong.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;">
            Dat lai mat khau
          </a>
        </p>
        <p>Link nay se het han sau 15 phut.</p>
        <p style="font-size:12px;color:#64748b;">Neu ban khong yeu cau, vui long bo qua email nay.</p>
      </div>
    `,
  });
};

// items: [{name, batch_code, expiry_date, quantity, warehouse_name}]
exports.sendNearExpiryAlert = async (to, items) => {
  const dateStr = new Date().toLocaleDateString("vi-VN");

  const tableRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(i.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(i.batch_code)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#e53e3e;">
          ${new Date(i.expiry_date).toLocaleDateString("vi-VN")}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(i.quantity)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(i.warehouse_name || "-")}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;">
      <div style="background:#1e40af;color:white;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">Canh bao: Lo thuoc can date</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:.85;">Ngay ${dateStr}</p>
      </div>
      <div style="padding:20px 24px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;">
        <p style="color:#475569;font-size:14px;">
          Cac lo thuoc sau day se het han trong vong <strong>6 thang toi</strong>.
          Vui long kiem tra va xu ly kip thoi.
        </p>
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">Ten thuoc</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">Ma lo</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">Han su dung</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">So luong</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">Kho</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <p style="margin-top:16px;font-size:12px;color:#94a3b8;">
          Email nay duoc gui tu dong tu he thong Pharm WMS luc 8:00 sang moi ngay.
        </p>
      </div>
    </div>
  `;

  await sendMail({
    to,
    subject: `[Canh bao] Danh sach lo thuoc can date - ${dateStr}`,
    html,
  });
};

// items: [{medicine_id, name, current_stock, min_stock, deficit}]
exports.sendLowStockAlert = async (to, items) => {
  const dateStr = new Date().toLocaleDateString("vi-VN");

  const tableRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(i.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${escapeHtml(i.current_stock)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${escapeHtml(i.min_stock)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#e53e3e;font-weight:bold;">-${escapeHtml(i.deficit)}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;">
      <div style="background:#b45309;color:white;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">Canh bao: Ton kho duoi nguong toi thieu</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:.85;">Ngay ${dateStr}</p>
      </div>
      <div style="padding:20px 24px;background:#fffbeb;border:1px solid #fde68a;border-top:none;">
        <p style="color:#78350f;font-size:14px;">
          Cac mat hang sau day co <strong>ton kho thap hon nguong toi thieu</strong>.
          Vui long len ke hoach nhap hang kip thoi.
        </p>
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">
          <thead>
            <tr style="background:#fef3c7;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#92400e;font-weight:600;">Ten thuoc</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#92400e;font-weight:600;">Ton hien tai</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#92400e;font-weight:600;">Nguong toi thieu</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#92400e;font-weight:600;">Thieu</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <p style="margin-top:16px;font-size:12px;color:#94a3b8;">
          Email nay duoc gui tu dong tu he thong Pharm WMS luc 8:00 sang moi ngay.
        </p>
      </div>
    </div>
  `;

  await sendMail({
    to,
    subject: `[Canh bao] Ton kho duoi nguong - ${dateStr}`,
    html,
  });
};
