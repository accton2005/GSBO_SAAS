# Guide de Migration CourrierFlow (Firebase vers MySQL/XAMPP)

Ce guide vous explique comment migrer votre application vers un environnement local utilisant XAMPP, PHP et MySQL.

## 1. Préparation de la Base de Données
1. Lancez **XAMPP Control Panel** et démarrez **Apache** et **MySQL**.
2. Allez sur **phpMyAdmin** (http://localhost/phpmyadmin).
3. Créez une nouvelle base de données nommée `courrier_db`.
4. Cliquez sur l'onglet **Importer** et sélectionnez le fichier `/sql/schema.sql` situé à la racine de ce projet.
5. Cliquez sur **Exécuter**.

## 2. Installation du Backend PHP
1. Naviguez vers votre dossier d'installation XAMPP (généralement `C:\xampp\htdocs`).
2. Créez un dossier nommé `courrierflow`.
3. À l'intérieur, créez un dossier nommé `api`.
4. Copiez tous les fichiers du dossier `/php/` de ce projet dans `C:\xampp\htdocs\courrierflow\api\`.
   - `config.php`
   - `login.php`
   - `users.php`
   - `courriers.php`
   - `organizations.php`
   - `services.php`
   - `audit_logs.php`

## 3. Configuration de l'Application React
1. Dans le code de votre application, ouvrez le fichier `src/config/dbConfig.ts`.
2. Modifiez la valeur de `useMySQL` pour la passer à `true` :
   ```typescript
   export const DB_CONFIG = {
     useMySQL: true,
     apiUrl: 'http://localhost/courrierflow/api'
   };
   ```
3. Enregistrez le fichier.

## 4. Déploiement du Frontend
1. Dans votre terminal, à la racine du projet React, lancez la commande :
   ```bash
   npm run build
   ```
2. Une fois la compilation terminée, un dossier `dist/` sera créé.
3. Copiez tout le contenu du dossier `dist/` dans `C:\xampp\htdocs\courrierflow\`.

## 5. Accès à l'Application
Votre application est maintenant accessible à l'adresse suivante :
**http://localhost/courrierflow**

### Notes Importantes :
- **Sécurité** : Les mots de passe sont hachés avec `password_hash()` dans PHP. Si vous importez des utilisateurs manuellement, assurez-vous de hacher leurs mots de passe ou d'utiliser la fonction `password_verify` qui accepte aussi le texte brut pour la transition (déjà configuré dans `login.php`).
- **CORS** : Le fichier `config.php` est configuré pour accepter les requêtes provenant de n'importe quelle origine (`*`). Pour une mise en production réelle, restreignez cette valeur.
- **URLs** : Si vous changez le nom du dossier dans `htdocs`, n'oubliez pas de mettre à jour `apiUrl` dans `src/config/dbConfig.ts` et `$db_name` dans `config.php`.
