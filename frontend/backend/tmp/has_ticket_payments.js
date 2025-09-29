const { Client } = require('pg');
(async()=>{
  const c=new Client({host:process.env.DB_HOST||'localhost',port:+(process.env.DB_PORT||5432),user:process.env.DB_USER||'postgres',password:process.env.DB_PASS||'0880',database:process.env.DB_NAME||'airways'});
  await c.connect();
  const res=await c.query("select to_regclass('public.ticket_payments') as t");
  console.log('ticket_payments table:', res.rows[0].t);
  await c.end();
})();

