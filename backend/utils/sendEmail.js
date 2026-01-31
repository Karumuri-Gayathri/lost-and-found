
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',                         // Use Gmail's SMTP service
  auth: {
    user: process.env.EMAIL_USER,          
    pass: process.env.EMAIL_PASS          
  }
});
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,       
      to: to,                             
      subject: subject,                    
      html: htmlContent                    // Email content (HTML format)
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;  
  }
};

module.exports = sendEmail;
