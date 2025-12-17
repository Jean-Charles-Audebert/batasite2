const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /api/contact - Envoyer un email de contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation basique
    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Tous les champs sont requis",
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email invalide",
      });
    }

    // Envoi de l'email au CLIENT_EMAIL
    await transporter.sendMail({
      from: process.env.SMTP_FROM_NOREPLY,
      to: process.env.CLIENT_EMAIL,
      subject: `Contact site Batala ${name}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>De :</strong> ${name}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      replyTo: email,
    });

    // Envoi d'un email de confirmation à l'utilisateur
    await transporter.sendMail({
      from: process.env.CLIENT_EMAIL,
      to: email,
      subject: "Votre message a bien été reçu",
      html: `
        <h2>Merci pour votre message</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons bien reçu votre message. Notre équipe vous répondra dans les meilleurs délais.</p>
        <p>Cordialement,</p>
        <p>L'équipe Batala La Rochelle</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Votre message a été envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({
      error: "Erreur lors de l'envoi du message",
    });
  }
});

module.exports = router;
