import AppDataSource from './data-source';

async function runSeed() {
  console.log('Inicializando conexão com o banco...');
  await AppDataSource.initialize();

  try {
    console.log('Inserindo dados iniciais (idempotente)...');

    const species = [
      {
        name: 'Monstera deliciosa',
        commonName: 'Costela de Adão',
        description: 'Planta tropical com folhas grandes e recortadas.',
        careInstructions: 'Luz indireta, rega moderada.',
        idealConditions: 'Sol parcial, umidade média.',
        photo: 'https://example.com/monstera.jpg',
      },
      {
        name: 'Ficus lyrata',
        commonName: 'Figueira-lira',
        description: 'Planta com folhas grandes em forma de lira.',
        careInstructions: 'Luz brilhante, rega quando o solo estiver seco.',
        idealConditions: 'Sol pleno, umidade alta.',
        photo: 'https://example.com/ficus-lyrata.jpg',
      },
      {
        name: 'Sansevieria trifasciata',
        commonName: 'Espada-de-são-jorge',
        description: 'Planta resistente com folhas eretas e pontiagudas.',
        careInstructions: 'Luz indireta, pouca rega.',
        idealConditions: 'Sol ou sombra, tolerante à seca.',
        photo: 'https://example.com/sansevieria.jpg',
      },
      {
        name: 'Epipremnum aureum',
        commonName: 'Jiboia',
        description: 'Planta trepadeira de fácil cultivo e crescimento rápido.',
        careInstructions: 'Luz indireta, rega moderada.',
        idealConditions: 'Meia-sombra, solo bem drenado.',
        photo: 'https://example.com/jiboia.jpg',
      },
      {
        name: 'Zamioculcas zamiifolia',
        commonName: 'Zamioculca',
        description: 'Planta muito resistente com folhas brilhantes e carnudas.',
        careInstructions: 'Luz indireta, pouca rega.',
        idealConditions: 'Sombra a meia-sombra, solo seco.',
        photo: 'https://example.com/zamioculca.jpg',
      },
    ];

    const locations = [
      {
        name: 'Sala de Estar',
        type: 'INDOOR',
        sunlight: 'PARTIAL',
        humidity: 'MEDIUM',
        description: 'Ambiente interno com luz indireta',
        photo: 'https://example.com/sala-estar.jpg',
      },
      {
        name: 'Jardim',
        type: 'GARDEN',
        sunlight: 'FULL',
        humidity: 'HIGH',
        description: 'Área externa com sol direto',
        photo: 'https://example.com/jardim.jpg',
      },
      {
        name: 'Varanda',
        type: 'BALCONY',
        sunlight: 'PARTIAL',
        humidity: 'MEDIUM',
        description: 'Varanda com luz solar da manhã',
        photo: 'https://example.com/varanda.jpg',
      },
      {
        name: 'Terraço',
        type: 'TERRACE',
        sunlight: 'FULL',
        humidity: 'LOW',
        description: 'Terraço exposto ao sol',
        photo: 'https://example.com/terrace.jpg',
      },
      {
        name: 'Quintal',
        type: 'OUTDOOR',
        sunlight: 'SHADE',
        humidity: 'HIGH',
        description: 'Área sombreada do quintal',
        photo: 'https://example.com/quintal.jpg',
      },
    ];

    // Inserir espécies idempotentemente
    for (const sp of species) {
      const exists = await AppDataSource.query(`SELECT id FROM species WHERE name = $1`, [sp.name]);
      if (!exists || exists.length === 0) {
        await AppDataSource.query(
          `INSERT INTO species (name, "commonName", description, "careInstructions", "idealConditions", photo, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
          [sp.name, sp.commonName, sp.description, sp.careInstructions, sp.idealConditions, sp.photo],
        );
        console.log(`Inserida espécie: ${sp.name}`);
      } else {
        console.log(`Espécie já existe: ${sp.name}`);
      }
    }

    // detectar nome da tabela locations/location
    const locTableCheck = await AppDataSource.query(`SELECT to_regclass('public.locations') as t`);
    const locationTable = locTableCheck && locTableCheck[0] && locTableCheck[0].t ? 'locations' : 'location';

    for (const loc of locations) {
      const exists = await AppDataSource.query(`SELECT id FROM ${locationTable} WHERE name = $1`, [loc.name]);
      if (!exists || exists.length === 0) {
        await AppDataSource.query(
          `INSERT INTO ${locationTable} (name, type, sunlight, humidity, description, photo, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
          [loc.name, loc.type, loc.sunlight, loc.humidity, loc.description, loc.photo],
        );
        console.log(`Inserido local: ${loc.name}`);
      } else {
        console.log(`Local já existe: ${loc.name}`);
      }
    }

    console.log('Seed concluído.');
  } catch (err) {
    console.error('Erro ao executar seed:', err);
    process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
    console.log('Conexão encerrada.');
  }
}

runSeed().catch((err) => {
  console.error('Seed falhou:', err);
  process.exit(1);
});
