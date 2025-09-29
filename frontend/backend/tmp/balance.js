const { Client } = require('pg');
(async()=>{
  const c=new Client({host:process.env.DB_HOST||'localhost',port:+(process.env.DB_PORT||5432),user:process.env.DB_USER||'postgres',password:process.env.DB_PASS||'0880',database:process.env.DB_NAME||'airways'});
  await c.connect();
  const r=await c.query('select id, balance from users where id=3');
  console.log(r.rows[0]);
  await c.end();
})();

