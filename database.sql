-- Script SQL pour la Gestion des Courriers Administratifs
-- Base de données: gestion_courriers

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Création de la base de données
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `gestion_courriers` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gestion_courriers`;

-- --------------------------------------------------------
-- Table `roles`
-- --------------------------------------------------------
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `roles` (`id`, `name`, `slug`) VALUES
(1, 'Administrateur', 'admin'),
(2, 'Chef de Service', 'chef_service'),
(3, 'Agent', 'agent'),
(4, 'Consultation', 'viewer');

-- --------------------------------------------------------
-- Table `departments`
-- --------------------------------------------------------
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `departments` (`id`, `name`) VALUES
(1, 'Direction Générale'),
(2, 'Ressources Humaines'),
(3, 'Finances'),
(4, 'Informatique'),
(5, 'Secrétariat');

-- --------------------------------------------------------
-- Table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `status` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertion de l'administrateur par défaut
-- Mot de passe: admin123 (haché avec PASSWORD_DEFAULT)
INSERT INTO `users` (`name`, `email`, `password`, `role_id`, `department_id`) VALUES
('Admin Système', 'admin@admin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1);

-- --------------------------------------------------------
-- Table `courrier_entrant`
-- --------------------------------------------------------
CREATE TABLE `courrier_entrant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `objet` text NOT NULL,
  `expediteur` varchar(255) NOT NULL,
  `date_reception` date NOT NULL,
  `priority` enum('basse','normale','haute','urgente') DEFAULT 'normale',
  `status` enum('nouveau','en_traitement','valide','archive') DEFAULT 'nouveau',
  `ocr_text` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `courrier_sortant`
-- --------------------------------------------------------
CREATE TABLE `courrier_sortant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `objet` text NOT NULL,
  `destinataire` varchar(255) NOT NULL,
  `date_envoi` date NOT NULL,
  `priority` enum('basse','normale','haute','urgente') DEFAULT 'normale',
  `status` enum('nouveau','en_traitement','valide','archive') DEFAULT 'nouveau',
  `ocr_text` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `documents`
-- --------------------------------------------------------
CREATE TABLE `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courrier_id` int(11) NOT NULL,
  `courrier_type` enum('entrant','sortant') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `archives`
-- --------------------------------------------------------
CREATE TABLE `archives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courrier_id` int(11) NOT NULL,
  `courrier_type` enum('entrant','sortant') NOT NULL,
  `archive_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `workflow_definitions`
-- --------------------------------------------------------
CREATE TABLE `workflow_definitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `workflow_steps`
-- --------------------------------------------------------
CREATE TABLE `workflow_steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workflow_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `order_index` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`),
  CONSTRAINT `workflow_steps_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflow_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `workflow_instances`
-- --------------------------------------------------------
CREATE TABLE `workflow_instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workflow_id` int(11) NOT NULL,
  `courrier_id` int(11) NOT NULL,
  `courrier_type` enum('entrant','sortant') NOT NULL,
  `current_step_id` int(11) DEFAULT NULL,
  `status` enum('en_cours','termine','rejete') DEFAULT 'en_cours',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`),
  CONSTRAINT `workflow_instances_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflow_definitions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `workflow_actions`
-- --------------------------------------------------------
CREATE TABLE `workflow_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instance_id` int(11) NOT NULL,
  `step_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` enum('valider','rejeter') NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `workflow_actions_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `workflow_instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table `logs`
-- --------------------------------------------------------
CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
