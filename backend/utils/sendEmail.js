const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getMailConfig = () => {
    const emailUser = String(process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const emailPass = String(process.env.EMAIL_PASS || process.env.SMTP_PASS || '')
        .trim()
        .replace(/\s+/g, '');
    const fromName = String(process.env.FROM_NAME || 'Thanathu Madom').trim();
    const rejectUnauthorized =
        String(process.env.EMAIL_TLS_REJECT_UNAUTHORIZED || 'true').trim().toLowerCase() !== 'false';

    if (!emailUser || !emailPass) {
        throw new Error('Missing email credentials. Please set EMAIL_USER and EMAIL_PASS in backend/.env');
    }

    const customHost = String(process.env.EMAIL_HOST || process.env.SMTP_HOST || '').trim();

    if (customHost) {
        const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
        const secure =
            String(process.env.EMAIL_SECURE || '')
                .trim()
                .toLowerCase() === 'true' || port === 465;

        return {
            fromName,
            emailUser,
            emailPass,
            transport: {
                host: customHost,
                port,
                secure,
                tls: {
                    servername: customHost,
                    rejectUnauthorized
                },
                auth: {
                    user: emailUser,
                    pass: emailPass
                }
            }
        };
    }

    return {
        fromName,
        emailUser,
        emailPass,
        transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            tls: {
                servername: 'smtp.gmail.com',
                rejectUnauthorized
            },
            auth: {
                user: emailUser,
                pass: emailPass
            }
        }
    };
};

const getTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const mailConfig = getMailConfig();
    cachedTransporter = nodemailer.createTransport(mailConfig.transport);
    return cachedTransporter;
};

const sendEmail = async (options) => {
    const { fromName, emailUser } = getMailConfig();
    const transporter = getTransporter();

    const message = {
        from: `${fromName} <${emailUser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || undefined
    };

    await transporter.sendMail(message);
};

module.exports = sendEmail;
