#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || '.env.preview';
const full = path.resolve(process.cwd(), file);

if (!fs.existsSync(full)) {
  console.error(`Env file not found: ${full}`);
  process.exit(1);
}

const content = fs.readFileSync(full, 'utf8');
function getVar(name) {
  const re = new RegExp(`^${name}=([^\n\r]+)`, 'm');
  const m = content.match(re);
  return m ? m[1].trim() : '';
}

const required = [
  'SHOPIFY_STORE_DOMAIN',
  'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
];

const missing = required.filter((v) => !getVar(v));

if (missing.length) {
  console.error(`Missing required env vars in ${file}: ${missing.join(', ')}`);
  process.exit(2);
}

console.log('Vercel preview envs OK:', required.join(', '));
