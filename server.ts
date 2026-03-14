import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { rateLimit } from "express-rate-limit";
import CryptoJS from "crypto-js";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In this environment, we assume the service account is available or we use default credentials
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rate Limiting for API
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SaaS Platform API is running" });
  });

  // SMTP Test Route
  app.post("/api/integrations/smtp/test", async (req, res) => {
    const { host, port, username, password, encryption, fromEmail, fromName, testEmail } = req.body;

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: encryption === "ssl",
        auth: {
          user: username,
          pass: password,
        },
        tls: {
          rejectUnauthorized: false // Often needed for dev/test servers
        }
      });

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: testEmail,
        subject: "Test de configuration SMTP - Gestion des Courriers",
        text: "Ceci est un email de test pour valider votre configuration SMTP.",
        html: "<b>Ceci est un email de test pour valider votre configuration SMTP.</b>",
      });

      res.json({ success: true, message: "Email de test envoyé avec succès !" });
    } catch (error: any) {
      console.error("SMTP Test Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Token Middleware
  const validateApiToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Jeton API manquant ou invalide" });
    }

    const tokenValue = authHeader.split(" ")[1];

    try {
      const tokensRef = db.collection("api_tokens");
      const snapshot = await tokensRef.where("token", "==", tokenValue).where("status", "==", "active").get();

      if (snapshot.empty) {
        return res.status(401).json({ error: "Jeton API invalide ou révoqué" });
      }

      const tokenDoc = snapshot.docs[0];
      const tokenData = tokenDoc.data();

      // Check expiration
      if (new Date(tokenData.expiresAt) < new Date()) {
        return res.status(401).json({ error: "Jeton API expiré" });
      }

      // Log API Call
      await db.collection("api_logs").add({
        organizationId: tokenData.organizationId,
        tokenId: tokenDoc.id,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 200, // Will be updated if needed, but for now we log the hit
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        timestamp: new Date().toISOString()
      });

      req.organizationId = tokenData.organizationId;
      next();
    } catch (error) {
      console.error("API Token Validation Error:", error);
      res.status(500).json({ error: "Erreur lors de la validation du jeton" });
    }
  };

  // REST API Endpoints (Protected)
  app.get("/api/v1/courriers", apiLimiter, validateApiToken, async (req: any, res) => {
    try {
      const courriersRef = db.collection("courriers");
      const snapshot = await courriersRef.where("organizationId", "==", req.organizationId).get();
      const courriers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(courriers);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des courriers" });
    }
  });

  // Webhook Trigger Logic (Internal Helper)
  const triggerWebhooks = async (organizationId: string, eventType: string, payload: any) => {
    try {
      const webhooksRef = db.collection("webhooks");
      const snapshot = await webhooksRef
        .where("organizationId", "==", organizationId)
        .where("eventType", "==", eventType)
        .where("status", "==", "active")
        .get();

      for (const doc of snapshot.docs) {
        const webhook = doc.data();
        const timestamp = Date.now().toString();
        const signature = CryptoJS.HmacSHA256(JSON.stringify(payload) + timestamp, webhook.secret).toString();

        fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Signature": signature,
            "X-Timestamp": timestamp
          },
          body: JSON.stringify({
            event: eventType,
            ...payload
          })
        }).catch(err => console.error(`Webhook error for ${webhook.url}:`, err));
      }
    } catch (error) {
      console.error("Webhook triggering error:", error);
    }
  };

  // Webhook Trigger Route (Internal)
  app.post("/api/webhooks/trigger", async (req, res) => {
    const { organizationId, eventType, payload } = req.body;
    await triggerWebhooks(organizationId, eventType, payload);
    res.json({ success: true, message: "Webhook déclenché" });
  });

  // Notification Email Route
  app.post("/api/notifications/email", async (req, res) => {
    const { organizationId, to, subject, body } = req.body;

    try {
      // Get SMTP settings for the organization
      const smtpSnapshot = await db.collection("smtp_settings")
        .where("organizationId", "==", organizationId)
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (smtpSnapshot.empty) {
        return res.status(400).json({ error: "SMTP non configuré pour cette organisation" });
      }

      const smtp = smtpSnapshot.docs[0].data();
      const transporter = nodemailer.createTransport({
        host: smtp.smtp_host,
        port: smtp.smtp_port,
        secure: smtp.smtp_encryption === "ssl",
        auth: {
          user: smtp.smtp_username,
          pass: smtp.smtp_password,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: `"${smtp.smtp_from_name}" <${smtp.smtp_from_email}>`,
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, "<br>"),
      });

      res.json({ success: true, message: "Email envoyé" });
    } catch (error: any) {
      console.error("Email Notification Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Example route to trigger a webhook (for demonstration)
  app.post("/api/integrations/webhooks/trigger-test", async (req, res) => {
    const { organizationId, eventType, payload } = req.body;
    await triggerWebhooks(organizationId, eventType, payload);
    res.json({ success: true, message: "Webhook déclenché" });
  });

  // SaaS Admin API (Super Admin)
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalOrganizations: 12,
      activeSubscriptions: 10,
      totalUsers: 150,
      systemUsage: {
        storage: "45GB",
        ocrRequests: 1200
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
