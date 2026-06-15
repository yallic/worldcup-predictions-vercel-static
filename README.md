# World Cup Predictions

Arkadas grubuyla Dunya Kupasi mac tahmini oyunu.

## Puanlama

- Tam skor: 5 puan
- Kazanan / beraberlik dogru: 3 puan
- Averaj dogru bonusu: +1 puan
- Ev sahibi golu dogru bonusu: +1 puan
- Deplasman golu dogru bonusu: +1 puan

Tam skor bilen kisi zaten gol ve averaj bonuslarini da alir; bu nedenle tam skor toplamda 8 puana kadar cikabilir. Sadece mac sonucunu bilen kisi 3 puan alir.

## Kurulum

1. Supabase'de proje olustur.
2. `database.sql` dosyasini Supabase SQL Editor'de calistir.
3. Bu klasoru GitHub'a koy ve Vercel'de import et.
4. Vercel Environment Variables alanina sunlari ekle:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
INVITE_CODE=arkadaslara-verecegin-kod
ADMIN_PASSWORD=mac-ekleme-sonuc-girme-sifresi
API_FOOTBALL_KEY=api-football-key
API_FOOTBALL_LEAGUE=1
API_FOOTBALL_SEASON=2026
```

5. Deploy et.

## Kullanım

- Arkadaslar sadece isimle girer. Ilk kayitta davet kodu istenebilir.
- Mac kilitlenme saatinden sonra tahmin degistirilemez.
- Tahminler herkese gorunur.
- Admin sifresiyle mac eklenir, mac sonucu girilir veya API-Football'dan fikstur/skor senkronu yapilir.
