"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const AppError_1 = __importDefault(require("../errors/AppError"));
class EmailError extends AppError_1.default {
    constructor(message = 'Email could not be sent', context) {
        super(message, 500, false, context);
        this.name = 'EmailError';
    }
}
class EmailService {
    constructor() {
        const mailerConfig = {
            host: process.env.MAILER_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASSWORD
            }
        };
        this.transporter = nodemailer_1.default.createTransport(mailerConfig);
    }
    send(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.sendMail(Object.assign(Object.assign({}, email), { headers: {
                        'X-Mailgun-Track': 'no'
                    } }));
                return;
            }
            catch (error) {
                throw new EmailError("Failed to send email", {
                    originalError: error.message,
                    emailTo: email.to,
                    subject: email.subject
                });
            }
        });
    }
    handleRequest(email, type, webtokenService) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = Math.floor(1000 + Math.random() * 900000);
            const token = webtokenService.generateToken({
                verificationCode: code
            }, "15m");
            let emailPayload;
            switch (type) {
                case "UPDATE":
                    emailPayload = this.updateEmailBuilder(email, code);
                    break;
                case "RECOVERY":
                    emailPayload = this.accountRecoveryEmailBuidler(email, code);
                    break;
                case "NEW":
                    emailPayload = this.verificationEmailBuilder(email, code);
                    break;
                default:
                    throw new EmailError(undefined, {
                        reason: "invalid email type"
                    });
            }
            yield this.send(emailPayload);
            return token;
        });
    }
    verificationEmailBuilder(email, verificationCode) {
        const html = `<!DOCTYPE html>
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
        `;
        return ({
            from: "postmaster@ginrealestate.mx",
            to: email,
            subject: "Verificar Correo Electrónico",
            html: html
        });
    }
    accountRecoveryEmailBuidler(email, verificationCode) {
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
            `;
        return ({
            from: "postmaster@ginrealestate.mx",
            to: email,
            subject: "Recupera tu cuenta de CXplorers con este enlace",
            html: html
        });
    }
    updateEmailBuilder(email, verificationCode) {
        const html = `<!DOCTYPE html>
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
        `;
        return ({
            from: "postmaster@ginrealestate.mx",
            to: email,
            subject: "Verificar Correo Electrónico",
            html: html
        });
    }
}
exports.default = EmailService;
