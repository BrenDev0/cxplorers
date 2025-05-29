import nodeMailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import AppError from '../errors/AppError';
import WebTokenService from './WebtokenService';

class EmailError extends AppError {
  constructor(message = 'Email could not be sent', context?: Record<string, unknown>) {
    super(message, 500, false, context);
    this.name = 'EmailError';
  }
}

export default class EmailService {
    private transporter: Transporter;
    constructor() {
        const mailerConfig: SMTPTransport.Options = {
            host: process.env.MAILER_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASSWORD
            }
        }
        this.transporter = nodeMailer.createTransport(mailerConfig);
    }

    async send(email: any): Promise<void> {
        try {
            await this.transporter.sendMail({
                ...email,
                 headers: {
                  'X-Mailgun-Track': 'no'
                }
            });
            return;
        } catch (error) {
            throw new EmailError("Failed to send email", {
                originalError: (error as Error).message,
                emailTo: email.to,
                subject: email.subject
            });
        }
    }

    async handleRequest(email: string, type: string, webtokenService: WebTokenService): Promise<string> {

        const code = Math.floor(1000 + Math.random() * 900000);
        
        const token = webtokenService.generateToken({
            verificationCode: code
        }, "15m")

        let emailPayload;
        switch(type) {
            case "UPDATE":
                emailPayload = this.updateEmailBuilder(email, code);
                break
            case "RECOVERY":
                emailPayload = this.accountRecoveryEmailBuidler(email,  code);
                break;
            case "NEW":
                emailPayload = this.verificationEmailBuilder(email, code);
                break
            default:
                throw new EmailError(undefined, {
                    reason: "invalid email type"
                })
        }

        await this.send(emailPayload);

        return token;
    }

    verificationEmailBuilder(email: string, verificationCode: number) {
        const html =  `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de Verificación</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
                .code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    padding: 10px;
                    margin-top: 10px;
                    border-radius: 5px;
                    background-color: #f4f4f4;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Verificación de tu correo electrónico</h2>
                <p>Hola,</p>
                <p>Gracias por registrarte en nuestra plataforma. Para verificar tu dirección de correo electrónico, ingresa el siguiente código en la página de verificación:</p>
                <div class="code">${verificationCode}</div>
                <p>Este código expirará en 15 minutos. Si no solicitaste este código, por favor ignora este correo.</p>
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>¡Esperamos verte pronto!</p>
                <p>Saludos,<br>El equipo de CXplorers</p>
            </div>
        </body>
        </html>
        `
        
        return (
            {
                from: "postmaster@ginrealestate.mx",
                to: email,
                subject: "Verificar Correo Electrónico",
                html: html
            }
        )
    }

    accountRecoveryEmailBuidler(email: string, verificationCode: number) {
        const html = `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recuperación de Cuenta</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Recuperación de Cuenta</h2>
                    <p>Hola,</p>
                    <p>Recibimos una solicitud para recuperar tu cuenta. Si fuiste tú quien hizo esta solicitud, verificar tu dirección de correo electrónico, ingresa el siguiente código en la página de verificación:</p>
                    <div class="code">${verificationCode}</div>
                    <p>Este código expirará en 15 minutos. Si no solicitaste este código, por favor ignora este correo.</p>
                    <p>Si tienes alguna pregunta o problemas, no dudes en contactarnos.</p>
                    <p>¡Gracias por usar nuestra plataforma!</p>
                    <p>Saludos,<br>El equipo de CXplorers</p>
                </div>
            </body>
            </html>
            `
    
    return (
        {
            from: "postmaster@ginrealestate.mx",
            to: email,
            subject: "Recupera tu cuenta de CXplorers con este enlace",
            html: html
        }
    )

    } 

    updateEmailBuilder(email: string, verificationCode: number) {
        const html =  `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de Verificación</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
                .code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    padding: 10px;
                    margin-top: 10px;
                    border-radius: 5px;
                    background-color: #f4f4f4;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Verificación de tu correo electrónico</h2>
                <p>Hola,</p>
                <p>Recibimos una solicitud para cambiar tu dirección de correo electrónico. Para completar este proceso, por favor ingresa el siguiente código en la página de verificación:</p>
                <div class="code">${verificationCode}</div>
                <p>Este código expirará en 15 minutos. Si no solicitaste este código, por favor ignora este correo.</p>
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>¡Esperamos verte pronto!</p>
                <p>Saludos,<br>El equipo de CXplorers</p>
            </div>
        </body>
        </html>
        `
        
        return (
            {
                from: "postmaster@ginrealestate.mx",
                to: email,
                subject: "Verificar Correo Electrónico",
                html: html
            }
        )
    }
}