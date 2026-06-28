CREATE DATABASE barbearia_db;
USE barbearia_db;

CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    pagamento VARCHAR(50) NOT NULL,
    barbeiro VARCHAR(100) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assinantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    plano VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);