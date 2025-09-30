const { Client } = require('pg');
(async ()=>{
  const c=new Client({host:process.env.DB_HOST||'localhost',port:+(process.env.DB_PORT||5432),user:process.env.DB_USER||'postgres',password:process.env.DB_PASS||'0880',database:process.env.DB_NAME||'airways'});
  await c.connect();
  try {
    const userId=3, flightId=1, classId=2, passengers=[{firstName:'Ali',lastName:'Valiyev',documentNumber:'AA1234567'}];
    const f = await c.query('select * from flights where id=$1 and status=\'SCHEDULED\'', [flightId]);
    const cabin = await c.query('select * from classes where id=$1', [classId]);
    const user = await c.query('select * from users where id=$1', [userId]);
    const mult = Number(cabin.rows[0].priceMultiplier||1);
    const price = Number(f.rows[0].basePrice)*mult*passengers.length;
    if (Number(user.rows[0].balance||0) < price) throw new Error('Insufficient balance');
    await c.query('BEGIN');
    const b = await c.query('insert into bookings("userId","flightId","returnFlightId","classId","status","pnr","totalPrice","createdAt","updatedAt") values ($1,$2,$3,$4,$5,$6,$7, now(), now()) returning id',
      [userId,flightId,null,classId,'CONFIRMED','PNR123',price.toFixed(2)]);
    const bid=b.rows[0].id;
    await c.query('insert into booking_passengers("bookingId","firstName","lastName","documentNumber","createdAt","updatedAt") values ($1,$2,$3,$4, now(), now())',
      [bid,passengers[0].firstName,passengers[0].lastName,passengers[0].documentNumber]);
    await c.query('update users set balance=($1) where id=$2', [ (Number(user.rows[0].balance||0)-price).toFixed(2), userId ]);
    const t = await c.query('insert into ticket_payments("userId","bookingId","amount","status","createdAt","updatedAt") values ($1,$2,$3,$4, now(), now()) returning id',
      [userId,bid,price.toFixed(2),'PAID']);
    await c.query('COMMIT');
    console.log('OK ticketPayment', t.rows[0].id);
  } catch (e) {
    console.error('ERR', e.message);
    try{ await c.query('ROLLBACK'); } catch {}
  } finally { await c.end(); }
})();

