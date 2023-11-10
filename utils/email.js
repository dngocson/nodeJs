const nodeMailer = require("nodemailer");
const sendEmail = async (options) => {
  // 1. Create the transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    logger: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // ACTIVE in GMAIL "LESS SECURE APP" options
  });

  // 2. Define the email options
  const mailOptions = {
    from: "Do Ngoc Son",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
