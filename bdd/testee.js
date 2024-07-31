// Importer dotenv et chargez les variables d'environnement depuis le fichier .env
require('dotenv').config();

const { Pool } = require('pg');

// Utiliser le module 'set' pour obtenir la valeur de DATABASE_URL depuis les configurations
const s = require('../set');

// Remplacer l'URL de la base de données par la nouvelle URL fournie
var dbUrl = s.SPDB;
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Créer une pool de connexions PostgreSQL
const pool = new Pool(proConfig);

// Fonction générique pour créer une table pour un joueur
const creerTablePlayer = async (playerTable) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${playerTable} (
        id serial PRIMARY KEY,
        message text,
        lien text
      );
    `);
    console.log(`La table '${playerTable}' a été créée avec succès.`);
  } catch (e) {
    console.error(`Une erreur est survenue lors de la création de la table '${playerTable}':`, e);
  }
};

// Fonction générique pour ajouter ou mettre à jour un enregistrement dans une table de joueur
async function addOrUpdateDataInTestee(playerTable, message, lien) {
  const client = await pool.connect();
  try {
    // Insérer ou mettre à jour les données dans la table du joueur
    const query = `
      INSERT INTO ${playerTable} (id, message, lien)
      VALUES (1, $1, $2)
      ON CONFLICT (id)
      DO UPDATE SET message = excluded.message, lien = excluded.lien;
    `;
    const values = [message, lien];

    await client.query(query, values);
    console.log(`Données ajoutées ou mises à jour dans la table '${playerTable}' avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de l'ajout ou de la mise à jour des données dans la table '${playerTable}':`, error);
  } finally {
    client.release();
  }
}

// fonction générique pour récupérer les données d'une table de joueur
async function getDataFromTestee(playerTable) {
  const client = await pool.connect();
  try {
    // exécuter la requête SELECT pour récupérer les données
    const query = `SELECT message, lien FROM ${playerTable} WHERE id = 1;`;
    const result = await client.query(query);

    if (result.rows.length > 0) {
      const { message, lien } = result.rows[0];
      return { message, lien };
    } else {
      console.log(`Aucune donnée trouvée dans la table '${playerTable}'.`);
      return null;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données depuis la table '${playerTable}':`, error);
    return null;
  } finally {
    client.release();
  }
}

// Exporter les fonctions pour les utiliser dans d'autres fichiers
module.exports = {
  creerTablePlayer,
  addOrUpdateDataInTestee,
  getDataFromTestee,
};
