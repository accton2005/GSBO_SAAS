# Guide d'Intégration & Communication

Ce document explique comment intégrer l'application de Gestion des Courriers Administratifs avec des outils externes.

## 1. API REST

L'application expose une API REST pour interagir avec les données.

### Authentification
Toutes les requêtes API doivent inclure un jeton d'accès dans l'en-tête `Authorization`.
Générez vos jetons dans **Paramétrage > Intégrations > API**.

```http
Authorization: Bearer saas_votre_jeton_ici
```

### Endpoints disponibles (Exemples)
- `GET /api/courriers/entrant` : Liste des courriers entrants
- `POST /api/courriers/entrant` : Créer un nouveau courrier
- `GET /api/courriers/:id` : Détails d'un courrier

## 2. Webhooks

Les webhooks vous permettent de recevoir des notifications en temps réel.

### Événements supportés
- `courrier_entrant_created`
- `courrier_sortant_created`
- `document_added`
- `workflow_validated`

### Sécurité (HMAC)
Chaque requête de webhook inclut un en-tête `X-Signature`. Vous devez valider cette signature en utilisant le secret généré lors de la création du webhook.

Exemple de validation en Node.js :
```javascript
const crypto = require('crypto');
const signature = req.headers['x-signature'];
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature === expectedSignature) {
  // Requête valide
}
```

## 3. Intégration n8n

n8n est un outil d'automatisation puissant qui peut être utilisé pour étendre les fonctionnalités de l'application.

### Exemple : Notification Slack sur nouveau courrier
1. Dans n8n, créez un nouveau workflow.
2. Ajoutez un nœud **Webhook**.
3. Copiez l'URL du webhook n8n.
4. Dans l'application de Gestion des Courriers, allez dans **Paramétrage > Intégrations > Webhooks**.
5. Créez un nouveau webhook avec l'URL n8n et l'événement `courrier_entrant_created`.
6. Dans n8n, ajoutez un nœud **Slack** après le webhook pour envoyer un message.

### Exemple : Archivage automatique vers Google Drive
1. Utilisez le webhook `workflow_validated`.
2. Dans n8n, récupérez les détails du courrier via l'API REST si nécessaire.
3. Utilisez le nœud **Google Drive** pour uploader le document associé.

## 4. Configuration SMTP

Assurez-vous que votre serveur SMTP est correctement configuré dans **Paramétrage > Intégrations > SMTP** pour permettre l'envoi de notifications par email aux utilisateurs internes.
