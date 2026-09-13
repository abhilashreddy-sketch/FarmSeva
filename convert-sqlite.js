const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(/status\s+PaymentStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');
schema = schema.replace(/status\s+DeliveryStatus\s+@default\(UNASSIGNED\)/g, 'status String @default("UNASSIGNED")');
schema = schema.replace(/@default\(PENDING_ACCEPTANCE\)/g, '@default("PENDING_ACCEPTANCE")');
schema = schema.replace(/:\s*PaymentStatus/g, ': String');
schema = schema.replace(/status\s+PaymentStatus/g, 'status String');
schema = schema.replace(/:\s*DeliveryStatus/g, ': String');
schema = schema.replace(/status\s+DeliveryStatus/g, 'status String');

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema cleanup done.');
