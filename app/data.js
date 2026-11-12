// All app content lives here. Edit this file to update the guide. 🔎 = verify before relying on it.
const DATA = {
  appName: "Bangkok Sidekick",
  tagline: "Your travel buddy in the Big Mango",
  version: "16",
  hotel: {
    name: "Avani Ratchada Bangkok Hotel (opposite G Tower, Rama 9)",
    thaiName: "โรงแรมอวานี รัชดา กรุงเทพ ตรงข้ามจีทาวเวอร์ พระราม 9",
    address: "1 Ratchadaphisek Road, Din Daeng, Bangkok 10400 (1 ถนนรัชดาภิเษก ดินแดง กรุงเทพฯ 10400)",
    phone: "02 641 1500"
  },

  places: [
    // cat: near | nearby | downtown
    { n: "G Tower", cat: "near", d: "Office tower opposite your hotel; cafés and quick lunches on lower floors.", t: "Across the street", q: "G Tower Rama 9 Bangkok" },
    { n: "Central Rama 9", cat: "near", d: "Big mall: food hall, supermarket, pharmacy, cinema. Rainy-day base.", t: "Short walk (across the road per reviews)", q: "Central Rama 9" },
    { n: "Jodd Fairs Rama 9", cat: "near", d: "Evening night market: street food, grilled seafood, drinks, live music.", t: "Short walk/ride 🔎 check opening nights", q: "Jodd Fairs Rama 9" },
    { n: "Rama 9 Square / Grand Rama 9", cat: "near", d: "Office and restaurant cluster, convenience stores.", t: "Walking distance", q: "Rama 9 Square Bangkok" },
    { n: "Thailand Cultural Centre", cat: "nearby", d: "Concerts, exhibitions, Thai performances.", t: "MRT BL19, 1 stop", q: "Thailand Cultural Centre Bangkok" },
    { n: "Ratchada Train Night Market", cat: "nearby", d: "Retro market, street food, bars. Mostly Thu–Sun evenings 🔎", t: "MRT BL19", q: "Ratchada Train Night Market" },
    { n: "Esplanade Ratchada", cat: "nearby", d: "Mall with restaurants and cinema.", t: "MRT BL19", q: "Esplanade Ratchada" },
    { n: "Fortune Town", cat: "nearby", d: "IT and electronics mall (phones, laptops, gadgets).", t: "MRT Sutthisan BL17 🔎", q: "Fortune Town Bangkok" },
    { n: "Terminal 21 Asok", cat: "nearby", d: "Travel-themed mall with cheap food court.", t: "MRT Sukhumvit BL22 · BTS Asok", q: "Terminal 21 Asok" },
    { n: "Benchakitti Park", cat: "nearby", d: "Big lakeside park, lovely at sunset, cycling.", t: "MRT QSNCC BL23 🔎", q: "Benchakitti Park" },
    { n: "Grand Palace", cat: "downtown", d: "Top sight. Cover shoulders and knees. Go early. Ignore strangers saying it's closed (common scam).", t: "MRT Sanam Chai BL31 + walk/taxi 🔎", q: "Grand Palace Bangkok" },
    { n: "Wat Pho", cat: "downtown", d: "Reclining Buddha and the home of Thai massage.", t: "MRT Sanam Chai BL31, walk", q: "Wat Pho" },
    { n: "Wat Arun", cat: "downtown", d: "Riverside temple, beautiful at sunset. Cross by ferry from Tha Tien.", t: "Ferry from Wat Pho area", q: "Wat Arun" },
    { n: "Chinatown (Yaowarat)", cat: "downtown", d: "Evening street food heaven: seafood, roast duck, dessert.", t: "MRT Wat Mangkon BL29", q: "Yaowarat Road Bangkok" },
    { n: "Siam area (Paragon, MBK, Center One)", cat: "downtown", d: "Shopping and A/C malls.", t: "BTS Siam", q: "Siam Paragon" },
    { n: "Jim Thompson House", cat: "downtown", d: "Thai silk, teak house museum.", t: "BTS National Stadium", q: "Jim Thompson House" },
    { n: "Lumphini Park", cat: "downtown", d: "Green space, monitor lizards, running.", t: "MRT Lumphini BL25 or Silom BL26", q: "Lumphini Park" },
    { n: "ICONSIAM", cat: "downtown", d: "Riverside mall with a floating market floor.", t: "BTS Saphan Taksin + free shuttle boat", q: "ICONSIAM" },
    { n: "Chatuchak Weekend Market", cat: "downtown", d: "Huge market, Sat–Sun mainly.", t: "MRT Kamphaeng Phet / Chatuchak Park", q: "Chatuchak Weekend Market" },
    { n: "Asiatique The Riverfront", cat: "downtown", d: "Evening riverside shopping and dining.", t: "BTS Saphan Taksin + boat", q: "Asiatique The Riverfront" }
  ],

  food: [
    // cat: mall | street | night | classic | downtown
    { n: "Central Rama 9 food court / food hall", cat: "mall", d: "Thai dishes, noodles, rice plates, desserts. Buy a food-court card at the counter and refund the balance before leaving.", p: "฿", q: "Central Rama 9 food court" },
    { n: "Central Rama 9 restaurant floors", cat: "mall", d: "Japanese (sushi, ramen, tonkatsu), Korean BBQ, hot pot, Thai chains.", p: "฿฿", q: "Central Rama 9 restaurants" },
    { n: "G Tower lower floors", cat: "street", d: "Office-worker lunches. Avoid 12:00–13:00 queues 🔎", p: "฿", q: "G Tower Rama 9 restaurants" },
    { n: "Sois around Rama 9", cat: "street", d: "Small Thai shops and stalls: noodle soup, grilled pork (moo ping), papaya salad, rice with curry.", p: "฿", q: "restaurants near Rama 9 MRT" },
    { n: "7-Eleven / FamilyMart", cat: "street", d: "24h water, toasties, onigiri, snacks. Staff will heat food for you.", p: "฿", q: "7-Eleven near Rama 9" },
    { n: "Jodd Fairs Rama 9", cat: "night", d: "Grilled seafood, spicy salads, mala skewers, drinks, music. Busy on weekends.", p: "฿฿", q: "Jodd Fairs Rama 9" },
    { n: "Ratchada Train Night Market", cat: "night", d: "Retro market, street food and bars.", p: "฿฿", q: "Ratchada Train Night Market" },
    { n: "Yaowarat (Chinatown) street food", cat: "night", d: "Seafood, roast duck, dim sum, dessert. Go after 18:00.", p: "฿฿", q: "Yaowarat Road street food" },
    { n: "Thip Samai", cat: "downtown", d: "Famous pad thai in the old town 🔎", p: "฿฿", q: "Thip Samai Pad Thai" },
    { n: "Jay Fai", cat: "downtown", d: "Michelin-starred street food, very long queues 🔎", p: "฿฿฿", q: "Jay Fai Bangkok" },
    { n: "Krua Apsorn", cat: "downtown", d: "Home-style Thai, crab omelette 🔎", p: "฿฿", q: "Krua Apsorn" },
    { n: "Soi Polo Fried Chicken", cat: "downtown", d: "Garlicky fried chicken, Lumphini area 🔎", p: "฿", q: "Soi Polo Fried Chicken" }
  ],

  dishes: [
    ["Pad Thai", "Stir-fried rice noodles"],
    ["Pad Kra Pao", "Holy-basil stir-fry with rice and fried egg"],
    ["Tom Yum Goong", "Hot-and-sour prawn soup"],
    ["Green / Red Curry", "Gaeng Keow Wan / Gaeng Daeng, coconut curries"],
    ["Som Tam", "Green papaya salad. Say “mai phet” for not spicy"],
    ["Khao Man Gai", "Chicken rice"],
    ["Mango Sticky Rice", "Seasonal dessert"],
    ["Boat Noodles", "Small bowls of rich noodle soup"]
  ],

  // Map & transit
  stations: [
    // id, name, x, y, labelDx, labelDy, info, ix(interchange), line
    { id: "BL13", n: "Chatuchak Park", x: 360, y: 70, ix: true, info: "Interchange with BTS Mo Chit. Chatuchak Weekend Market, Queen Sirikit Park." },
    { id: "BL15", n: "Lat Phrao", x: 420, y: 120, info: "Interchange with MRT Yellow Line." },
    { id: "BL16", n: "Ratchadaphisek", x: 480, y: 165, info: "Nightlife and restaurants along Ratchadaphisek Rd." },
    { id: "BL17", n: "Sutthisan", x: 520, y: 205, info: "Fortune Town IT mall 🔎." },
    { id: "BL18", n: "Huai Khwang", x: 550, y: 240, info: "Local street food and markets." },
    { id: "BL19", n: "Thailand Cultural Centre", x: 570, y: 268, info: "Ratchada Train Night Market, Esplanade, Cultural Centre. One stop from Phra Ram 9." },
    { id: "BL20", n: "Phra Ram 9 ★", x: 590, y: 300, home: true, info: "YOUR STATION. About a 3-minute walk from Avani Ratchada Bangkok Hotel; also G Tower and Central Rama 9." },
    { id: "BL21", n: "Phetchaburi", x: 570, y: 355, ix: true, info: "Interchange with Airport Rail Link (Makkasan) to Suvarnabhumi Airport." },
    { id: "BL22", n: "Sukhumvit / Asok", x: 530, y: 405, ix: true, info: "Interchange with BTS Asok. Terminal 21. Gateway to Sukhumvit, Siam by BTS." },
    { id: "BL25", n: "Lumphini", x: 470, y: 495, info: "Lumphini Park." },
    { id: "BL26", n: "Silom", x: 395, y: 520, ix: true, info: "Interchange with BTS Sala Daeng. Silom, Patpong, Lumphini Park." },
    { id: "BL28", n: "Hua Lamphong", x: 360, y: 595, info: "Main railway station." },
    { id: "BL29", n: "Wat Mangkon", x: 330, y: 625, info: "Chinatown (Yaowarat)." },
    { id: "BL31", n: "Sanam Chai", x: 300, y: 655, info: "Wat Pho and Grand Palace (walk 10–15 min or taxi) 🔎." }
  ],
  btsStations: [
    { id: "N8", n: "Mo Chit", left: true, x: 300, y: 60, info: "BTS terminus; Chatuchak area." },
    { id: "N3", n: "Victory Monument", left: true, x: 300, y: 200, info: "Busy hub; boat noodle alley." },
    { id: "CEN", n: "Siam", x: 300, y: 350, ix: true, info: "BTS interchange: Sukhumvit + Silom lines. Paragon, MBK, Center One." },
    { id: "W1", n: "National Stadium", left: true, x: 190, y: 370, info: "Jim Thompson House, MBK." },
    { id: "E4", n: "Asok", nolabel: true, x: 530, y: 405, ix: true, info: "Interchange with MRT Sukhumvit. Terminal 21." },
    { id: "E6", n: "Thong Lo", x: 640, y: 430, info: "Cafés, bars, restaurants." },
    { id: "S6", n: "Saphan Taksin", left: true, x: 330, y: 590, info: "River boats to Asiatique / ICONSIAM shuttle." }
  ],

  trips: [
    { to: "Terminal 21 / Asok", route: "MRT Blue Line → Sukhumvit (BL22) → walk to BTS Asok / Terminal 21", time: "~10 min", pay: "Card tap at MRT" },
    { to: "Siam (shopping)", route: "MRT → Sukhumvit (BL22) → exit and enter BTS Asok → BTS west to Siam", time: "~25–30 min", pay: "MRT card tap; BTS needs Rabbit / QR / coins" },
    { to: "Silom / Lumphini Park", route: "MRT toward Hua Lamphong → Lumphini (BL25) or Silom (BL26)", time: "~15–20 min", pay: "Card tap" },
    { to: "Chinatown", route: "MRT → Wat Mangkon (BL29)", time: "~25 min", pay: "Card tap" },
    { to: "Wat Pho / Grand Palace", route: "MRT → Sanam Chai (BL31), then walk (10–15 min) or taxi", time: "~30–35 min", pay: "Card tap" },
    { to: "Chatuchak Weekend Market", route: "MRT toward Chatuchak Park (BL13) or Kamphaeng Phet (BL14)", time: "~25 min", pay: "Card tap" },
    { to: "Suvarnabhumi Airport", route: "MRT → Phetchaburi (BL21) → transfer to Airport Rail Link at Makkasan → airport", time: "~35–45 min", pay: "ARL has its own ticket/tokens" },
    { to: "Don Mueang Airport", route: "Grab / taxi (≈45–60 min depending on traffic)", time: "~45–60 min", pay: "Grab app or cash" }
  ],

  pay: [
    { sys: "MRT (Blue & Purple)", ok: true, note: "Tap contactless Visa/Mastercard (or phone wallet linked to the card) directly at the gate. Use the same card to tap in and out. Foreign-card fees may apply." },
    { sys: "BTS Skytrain", ok: false, note: "No direct card tap. Use a Rabbit card, a QR ticket, or buy a single-journey ticket with coins/small notes at a machine. Carry ฿10/฿5/฿1 coins." },
    { sys: "Airport Rail Link", ok: false, note: "Own ticket machines/tokens. Check at the station." },
    { sys: "Chao Phraya Express Boat", ok: false, note: "Cash on board; small notes." },
    { sys: "Taxi", ok: false, note: "Mostly cash. Prefer Grab." },
    { sys: "Grab / Bolt / LINE MAN", ok: true, note: "Add your card in-app before arrival. Cash also accepted for rides." }
  ],

  apps: [
    { n: "Grab", grp: "Getting around & food", use: "Cars, taxis, motorbike taxis, food", tips: ["Set pickup to the hotel entrance. The hotel and G Tower face each other, so pick the right side.", "Price is shown up-front and includes surge in rain or rush hour.", "Use in-app chat if the driver calls in Thai (auto-translates).", "Toll roads may be paid in cash.", "GrabBike is fast in traffic but riskier."], ios: "647268330", android: "com.grabtaxi.passenger" },
    { n: "LINE MAN", grp: "Getting around & food", use: "Food, groceries, 7-Eleven, pharmacy, motorbike rides", tips: ["Needs a LINE account.", "In the address note add hotel name, room number and a phone number.", "Delivery fee ~฿10–40; more in rain or at distance.", "Foreign cards can fail; keep cash as backup 🔎"], ios: "1076238296", android: "com.linecorp.linemanth" },
    { n: "MuvMI", grp: "Getting around & food", use: "Electric tuk-tuk for short hops", tips: ["Service is limited to set zones; check the app map for Rama 9 coverage 🔎.", "Fixed fare, shared rides, in-app payment.", "Great for last-mile between a station and a mall."], ios: "1410088538", android: "co.muvmi.passenger" },
    { n: "Bolt", grp: "Getting around & food", use: "Cheaper cars/taxis", tips: ["Often cheaper than Grab; availability varies."], ios: "675033630", android: "ee.mtakso.client" },
    { n: "Google Maps", grp: "Navigation & translation", use: "Navigation, transit, reviews", tips: ["Download an offline map of Rama 9 and the city centre."], ios: "585027354", android: "com.google.android.apps.maps" },
    { n: "Google Translate", grp: "Navigation & translation", use: "Thai menus and signs", tips: ["Download the Thai offline pack; use the camera mode."], ios: "414706506", android: "com.google.android.apps.translate" },
    { n: "LINE", grp: "Communication", use: "Thailand's main chat app: friends, hotels, restaurants, shops and drivers all use it", tips: ["Most Thai businesses and many drivers contact you on LINE. Install it before you land.", "Sign-up needs a phone number and an SMS code, so set it up before you travel or while you have your home SIM active.", "Add people by QR code (Add friends → QR code) or by phone number.", "Free voice and video calls over Wi-Fi or mobile data."], ios: "443904275", android: "jp.naver.line.android" },
    { n: "Messenger", grp: "Communication", use: "Facebook Messenger: chat with Facebook contacts and many Thai businesses", tips: ["Handy for restaurants, tour operators and sellers who reply through their Facebook page.", "Works on Wi-Fi or mobile data; free calls and video calls.", "Log in with your Facebook account before you travel."], ios: "454638411", android: "com.facebook.orca" },
    { n: "Microsoft Teams", grp: "Communication", use: "Work calls, chat and meetings with colleagues", tips: ["Sign in with your work account and check you can join meetings before you travel.", "Download offline files and check any VPN or authenticator set-up while you still have your home network 🔎.", "Use Wi-Fi at the hotel for video calls to save mobile data."], ios: "1113153706", android: "com.microsoft.teams" }
  ],
  avoid: [
    "Taxis that refuse the meter or quote a high flat price.",
    "Strangers saying the Grand Palace is closed today or offering “special tours”.",
    "Gem-shop tours and unlicensed jet-ski or boat deals."
  ],

  tips: [
    { h: "Money & payments", b: ["Currency: Thai Baht (฿). Cards work in malls and hotels; street food, markets, taxis and boats are mostly cash.", "MRT accepts contactless cards; BTS does not.", "ATMs charge a foreign-card fee (commonly ฿220) 🔎, so withdraw larger amounts less often.", "Carry small notes and coins (฿10 coins for BTS machines).", "SuperRich exchange offices usually beat airport and hotel rates."] },
    { h: "Weather & clothing", b: ["Hot and humid; short but heavy rain showers. Check the forecast 🔎.", "Pack light clothes, a compact umbrella, sunscreen, comfortable shoes.", "Indoor A/C is cold; bring a light layer.", "Temples: cover shoulders and knees; remove shoes where required."] },
    { h: "Health & safety", b: ["Drink bottled water.", "Pharmacies (Boots, Watsons) are common; Central Rama 9 has one.", "Watch for pickpockets in crowded markets and on trains.", "Cross at footbridges; traffic doesn't always stop at crossings.", "Rama 9 is generally safe; use normal city caution at night."] },
    { h: "Etiquette", b: ["Greet with a wai and “sawasdee krap” (male) / “sawasdee ka” (female).", "Respect the monarchy; avoid disparaging comments.", "Don't touch people's heads; don't point your feet at people or Buddha images.", "Remove shoes in homes, some shops and temples.", "Keep calm; raising your voice is impolite.", "Women should not touch monks."] },
    { h: "Connectivity", b: ["Tourist SIM / eSIM from AIS, True or dtac 🔎.", "Free Wi-Fi in malls, cafés and the hotel.", "Download offline maps for Rama 9."] },
    { h: "Packing checklist", b: ["Passport, entry documents, hotel booking", "Travel insurance", "Power adapter (220 V) 🔎", "Contactless credit card for MRT", "Small cash", "Power bank", "Umbrella or rain jacket", "Sunscreen, insect repellent", "Prescription medicines with a copy of the prescription"] }
  ],

  phrases: [
    ["Hello", "สวัสดีครับ/ค่ะ", "Sawasdee krap/ka"],
    ["Thank you", "ขอบคุณครับ/ค่ะ", "Khob khun krap/ka"],
    ["How much?", "เท่าไหร่", "Tao rai?"],
    ["Not spicy", "ไม่เผ็ด", "Mai phet"],
    ["No ice", "ไม่ใส่น้ำแข็ง", "Mai sai nam khaeng"],
    ["Where is…?", "…อยู่ที่ไหน", "… yoo tee nai?"],
    ["The bill, please", "เช็คบิล", "Check bin"],
    ["Too expensive", "แพงไป", "Paeng pai"],
    ["Toilet", "ห้องน้ำ", "Hong nam"],
    ["Please use the meter", "กรุณาเปิดมิเตอร์", "Garuna perd meter"]
  ],

  taxiCards: [
    { en: "Please take me to Avani Ratchada Bangkok Hotel, 1 Ratchadaphisek Road, opposite G Tower, Rama 9.", th: "กรุณาพาไปโรงแรมอวานี รัชดา กรุงเทพ เลขที่ 1 ถนนรัชดาภิเษก ตรงข้ามจีทาวเวอร์ พระราม 9" },
    { en: "Please take me to MRT Phra Ram 9.", th: "กรุณาพาไปสถานีรถไฟฟ้า MRT พระราม 9" },
    { en: "Please use the meter.", th: "กรุณาเปิดมิเตอร์" },
    { en: "Please take me to Central Rama 9.", th: "กรุณาพาไปเซ็นทรัล พระราม 9" }
  ],

  emergency: [
    ["Police", "191"],
    ["Tourist Police (English)", "1155"],
    ["Ambulance / medical", "1669"],
    ["Fire", "199"]
  ]
};
