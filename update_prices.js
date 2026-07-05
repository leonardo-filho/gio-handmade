const fs = require('fs');
const file = 'src/data/produtos.ts';
let content = fs.readFileSync(file, 'utf8');

const updates = {
  'Acessório Maris': { preco: 320, parcelas: '3x de R$ 125 sem juros' },
  'Acessório Marea': { preco: 380, parcelas: '3x de R$ 140 sem juros' },
  'Top Ônix': { preco: 550, parcelas: '3x de R$ 190 sem juros' },
  'Top Golden': { preco: 450, parcelas: '3x de R$ 165 sem juros' },
  'Regata Nyx': { preco: 700, parcelas: '4x de R$ 190 sem juros' },
  'Top Mirror': { preco: 400, parcelas: '3x de R$ 150 sem juros' },
  'Top Imperatriz': { preco: 450, parcelas: '3x de R$ 165 sem juros' },
  'Top Layla': { preco: 430, parcelas: '3x de R$ 155 sem juros' },
  'Top Júlia': { preco: 550, parcelas: '3x de R$ 200 sem juros' },
  'Top Bruna': { preco: 450, parcelas: '3x de R$ 165 sem juros' },
  'Top Beatriz': { preco: 370, parcelas: '3x de R$ 135 sem juros' },
  'Top Nanda': { preco: 300, parcelas: '3x de R$ 105 sem juros' },
  'Top Musa': { preco: 600, parcelas: '4x de R$ 160 sem juros' },
  'Top Ananda': { preco: 300, parcelas: '3x de R$ 105 sem juros' },
  'Top Chains': { preco: 450, parcelas: '3x de R$ 170 sem juros' },
  'Top Shirlene': { preco: 270, parcelas: '3x de R$ 100 sem juros' },
  'Top Medusa': { preco: 700, parcelas: '4x de R$ 190 sem juros' },
  'Top Giô': { preco: 550, parcelas: '4x de R$ 150 sem juros' },
  'Top Ana': { preco: 650, parcelas: '4x de R$ 175 sem juros' },
  'Top Kesha': { preco: 650, parcelas: '4x de R$ 175 sem juros' },
  'Top Giurds': { preco: 370, parcelas: '3x de R$ 135 sem juros' },
  'Top Lourdes': { preco: 900, parcelas: '5x de R$ 190 sem juros' },
  'Top Duda': { preco: 550, parcelas: '4x de R$ 150 sem juros' },
  'Top Crystal': { preco: 600, parcelas: '4x de R$ 160 sem juros' },
  'Conjunto Duda': { preco: 1000, parcelas: '5x de R$ 220 sem juros' },
  'Conjunto Giô': { preco: 1150, parcelas: '5x de R$ 250 sem juros' },
  'Conjunto Crystal': { preco: 1100, parcelas: '5x de R$ 240 sem juros' },
  'Conjunto Moonlight': { preco: 1300, parcelas: '6x de R$ 230 sem juros' },
  'Vestido Luna': { preco: 1300, parcelas: '6x de R$ 230 sem juros' },
  'Saia Brisa': { preco: 650, parcelas: '4x de R$ 175 sem juros' },
  'Saia Crystal': { preco: 600, parcelas: '4x de R$ 160 sem juros' },
  'Saia Duda': { preco: 600, parcelas: '4x de R$ 160 sem juros' },
  'Saia Giô': { preco: 600, parcelas: '4x de R$ 160 sem juros' },
  'Conjunto Selene': { preco: 1000, parcelas: '5x de R$ 220 sem juros' },
  'Saia Sarah': { preco: 580, parcelas: '4x de R$ 155 sem juros' },
  'Vestido Prisma': { preco: 1100, parcelas: '6x de R$ 200 sem juros' },
  'Headpiece Crystal': { preco: 170, parcelas: '3x de R$ 70 sem juros' },
  'Headpiece Luna': { preco: 200, parcelas: '3x de R$ 75 sem juros' },
  'Headpiece Moonlight': { preco: 170, parcelas: '3x de R$ 70 sem juros' },
  'Top Perla': { preco: 700, parcelas: '4x de R$ 185 sem juros' },
  'Headpiece Perla': { preco: 100, parcelas: '2x de R$ 63 sem juros' },
  'Top Lumina': { preco: 470, parcelas: '4x de R$ 130 sem juros' },
  'Headpiece Lumina': { preco: 200, parcelas: '3x de R$ 75 sem juros' },
  'Top Aurora': { preco: 600, parcelas: '4x de R$ 160 sem juros' },
  'Top Solaris': { preco: 650, parcelas: '5x de R$ 140 sem juros' },
  'Top Noir': { preco: 230, parcelas: '3x de R$ 88 sem juros' }
};

for (const [nome, { preco, parcelas }] of Object.entries(updates)) {
  // Substituir o parcelas se existir
  let rxHasParcelas = new RegExp(`(nome:\\s*['"]${nome}['"],[\\s\\S]*?preco:\\s*\\d+,)(\\s*parcelas:\\s*['"].*?['"],)?`, 'i');
  content = content.replace(rxHasParcelas, `$1\n    parcelas: "${parcelas}",`);
  
  // Atualizar o preco
  let rxPreco = new RegExp(`(nome:\\s*['"]${nome}['"],[\\s\\S]*?preco:\\s*)\\d+,`, 'i');
  content = content.replace(rxPreco, `$1${preco},`);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Done");
