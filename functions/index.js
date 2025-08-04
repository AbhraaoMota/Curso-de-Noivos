const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure com seu e-mail e senha de aplicativo do Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "misto151526@gmail.com",
    pass: "ayea zofq sjkr enln"
  }
});

exports.enviarEmailInscricao = functions.firestore
  .document("inscritos/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const email = data.email;
    const nome = data.nome;

    const mailOptions = {
      from: "Curso de Noivos <SEU_EMAIL@gmail.com>",
      to: email,
      subject: "Inscrição confirmada - Curso de Noivos",
      text: `Olá ${nome}, sua inscrição foi recebida com sucesso!\n\nEm breve entraremos em contato.`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ E-mail enviado para:", email);
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail:", error);
    }
  });
