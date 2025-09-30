const { Client } = require('pg');
(async()=>{
  const c=new Client({host:process.env.DB_HOST||'localhost',port:+(process.env.DB_PORT||5432),user:process.env.DB_USER||'postgres',password:process.env.DB_PASS||'0880',database:process.env.DB_NAME||'airways'});
  await c.connect();
  const res=await c.query("select column_name,data_type from information_schema.columns where table_name='bookings' order by ordinal_position");
  console.log(res.rows);
  await c.end();
})();

