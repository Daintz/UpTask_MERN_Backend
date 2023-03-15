import nodemailer from 'nodemailer';

export const emailRegister = async(data) => {
    const {email, name, token} = data;

    const transport = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Administrator of projects" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirm your account",
        text: "Confirm your account in UpTask",
        html: `<p>Hola: ${name} confirm your account in UpTask</p>
        <p>Your account is almost ready, you just have to check it in the following link:
        <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm you account</a>
        </p>

        <p>If you did not create this account, you can ignore this message</p>
        `,
    });
};

export const emailForgotPassword = async(data) => {
    const {email, name, token} = data;

    const transport = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Administrator of projects" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reset your password",
        text: "Reset your password",
        html: `<p>Hola: ${name} you have requested to reset your password</p>
        <p>Follow the link below to generate your password:
        <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Reset your password</a>
        </p>

        <p>If you did not request this email, you can ignore this message</p>
        `,
    });
};