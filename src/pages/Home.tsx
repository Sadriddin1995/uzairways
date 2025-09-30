import Search from './Search'
import NewsList from '../components/NewsList'

export default function Home() {
  return (
    <div>
      <section className="hero sky">
        <div className="container">
          <h1 className="hero-title">Qulay va tez — reyslarni bir joyda qidiring</h1>
          <p className="hero-sub">UzAirways orqali aeroportlar, parvozlar va tariflarni osongina solishtiring. Quydagi formadan foydalanib chipta qidiring.</p>
        </div>
      </section>

      <div className="container">
        <div className="search-wrap">
          <div className="search-panel">
            <div className="search-tabs single"><button className="active">Chipta olish</button></div>
            <div className="search-content">
              <Search />
            </div>
          </div>
        </div>
        <div className="section" style={{marginTop:24}}>
          <NewsList />
        </div>
      </div>
    </div>
  )
}
