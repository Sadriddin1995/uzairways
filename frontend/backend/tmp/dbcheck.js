const { Client } = require('pg');
(async () => {
  const c = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '0880',
    database: process.env.DB_NAME || 'airways',
  });
  await c.connect();
  try {
    const r = await c.query("select to_regclass('public.tickets') as t");
    console.log('tickets table:', r.rows[0].t);
  } catch (e) { console.error('error', e.message); }
  try {
    const r = await c.query("select to_regclass('public.booking_passengers') as t");
    console.log('booking_passengers table:', r.rows[0].t);
  } catch (e) { console.error('error', e.message); }
  await c.end();
})();

