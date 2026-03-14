<?php
/**
 * Assistant d'installation automatique
 * Application: Gestion des Courriers Administratifs
 */

session_start();

// Protection contre la ré-installation
if (file_exists('setup.lock')) {
    die("L'installation est déjà terminée. Veuillez supprimer le fichier setup.php pour plus de sécurité.");
}

$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$error = '';
$success = '';

// Configuration des dossiers à vérifier
$folders = [
    'uploads' => 'Dossier des téléchargements',
    'archives' => 'Dossier des archives',
    'config' => 'Dossier de configuration'
];

// Étape 2: Traitement de la configuration BDD
if ($step == 2 && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $host = $_POST['db_host'];
    $name = $_POST['db_name'];
    $user = $_POST['db_user'];
    $pass = $_POST['db_pass'];

    try {
        $pdo = new PDO("mysql:host=$host", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Créer la base de données si elle n'existe pas
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        $_SESSION['db_config'] = [
            'host' => $host,
            'name' => $name,
            'user' => $user,
            'pass' => $pass
        ];
        
        header('Location: setup.php?step=3');
        exit;
    } catch (PDOException $e) {
        $error = "Erreur de connexion à la base de données : " . $e->getMessage();
    }
}

// Étape 3: Importation du schéma SQL
if ($step == 3) {
    if (!isset($_SESSION['db_config'])) {
        header('Location: setup.php?step=2');
        exit;
    }

    $config = $_SESSION['db_config'];
    try {
        $pdo = new PDO("mysql:host={$config['host']};dbname={$config['name']}", $config['user'], $config['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sql = file_get_contents('database/schema.sql');
        if ($sql === false) {
            throw new Exception("Impossible de lire le fichier database/schema.sql");
        }
        
        $pdo->exec($sql);
        $success = "La base de données a été installée avec succès.";
    } catch (Exception $e) {
        $error = "Erreur lors de l'importation SQL : " . $e->getMessage();
    }
}

// Étape 4: Création du compte administrateur
if ($step == 4 && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $admin_name = $_POST['admin_name'];
    $admin_email = $_POST['admin_email'];
    $admin_pass = $_POST['admin_pass'];
    $admin_confirm = $_POST['admin_confirm'];

    if ($admin_pass !== $admin_confirm) {
        $error = "Les mots de passe ne correspondent pas.";
    } elseif (strlen($admin_pass) < 8) {
        $error = "Le mot de passe doit contenir au moins 8 caractères.";
    } elseif (!filter_var($admin_email, FILTER_VALIDATE_EMAIL)) {
        $error = "L'adresse email n'est pas valide.";
    } else {
        $config = $_SESSION['db_config'];
        try {
            $pdo = new PDO("mysql:host={$config['host']};dbname={$config['name']}", $config['user'], $config['pass']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $hashed_pass = password_hash($admin_pass, PASSWORD_ARGON2I);
            
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role_id, status) VALUES (?, ?, ?, 1, 'actif')");
            $stmt->execute([$admin_name, $admin_email, $hashed_pass]);
            
            $_SESSION['admin_created'] = true;
            header('Location: setup.php?step=5');
            exit;
        } catch (PDOException $e) {
            $error = "Erreur lors de la création du compte : " . $e->getMessage();
        }
    }
}

// Étape 5: Finalisation
if ($step == 5) {
    if (!isset($_SESSION['admin_created'])) {
        header('Location: setup.php?step=4');
        exit;
    }

    $config = $_SESSION['db_config'];
    $config_content = "<?php\n" .
        "return [\n" .
        "    'host' => '{$config['host']}',\n" .
        "    'database' => '{$config['name']}',\n" .
        "    'username' => '{$config['user']}',\n" .
        "    'password' => '{$config['pass']}',\n" .
        "    'charset' => 'utf8mb4',\n" .
        "    'options' => [\n" .
        "        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n" .
        "        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n" .
        "        PDO::ATTR_EMULATE_PREPARES => false,\n" .
        "    ],\n" .
        "];\n";

    if (!is_dir('config')) mkdir('config', 0755, true);
    file_put_contents('config/database.php', $config_content);
    file_put_contents('setup.lock', date('Y-m-d H:i:s'));
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation - Gestion des Courriers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .setup-container { max-width: 700px; margin: 50px auto; }
        .card { border: none; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .card-header { background-color: #4e73df; color: white; border-radius: 15px 15px 0 0 !important; padding: 20px; }
        .step-indicator { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .step { width: 40px; height: 40px; border-radius: 50%; background-color: #e9ecef; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #6c757d; }
        .step.active { background-color: #4e73df; color: white; }
        .step.completed { background-color: #1cc88a; color: white; }
    </style>
</head>
<body>

<div class="container setup-container">
    <div class="card">
        <div class="card-header text-center">
            <h4 class="mb-0">Installation : Gestion des Courriers</h4>
        </div>
        <div class="card-body p-5">
            
            <div class="step-indicator">
                <div class="step <?php echo $step >= 1 ? ($step > 1 ? 'completed' : 'active') : ''; ?>">1</div>
                <div class="step <?php echo $step >= 2 ? ($step > 2 ? 'completed' : 'active') : ''; ?>">2</div>
                <div class="step <?php echo $step >= 3 ? ($step > 3 ? 'completed' : 'active') : ''; ?>">3</div>
                <div class="step <?php echo $step >= 4 ? ($step > 4 ? 'completed' : 'active') : ''; ?>">4</div>
                <div class="step <?php echo $step >= 5 ? ($step > 5 ? 'completed' : 'active') : ''; ?>">5</div>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-danger"><?php echo $error; ?></div>
            <?php endif; ?>

            <?php if ($step == 1): ?>
                <h5>1. Vérification du serveur</h5>
                <p class="text-muted">Nous vérifions si votre serveur possède les prérequis nécessaires.</p>
                
                <ul class="list-group mb-4">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Version PHP (min 8.0)
                        <?php 
                        $php_version = phpversion();
                        $php_ok = version_compare($php_version, '8.0.0', '>=');
                        ?>
                        <span class="badge <?php echo $php_ok ? 'bg-success' : 'bg-danger'; ?> rounded-pill">
                            <?php echo $php_version; ?>
                        </span>
                    </li>
                    <?php 
                    $extensions = ['pdo', 'pdo_mysql', 'openssl', 'json', 'mbstring', 'gd', 'curl', 'zip'];
                    $all_ext_ok = true;
                    foreach ($extensions as $ext): 
                        $ext_ok = extension_loaded($ext);
                        if (!$ext_ok) $all_ext_ok = false;
                    ?>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Extension : <?php echo strtoupper($ext); ?>
                        <span class="badge <?php echo $ext_ok ? 'bg-success' : 'bg-danger'; ?> rounded-pill">
                            <?php echo $ext_ok ? 'OK' : 'Manquante'; ?>
                        </span>
                    </li>
                    <?php endforeach; ?>
                    
                    <?php 
                    $all_folders_ok = true;
                    foreach ($folders as $path => $label): 
                        if (!is_dir($path)) @mkdir($path, 0755, true);
                        $writable = is_writable($path);
                        if (!$writable) $all_folders_ok = false;
                    ?>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Droit d'écriture : <?php echo $label; ?>
                        <span class="badge <?php echo $writable ? 'bg-success' : 'bg-danger'; ?> rounded-pill">
                            <?php echo $writable ? 'OK' : 'Non accessible'; ?>
                        </span>
                    </li>
                    <?php endforeach; ?>
                </ul>

                <?php if ($php_ok && $all_ext_ok && $all_folders_ok): ?>
                    <div class="text-end">
                        <a href="setup.php?step=2" class="btn btn-primary">Continuer</a>
                    </div>
                <?php else: ?>
                    <div class="alert alert-warning">Certains prérequis sont manquants. Veuillez corriger les erreurs pour continuer.</div>
                    <div class="text-end">
                        <a href="setup.php?step=1" class="btn btn-secondary">Réessayer</a>
                    </div>
                <?php endif; ?>

            <?php elseif ($step == 2): ?>
                <h5>2. Configuration de la base de données</h5>
                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label">Hôte de la base de données</label>
                        <input type="text" name="db_host" class="form-control" value="localhost" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nom de la base de données</label>
                        <input type="text" name="db_name" class="form-control" value="gestion_courriers" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Utilisateur</label>
                        <input type="text" name="db_user" class="form-control" value="root" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Mot de passe</label>
                        <input type="password" name="db_pass" class="form-control">
                    </div>
                    <div class="text-end">
                        <button type="submit" class="btn btn-primary">Tester et Créer</button>
                    </div>
                </form>

            <?php elseif ($step == 3): ?>
                <h5>3. Installation de la base de données</h5>
                <?php if ($success): ?>
                    <div class="alert alert-success"><?php echo $success; ?></div>
                    <div class="text-end">
                        <a href="setup.php?step=4" class="btn btn-primary">Suivant</a>
                    </div>
                <?php else: ?>
                    <p>Tentative d'importation du schéma...</p>
                    <div class="text-end">
                        <a href="setup.php?step=3" class="btn btn-secondary">Réessayer</a>
                    </div>
                <?php endif; ?>

            <?php elseif ($step == 4): ?>
                <h5>4. Création du compte administrateur</h5>
                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label">Nom complet</label>
                        <input type="text" name="admin_name" class="form-control" placeholder="ex: Jean Dupont" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" name="admin_email" class="form-control" placeholder="admin@exemple.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Mot de passe</label>
                        <input type="password" name="admin_pass" class="form-control" required>
                        <div class="form-text">Minimum 8 caractères.</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Confirmer le mot de passe</label>
                        <input type="password" name="admin_confirm" class="form-control" required>
                    </div>
                    <div class="text-end">
                        <button type="submit" class="btn btn-primary">Créer le compte</button>
                    </div>
                </form>

            <?php elseif ($step == 5): ?>
                <div class="text-center">
                    <div class="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#1cc88a" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                    </div>
                    <h5>Installation terminée avec succès !</h5>
                    <p class="text-muted">L'application est maintenant configurée et prête à l'emploi.</p>
                    <div class="alert alert-warning text-start">
                        <strong>Sécurité :</strong> Le fichier <code>setup.php</code> a été désactivé via un fichier verrou. Pour une sécurité maximale, veuillez le supprimer manuellement de votre serveur.
                    </div>
                    <div class="mt-4">
                        <a href="login" class="btn btn-success btn-lg px-5">Accéder à l'application</a>
                    </div>
                </div>
            <?php endif; ?>

        </div>
    </div>
    <div class="text-center mt-4 text-muted" style="font-size: 0.8rem;">
        &copy; <?php echo date('Y'); ?> Gestion des Courriers Administratifs - Système d'installation
    </div>
</div>

</body>
</html>
