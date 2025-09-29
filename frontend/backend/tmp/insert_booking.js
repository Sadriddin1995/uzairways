const { Client } = require('pg');
(async ()=>{
  const c=new Client({host:process.env.DB_HOST||'localhost',port:+(process.env.DB_PORT||5432),user:process.env.DB_USER||'postgres',password:process.env.DB_PASS||'0880',database:process.env.DB_NAME||'airways'});
  await c.connect();
  try {
    await c.query('BEGIN');
    const b = await c.query('insert into bookings("userId","flightId","returnFlightId","classId","status","pnr","totalPrice","createdAt","updatedAt") values ($1,$2,$3,$4,$5,$6,$7, now(), now()) returning id',
      [3,1,null,2,'CONFIRMED','PNR123','80.00']
    );
    const bid=b.rows[0].id;
    await c.query('insert into booking_passengers("bookingId","firstName","lastName","documentNumber","createdAt","updatedAt") values ($1,$2,$3,$4, now(), now())',
      [bid,'Ali','Valiyev','AA1234567']
    );
    await c.query('COMMIT');
    console.log('OK booking', bid);
  } catch (e) {
    console.error('ERR', e.message);
    try{ await c.query('ROLLBACK'); } catch {}
  } finally { await c.end(); }
})();

