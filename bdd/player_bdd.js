const { Pool } = require("pg");
const s = require("../set");

// Configuration de la base de données
const dbUrl = s.SPDB;
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(proConfig);

// Création des tables si elles n'existent pas encore
async function createTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS player_profiles(
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        statut TEXT DEFAULT 'Novice',
        mode TEXT DEFAULT 'Free',
        rang_abm TEXT DEFAULT 'aucun',
        rang_speed_rush TEXT DEFAULT 'aucun',
        rang_yugioh TEXT DEFAULT 'aucun',
        champion TEXT DEFAULT 'aucun',
        specialite TEXT DEFAULT 'aucune',
        leader TEXT DEFAULT 'aucun',
        defis_remportes INTEGER DEFAULT 0,
        legende TEXT DEFAULT 'aucune',
        victoires INTEGER DEFAULT 0,
        defaites INTEGER DEFAULT 0,
        forfaits INTEGER DEFAULT 0,
        top3 INTEGER DEFAULT 0,
        missions_reussies INTEGER DEFAULT 0,
        missions_echouees INTEGER DEFAULT 0,
        amb_cards TEXT DEFAULT 'aucun',
        vehicles TEXT DEFAULT 'aucun',
        yugioh_deck TEXT DEFAULT 'aucun',
        skins TEXT DEFAULT 'aucun',
        items TEXT DEFAULT 'aucun',
        s_tokens INTEGER DEFAULT 0,
        s_gemmes INTEGER DEFAULT 0,
        coupons INTEGER DEFAULT 0,
        box_vip INTEGER DEFAULT 0,
        depenses INTEGER DEFAULT 0,
        profits INTEGER DEFAULT 0,
        retraits INTEGER DEFAULT 0,
        solde INTEGER DEFAULT 0
      );
    `);
    console.log('Table créée ou déjà existante');
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
  } finally {
    client.release();
  }
}

// Insère un profil de joueur s'il n'existe pas déjà
async function insertPlayerProfile(name) {
  const client = await pool.connect();
  try {
    const queryExistence = `
      SELECT 1 FROM player_profiles WHERE name = $1;
    `;
    const resultExistence = await client.query(queryExistence, [name]);

    if (resultExistence.rows.length > 0) {
      console.log(`Le profil du joueur ${name} existe déjà.`);
      return;
    }

    const queryInsert = `
      INSERT INTO player_profiles(name)
      VALUES ($1);
    `;
    await client.query(queryInsert, [name]);

    console.log(`Profil du joueur créé avec succès : Nom ${name}`);
  } catch (error) {
    console.error('Erreur lors de la création du profil du joueur:', error);
  } finally {
    client.release();
  }
}

// Récupère les données du joueur
async function getPlayerProfile(name) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM player_profiles WHERE name = $1;
    `;
    const result = await client.query(query, [name]);

    if (result.rows.length === 0) {
      console.log(`Joueur non trouvé : ${name}`);
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la récupération du profil du joueur:', error);
  } finally {
    client.release();
  }
}

// Met à jour le profil du joueur
async function updatePlayerProfile(name, updates) {
  const client = await pool.connect();
  try {
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const field in updates) {
      setClauses.push(`${field} = $${index}`);
      values.push(updates[field]);
      index++;
    }

    if (setClauses.length === 0) {
      console.log("Aucune mise à jour fournie");
      return;
    }

    const query = `
      UPDATE player_profiles
      SET ${setClauses.join(', ')}
      WHERE name = $${index}
      RETURNING *;
    `;
    values.push(name);

    const result = await client.query(query, values);
    if (result.rowCount === 0) {
      console.log(`Joueur non trouvé pour mise à jour : ${name}`);
      return null;
    }

    console.log(`Profil du joueur ${name} mis à jour avec succès`);
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil du joueur:', error);
  } finally {
    client.release();
  }
}

// Crée les tables à l'initialisation
createTables();

module.exports = {
  insertPlayerProfile,
  getPlayerProfile,
  updatePlayerProfile
};
