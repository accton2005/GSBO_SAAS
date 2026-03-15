-- Database creation
CREATE DATABASE IF NOT EXISTS courrier_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE courrier_db;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo TEXT,
    domain VARCHAR(100) NOT NULL,
    subscriptionPlanId VARCHAR(50),
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    settings JSON
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    organizationId VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    organizationId VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    displayName VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    photoURL TEXT,
    role ENUM('admin', 'agent', 'viewer', 'superadmin', 'secretariat', 'chef_service', 'direction') NOT NULL,
    password VARCHAR(255),
    serviceId VARCHAR(50),
    lastLogin DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE SET NULL
);

-- Courriers table
CREATE TABLE IF NOT EXISTS courriers (
    id VARCHAR(50) PRIMARY KEY,
    organizationId VARCHAR(50) NOT NULL,
    type ENUM('entrant', 'sortant') NOT NULL,
    reference VARCHAR(50) NOT NULL,
    objet TEXT NOT NULL,
    expediteur VARCHAR(255),
    destinataire VARCHAR(255),
    dateReception DATE,
    status ENUM('nouveau', 'en_cours', 'traite', 'archive', 'en_workflow') DEFAULT 'nouveau',
    priority ENUM('basse', 'normale', 'haute', 'urgente') DEFAULT 'normale',
    documentUrl TEXT,
    ocrText LONGTEXT,
    qrCodeData TEXT,
    barcodeData TEXT,
    serviceId VARCHAR(50),
    assignedTo VARCHAR(50),
    workflowInstanceId VARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizationId VARCHAR(50),
    userId VARCHAR(50),
    action VARCHAR(100),
    details TEXT,
    resourceId VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);
