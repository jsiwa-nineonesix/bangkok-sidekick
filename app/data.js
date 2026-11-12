// All app content lives here. Edit this file to update the guide. 🔎 = verify before relying on it.
const DATA = {
  appName: "Bangkok Sidekick",
  tagline: "Your travel buddy in the Big Mango",
  edition: "Rama 9 Base",
  editionNote: "Built around your hotel in Rama 9. Bangkok is huge, so this guide starts from here and covers the trips you are most likely to take from it.",
  // Shown on Home. Keep this honest: list only what was actually verified, and the date.
  trust: {
    reviewed: "12 Nov 2026",
    verified: [
      "Hotel name, address and phone (official Avani site + Google hotel listing)",
      "Locations of all 21 MRT/BTS stations (OpenStreetMap)",
      "Distances from the hotel (straight-line, measured from OpenStreetMap coordinates)",
      "Photos: each one shows the place it is labelled with (free-licence photos from Wikimedia Commons, credited in the app)",
      "App Store and Play Store links (Apple and Google store records)",
      "Every Maps button opens a well-formed search or coordinate",
      "Google ratings and review counts for Night Out spots, the big sights, Benjakitti Park, CentralWorld and MBK (12 Nov 2026)"
    ],
    recheck: [
      "Fares, travel times and train hours",
      "Opening days and hours (especially night markets)",
      "Restaurant details, entry fees and every budget estimate",
      "Places without a Google rating on their card (tap Map to see it)",
      "Anything marked 🔎 in the guide"
    ]
  },
  // Chat assistant. Leave endpoint empty to answer from the guide only (free, offline).
  // AI assistant: Cloudflare Workers AI via chat-proxy/ (free daily allowance, no API key).
  // Anonymous visit counts via Cloudflare Web Analytics (no cookies). Paste the site token from
  // dash.cloudflare.com > Web Analytics to turn it on; leave empty to keep analytics off.
  analytics: { cfToken: "" },
  chat: { endpoint: "https://bangkok-sidekick-chat.bangkok-sidekick-chat-proxy.workers.dev/", dailyLimit: 30 },
  version: "45",
  hotel: {
    name: "Avani Ratchada Bangkok Hotel (opposite G Tower, Rama 9)",
    thaiName: "โรงแรมอวานี รัชดา กรุงเทพ ตรงข้ามจีทาวเวอร์ พระราม 9",
    address: "1 Ratchadaphisek Road, Din Daeng, Bangkok 10400 (1 ถนนรัชดาภิเษก ดินแดง กรุงเทพฯ 10400)",
    phone: "02 641 1500"
  },

  // Explore catalogues (Walkable / Near (MRT) / Downtown / Popular Malls). Same card format as Night Out.
  // rating + reviews are Google's (read 12 Nov 2026) where available; leave them out when not known.
  // budget = my ESTIMATE per person. min = rough minutes from the hotel (used by "Closest").
  explore: { asOf: "12 Nov 2026" },
  // Photos are from Wikimedia Commons (free licences), cropped to 16:10 and resized. Credits are shown in the app.
  photoDir: "img/places/",
  photos: {
    "central-rama-9": {
      "by": "Magnamonkun",
      "lic": "CC BY 3.0",
      "licUrl": "https://creativecommons.org/licenses/by/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:CentralPlaza_Grand_Rama_IX_-_Entrance.jpg"
    },
    "g-tower": {
      "by": "Chainwit.",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:G_Tower_Bangkok_(The_Grand_Rama_9_(New_CBD)).jpg"
    },
    "thailand-cultural-centre": {
      "by": "Tmd",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Thailand_Cultural_Centre_4.jpg"
    },
    "rama-9-square": {
      "by": "Bigcitydata",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:One9Five_Towers_and_Rama_IX_Square.jpg"
    },
    "ratchada-train-night-market": {
      "by": "aotaro",
      "lic": "CC BY 2.0",
      "licUrl": "https://creativecommons.org/licenses/by/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:Train_Night_Market_Ratchada_(34079339800).jpg"
    },
    "esplanade-ratchada": {
      "by": "Sry85",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Esplanade_Ratchadapisek.jpg"
    },
    "terminal-21": {
      "by": "Chainwit.",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Terminal_21_Asok_Bangkok_20202021.jpg"
    },
    "benjakitti-park": {
      "by": "Supanut Arunoprayote",
      "lic": "CC BY 4.0",
      "licUrl": "https://creativecommons.org/licenses/by/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Benjakitti_Forest_Park_(I).jpg"
    },
    "grand-palace": {
      "by": "Basile Morin",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%A8%E0%B8%A3%E0%B8%B5%E0%B8%A3%E0%B8%B1%E0%B8%95%E0%B8%99%E0%B8%A8%E0%B8%B2%E0%B8%AA%E0%B8%94%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B9%81%E0%B8%81%E0%B9%89%E0%B8%A7_%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_-_Wat_Phra_Kaew,_Temple_of_Emerald_Buddha,_Bangkok,_Thailand.jpg"
    },
    "wat-pho": {
      "by": "Diego Delso",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Wat_Pho,_Bangkok,_Tailandia,_2013-08-22,_DD_06.jpg"
    },
    "wat-arun": {
      "by": "Diego Delso",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Templo_Wat_Arun,_Bangkok,_Tailandia,_2013-08-22,_DD_37.jpg"
    },
    "yaowarat": {
      "by": "Deepak-nsk",
      "lic": "CC0",
      "licUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "page": "https://commons.wikimedia.org/wiki/File:Chinatown_in_Bangkok_(Yaowarat)_at_night.jpg"
    },
    "jim-thompson-house": {
      "by": "David Broad",
      "lic": "CC BY 3.0",
      "licUrl": "https://creativecommons.org/licenses/by/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:JT_House_-_Jim_Thompson_House,_Bangkok_-_Thailand_-_panoramio.jpg"
    },
    "lumphini-park": {
      "by": "Diego Delso",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Parque_Lumphini,_Bangkok,_Tailandia,_2013-08-22,_DD_04.jpg"
    },
    "chatuchak": {
      "by": "Christophe95",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Chatuchak_Weekend_Market_2.jpg"
    },
    "asiatique": {
      "by": "Slyronit",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Asiatique,_Bangkok_from_Chao_Phraya_River_2.jpg"
    },
    "siam-paragon": {
      "by": "Supanut Arunoprayote",
      "lic": "CC BY 4.0",
      "licUrl": "https://creativecommons.org/licenses/by/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Siam_Paragon_06.23.jpg"
    },
    "iconsiam": {
      "by": "Slyronit",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Approaching_Iconsiam_from_Chao_Phraya_River,_Bangkok.jpg"
    },
    "centralworld": {
      "by": "Christophe95",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:CentralWorld_exterior.jpg"
    },
    "fortune-town": {
      "by": "Fortune Town (photo supplied by the app owner)",
      "lic": "Used with permission of the app owner",
      "licUrl": "https://www.fortunetown.co.th/",
      "page": "https://www.fortunetown.co.th/"
    },
    "mbk": {
      "by": "Christian Henrich",
      "lic": "CC BY-SA 2.5",
      "licUrl": "https://creativecommons.org/licenses/by-sa/2.5",
      "page": "https://commons.wikimedia.org/wiki/File:MBK_Bangkok_1.jpg"
    },
    "central-embassy": {
      "by": "Bigcitydata",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Central_Embassy_Bangkok.jpg"
    },
    "platinum": {
      "by": "coolinsights",
      "lic": "CC BY 2.0",
      "licUrl": "https://creativecommons.org/licenses/by/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:Platinum_Fashion_Mall_Pratunam.jpg"
    },
    "emquartier": {
      "by": "กสิณธร ราชโอรส",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:%E0%B8%A8%E0%B8%B9%E0%B8%99%E0%B8%A2%E0%B9%8C%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B8%94%E0%B8%B4_%E0%B9%80%E0%B8%AD%E0%B9%87%E0%B8%A1%E0%B8%84%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%97%E0%B8%B5%E0%B8%A2%E0%B8%A3%E0%B9%8C_%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%A7%E0%B8%B1%E0%B8%92%E0%B8%99%E0%B8%B2_%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_The_Emquartier,Vadhana,Bangkok_(2).jpg"
    },
    "one-bangkok": {
      "by": "OraMAAG",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:One_Bangkok_Main_Entrance.jpg"
    },
    "central-park": {
      "by": "Chainwit.",
      "lic": "CC BY 4.0",
      "licUrl": "https://creativecommons.org/licenses/by/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Dusit_Arun_at_Dusit_Central_Park_(07-09-2025)_-_views_-_img_04.jpg"
    },
    "samyan-mitrtown": {
      "by": "Chainwit.",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Samyan_Mitrtown_%E0%B8%AA%E0%B8%B2%E0%B8%A1%E0%B8%A2%E0%B9%88%E0%B8%B2%E0%B8%99%E0%B8%A1%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B8%97%E0%B8%B2%E0%B8%A7%E0%B8%99%E0%B9%8C.jpg"
    },
    "district-asok": {
      "by": "Chainwit.",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Sukhumwit_Road_with_BTS_Asok_and_Asok_Montri_Rd.jpg"
    },
    "district-silom": {
      "by": "Paul 012",
      "lic": "CC BY-SA 2.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:BTS_Skytrain_over_Sala_Daeng_Intersection.jpg"
    },
    "district-thonglor": {
      "by": "Suikotei",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Thong_Lo_Station_platform.jpg"
    }
  },

  places: [
    // ---- Walkable ----
    { n: "Central Rama 9", photo: "central-rama-9", cats: ["near", "malls"], km: 0.2, type: "Shopping mall", d: "Big mall: food hall, supermarket, pharmacy, cinema. A good rainy-day base.", go: "About a 4-minute walk (~250 m), across the road.", budget: "฿0 to browse · meals ฿150-450", min: 4, q: "Central Rama 9" },
    { n: "Fortune Town", photo: "fortune-town", cats: ["near", "malls"], km: 0.2, type: "IT & electronics mall", d: "Phones, laptops and gadgets. Right next to MRT Phra Ram 9.", go: "About a 3-minute walk (~200 m).", budget: "฿0 to browse · snacks ฿100-300", min: 3, q: "Fortune Town Ratchadaphisek" },
    { n: "G Tower", photo: "g-tower", cats: ["near"], km: 0.1, type: "Office tower with cafés", d: "The office tower opposite your hotel, with cafés and quick lunches on the lower floors.", go: "Across the street, about a 1-minute walk.", budget: "฿100-300 for a café or quick lunch", min: 1, q: "G Tower Rama 9" },
    { n: "Rama 9 Square / Grand Rama 9", photo: "rama-9-square", cats: ["near"], km: 0.4, type: "Offices, restaurants & shops", d: "An office and restaurant cluster with convenience stores.", go: "About a 7-minute walk (~450 m).", budget: "฿100-400 for a meal", min: 7, q: "Rama 9 Square" },
    // ---- Near (MRT) ----
    { n: "Thailand Cultural Centre", photo: "thailand-cultural-centre", cats: ["nearby"], km: 1.4, type: "Concert & exhibition venue", d: "Concerts, exhibitions and Thai performances.", go: "One MRT stop to Thailand Cultural Centre (BL19), about 5 min (about 1.4 km on foot).", budget: "฿0 to look around · show tickets vary 🔎", min: 8, q: "Thailand Cultural Centre Bangkok" },
    { n: "Jodd Fairs Ratchada", ph: "🍢", cats: ["nearby"], km: 1.4, type: "Night market (evenings)", d: "Street food, grilled seafood, drinks and live music. The old Rama 9 branch has closed; this is the current one.", go: "About 1.4 km: a 20-25 min walk or a short Grab ride.", budget: "฿200-500 for food & drinks · check opening nights 🔎", min: 10, q: "Jodd Fairs Ratchada" },
    { n: "Ratchada Train Night Market", photo: "ratchada-train-night-market", cats: ["nearby"], type: "Night market", d: "Retro market with street food and bars. Usually Thu-Sun evenings 🔎.", go: "One MRT stop to Thailand Cultural Centre (BL19), then a short walk 🔎.", budget: "฿200-500 for food & drinks", min: 10, q: "Ratchada Train Night Market" },
    { n: "Esplanade Ratchada", photo: "esplanade-ratchada", cats: ["nearby", "malls"], km: 1.2, type: "Shopping mall", d: "Mall with restaurants and a cinema.", go: "One MRT stop to Thailand Cultural Centre (BL19), about 5-8 min.", budget: "฿0 to browse · meals ฿200-500", min: 8, q: "Esplanade Ratchada" },
    { n: "Terminal 21 Asok", photo: "terminal-21", cats: ["nearby", "malls"], km: 2.2, type: "Shopping mall", d: "Travel-themed mall with a cheap food court.", go: "MRT to Sukhumvit (BL22), about 10 min, then walk to BTS Asok / Terminal 21.", budget: "฿0 to browse · food court ฿100-250", min: 15, q: "Terminal 21 Asok" },
    { n: "Benjakitti Park", photo: "benjakitti-park", cats: ["nearby"], km: 3.3, rating: 4.6, reviews: 11344, type: "Lakeside park", d: "A running and biking path around a lake. Lovely at sunset.", go: "MRT to QSNCC (BL23), about 3 stops (~12 min), then walk 🔎.", budget: "Free · bike hire & drinks ฿50-200 🔎", min: 15, q: "Benjakitti Park" },
    // ---- Downtown ----
    { n: "Grand Palace", photo: "grand-palace", cats: ["downtown"], km: 7.9, rating: 4.6, reviews: 80896, type: "Royal palace & top sight", d: "Cover shoulders and knees, and go early. Ignore strangers who say it is closed (a common scam).", go: "MRT to Sanam Chai (BL31), then walk 10-15 min or take a taxi; about 30-35 min.", budget: "Entry about ฿500 🔎 · dress code applies", min: 35, q: "Grand Palace Bangkok" },
    { n: "Wat Pho", photo: "wat-pho", cats: ["downtown"], km: 7.9, rating: 4.7, reviews: 38460, type: "Temple (Reclining Buddha)", d: "The giant Reclining Buddha and the home of Thai massage.", go: "MRT to Sanam Chai (BL31), then a short walk; about 30-35 min.", budget: "Entry about ฿300 🔎", min: 33, q: "Wat Pho" },
    { n: "Wat Arun", photo: "wat-arun", cats: ["downtown"], km: 8.4, rating: 4.7, reviews: 45551, type: "Riverside temple", d: "Iconic riverside temple, beautiful at sunset.", go: "MRT to Sanam Chai (BL31), walk to Tha Tien pier and take the short ferry across; about 40 min.", budget: "Entry about ฿200 🔎 · ferry a few baht", min: 40, q: "Wat Arun" },
    { n: "Chinatown (Yaowarat)", photo: "yaowarat", cats: ["downtown"], km: 6.3, rating: 4.5, reviews: 35898, type: "Street-food district", d: "Seafood, roast duck and desserts. Go after 18:00 for the best atmosphere.", go: "MRT to Wat Mangkon (BL29), about 25 min.", budget: "฿200-600 for street food", min: 25, q: "Yaowarat Road Bangkok" },
    { n: "Jim Thompson House", photo: "jim-thompson-house", cats: ["downtown"], km: 4.0, rating: 4.5, reviews: 17705, type: "Museum", d: "A Thai silk merchant's teak house and museum.", go: "MRT to Sukhumvit (BL22), BTS Asok to National Stadium; about 35-40 min 🔎.", budget: "Entry about ฿200 🔎", min: 38, q: "Jim Thompson House" },
    { n: "Lumphini Park", photo: "lumphini-park", cats: ["downtown"], km: 3.9, rating: 4.5, reviews: 41352, type: "City park", d: "Green space with lakes, running paths and monitor lizards.", go: "MRT to Lumphini (BL25) or Silom (BL26); about 15-20 min.", budget: "Free", min: 18, q: "Lumphini Park" },
    { n: "Chatuchak Weekend Market", photo: "chatuchak", cats: ["downtown"], km: 5.0, rating: 4.4, reviews: 56769, type: "Giant market (Sat-Sun)", d: "Thousands of stalls. Open mainly on weekends.", go: "MRT to Kamphaeng Phet (BL14) or Chatuchak Park (BL13); about 25 min.", budget: "฿300-800 for food & shopping", min: 25, q: "Chatuchak Weekend Market" },
    { n: "Asiatique The Riverfront", photo: "asiatique", cats: ["downtown"], km: 8.9, rating: 4.4, reviews: 76723, type: "Riverside night bazaar", d: "Evening shopping, dining and a Ferris wheel by the river.", go: "BTS to Saphan Taksin, then the free Asiatique boat; about 60 min 🔎.", budget: "฿300-800 for dinner & rides", min: 60, q: "Asiatique The Riverfront" },
    { n: "Siam Paragon", photo: "siam-paragon", cats: ["downtown", "malls"], km: 3.4, type: "Luxury mall (Siam)", d: "Upscale mall in the Siam shopping district, with a big food hall.", go: "MRT to Sukhumvit (BL22), BTS Asok to Siam; about 25-30 min.", budget: "฿0 to browse · meals ฿250-700", min: 28, q: "Siam Paragon" },
    { n: "ICONSIAM", photo: "iconsiam", cats: ["downtown", "malls"], km: 6.8, type: "Riverside mall", d: "Riverside mall with a floating-market floor.", go: "MRT to Silom (BL26), BTS Sala Daeng to Saphan Taksin, then the free shuttle boat; about 55-65 min 🔎.", budget: "฿0 to browse · meals ฿250-700", min: 60, q: "ICONSIAM" },
    // ---- Popular malls (the rest) ----
    { n: "CentralWorld", photo: "centralworld", cats: ["malls"], km: 3.0, rating: 4.5, reviews: 79344, type: "Shopping mall", d: "A huge mall for fashion, beauty, tech and dining.", go: "MRT to Sukhumvit (BL22), BTS Asok to Chit Lom or Siam; about 30 min.", budget: "฿0 to browse · meals ฿200-600", min: 30, q: "CentralWorld" },
    { n: "MBK Center", photo: "mbk", cats: ["malls"], km: 4.0, rating: 4.5, reviews: 66050, type: "Bargain mall", d: "Over 2,000 shops. Bargaining is expected.", go: "MRT to Sukhumvit (BL22), BTS Asok to National Stadium; about 35 min.", budget: "฿0 to browse · shopping ฿300-1,500 · meals ฿100-300", min: 35, q: "MBK Center" },
    { n: "The Street Ratchada", ph: "🛍️", cats: ["malls"], km: 1.7, type: "Lifestyle mall & night market", d: "Open-air style mall with restaurants and a night market on Ratchada. The closest 'proper' mall after the Rama 9 ones.", go: "MRT to Thailand Cultural Centre (BL19), then about a 7-8 min walk (~500 m), or a short Grab ride.", budget: "฿0 to browse · meals ฿150-450", min: 12, q: "The Street Ratchada" },
    { n: "Central Embassy", photo: "central-embassy", cats: ["malls"], km: 2.4, type: "Luxury mall", d: "Upscale shopping and a large food hall, next to Phloen Chit.", go: "MRT to Sukhumvit (BL22), BTS Asok to Phloen Chit (2 stops); about 30 min.", budget: "฿0 to browse · meals ฿300-900", min: 28, q: "Central Embassy" },
    { n: "Platinum Fashion Mall", photo: "platinum", cats: ["malls"], km: 2.8, type: "Wholesale fashion mall (Pratunam)", d: "Hundreds of small clothing stalls. Great for bargains; bring cash and expect to haggle.", go: "About 15-20 min by Grab. By train: MRT to Phetchaburi, Airport Link from Makkasan to Ratchaprarop, then walk ~10 min 🔎.", budget: "฿0 to browse · clothes ฿200-1,500", min: 20, q: "Platinum Fashion Mall" },
    { n: "Em District (EmQuartier, Emporium, EmSphere)", photo: "emquartier", cats: ["malls"], km: 2.9, type: "Upscale mall cluster (Phrom Phong)", d: "Three linked malls with designer shops, a waterfall atrium and many restaurants.", go: "MRT to Sukhumvit (BL22), BTS Asok to Phrom Phong (1 stop); about 25-30 min, or ~15-20 min by Grab.", budget: "฿0 to browse · meals ฿250-700", min: 25, q: "EmQuartier" },
    { n: "One Bangkok", photo: "one-bangkok", cats: ["malls"], km: 3.8, type: "New mixed-use district", d: "A large new development on Rama IV with shops, dining, offices and a park. Parts may still be opening, so check what is open 🔎.", go: "MRT to Lumphini (BL25), about 15 min, then a short walk (~200 m) 🔎.", budget: "฿0 to browse · meals ฿250-700 🔎", min: 20, q: "One Bangkok" },
    { n: "Central Park Bangkok", photo: "central-park", cats: ["malls"], km: 4.3, type: "New mall & green space (Silom)", d: "A newer shopping and dining development by Silom with a green space. Check which shops are open 🔎.", go: "MRT straight to Silom (BL26), about 20 min, no change. The mall is about 100 m from the station.", budget: "฿0 to browse · meals ฿250-700", min: 22, q: "Central Park Bangkok" },
    { n: "Samyan Mitrtown", photo: "samyan-mitrtown", cats: ["malls"], km: 4.7, type: "Mall by Chulalongkorn Univ.", d: "A modern mall with shops, a food court and a student crowd.", go: "MRT straight to Sam Yan (BL27), about 25 min, no change. The mall is at the station.", budget: "฿0 to browse · meals ฿100-350", min: 25, q: "Samyan Mitrtown" }
  ],

  food: [
    // cat: mall | street | night | classic | downtown
    { n: "Central Rama 9 food court / food hall", cat: "mall", d: "Thai dishes, noodles, rice plates, desserts. Buy a food-court card at the counter and refund the balance before leaving.", p: "฿", q: "Central Rama 9 food court" },
    { n: "Central Rama 9 restaurant floors", cat: "mall", d: "Japanese (sushi, ramen, tonkatsu), Korean BBQ, hot pot, Thai chains.", p: "฿฿", q: "Central Rama 9 restaurants" },
    { n: "G Tower lower floors", cat: "street", d: "Office-worker lunches. Avoid 12:00–13:00 queues 🔎", p: "฿", q: "G Tower Rama 9 restaurants" },
    { n: "Sois around Rama 9", cat: "street", d: "Small Thai shops and stalls: noodle soup, grilled pork (moo ping), papaya salad, rice with curry.", p: "฿", q: "restaurants near Rama 9 MRT" },
    { n: "7-Eleven / FamilyMart", cat: "street", d: "24h water, toasties, onigiri, snacks. Staff will heat food for you.", p: "฿", q: "7-Eleven near Rama 9" },
    { n: "Jodd Fairs Ratchada", cat: "night", d: "Grilled seafood, spicy salads, mala skewers, drinks, music. Busy on weekends. The Rama 9 branch has closed. Check opening nights 🔎", p: "฿฿", q: "Jodd Fairs Ratchada" },
    { n: "Ratchada Train Night Market", cat: "night", d: "Retro market, street food and bars.", p: "฿฿", q: "Ratchada Train Night Market" },
    { n: "Yaowarat (Chinatown) street food", cat: "night", d: "Seafood, roast duck, dim sum, dessert. Go after 18:00.", p: "฿฿", q: "Yaowarat Road street food" },
    { n: "Thip Samai", cat: "downtown", d: "Famous pad thai in the old town 🔎", p: "฿฿", q: "Thip Samai Pad Thai" },
    { n: "Jay Fai", cat: "downtown", d: "Michelin-starred street food, very long queues 🔎", p: "฿฿฿", q: "Jay Fai Bangkok" },
    { n: "Krua Apsorn", cat: "downtown", d: "Home-style Thai, crab omelette 🔎", p: "฿฿", q: "Krua Apsorn Dinso Road" },
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
    { id: "BL13", ll: "13.8029643,100.5532845", n: "Chatuchak Park", x: 360, y: 70, ix: true, info: "Interchange with BTS Mo Chit. Chatuchak Weekend Market, Queen Sirikit Park." },
    { id: "BL15", ll: "13.806503,100.5728701", n: "Lat Phrao", x: 420, y: 120, info: "Interchange with MRT Yellow Line." },
    { id: "BL16", ll: "13.7989706,100.5745537", n: "Ratchadaphisek", x: 480, y: 165, info: "Nightlife and restaurants along Ratchadaphisek Rd." },
    { id: "BL17", ll: "13.7894884,100.5740801", n: "Sutthisan", x: 520, y: 205, info: "Restaurants and offices along Ratchadaphisek Rd. (Fortune Town mall is actually next to Phra Ram 9.)" },
    { id: "BL18", ll: "13.7786878,100.5735662", n: "Huai Khwang", x: 550, y: 240, info: "Local street food and markets." },
    { id: "BL19", ll: "13.7661576,100.5701188", n: "Thailand Cultural Centre", x: 570, y: 268, info: "Ratchada Train Night Market, Esplanade, Cultural Centre. One stop from Phra Ram 9." },
    { id: "BL20", ll: "13.7578166,100.5652774", n: "Phra Ram 9 ★", x: 590, y: 300, home: true, info: "YOUR STATION. About a 3-minute walk from Avani Ratchada Bangkok Hotel; also G Tower and Central Rama 9." },
    { id: "BL21", ll: "13.7491853,100.5634165", n: "Phetchaburi", x: 570, y: 355, ix: true, info: "Interchange with Airport Rail Link (Makkasan) to Suvarnabhumi Airport." },
    { id: "BL22", ll: "13.7374671,100.561498", n: "Sukhumvit / Asok", x: 530, y: 405, ix: true, info: "Interchange with BTS Asok. Terminal 21. Gateway to Sukhumvit, Siam by BTS." },
    { id: "BL25", ll: "13.7256066,100.5457249", n: "Lumphini", x: 470, y: 495, info: "Lumphini Park." },
    { id: "BL26", ll: "13.7291982,100.5370702", n: "Silom", x: 395, y: 520, ix: true, info: "Interchange with BTS Sala Daeng. Silom, Patpong, Lumphini Park." },
    { id: "BL28", ll: "13.7375708,100.517135", n: "Hua Lamphong", x: 360, y: 595, info: "Main railway station." },
    { id: "BL29", ll: "13.7422095,100.5099097", n: "Wat Mangkon", x: 330, y: 625, info: "Chinatown (Yaowarat)." },
    { id: "BL31", ll: "13.7443259,100.4946239", n: "Sanam Chai", x: 300, y: 655, info: "Wat Pho and Grand Palace (walk 10–15 min or taxi) 🔎." }
  ],
  btsStations: [
    { id: "N8", ll: "13.8025991,100.5537913", n: "Mo Chit", left: true, x: 300, y: 60, info: "BTS terminus; Chatuchak area." },
    { id: "N3", ll: "13.7627589,100.5370529", n: "Victory Monument", left: true, x: 300, y: 200, info: "Busy hub; boat noodle alley." },
    { id: "CEN", ll: "13.7456236,100.5342199", n: "Siam", x: 300, y: 350, ix: true, info: "BTS interchange: Sukhumvit + Silom lines. Paragon, MBK, Center One." },
    { id: "W1", ll: "13.74651,100.5290855", n: "National Stadium", left: true, x: 190, y: 370, info: "Jim Thompson House, MBK." },
    { id: "E4", ll: "13.7370432,100.5603571", n: "Asok", nolabel: true, x: 530, y: 405, ix: true, info: "Interchange with MRT Sukhumvit. Terminal 21." },
    { id: "E6", ll: "13.7242264,100.5785054", n: "Thong Lo", x: 640, y: 430, info: "Cafés, bars, restaurants." },
    { id: "S6", ll: "13.7187781,100.5142128", n: "Saphan Taksin", left: true, x: 330, y: 590, info: "River boats to Asiatique / ICONSIAM shuttle." }
  ],

  trips: [
    { to: "Terminal 21 / Asok", dest: "Terminal 21 Asok Bangkok", route: "MRT Blue Line → Sukhumvit (BL22) → walk to BTS Asok / Terminal 21", time: "~10 min", pay: "Card tap at MRT" },
    { to: "Siam (shopping)", dest: "Siam Paragon Bangkok", route: "MRT → Sukhumvit (BL22) → exit and enter BTS Asok → BTS west to Siam", time: "~25–30 min", pay: "MRT card tap; BTS needs Rabbit / QR / coins" },
    { to: "Silom / Lumphini Park", dest: "Lumphini Park Bangkok", route: "MRT toward Hua Lamphong → Lumphini (BL25) or Silom (BL26)", time: "~15–20 min", pay: "Card tap" },
    { to: "Chinatown", dest: "Yaowarat Road Bangkok", route: "MRT → Wat Mangkon (BL29)", time: "~25 min", pay: "Card tap" },
    { to: "Wat Pho / Grand Palace", dest: "Wat Pho Bangkok", route: "MRT → Sanam Chai (BL31), then walk (10–15 min) or taxi", time: "~30–35 min", pay: "Card tap" },
    { to: "Chatuchak Weekend Market", dest: "Chatuchak Weekend Market Bangkok", route: "MRT toward Chatuchak Park (BL13) or Kamphaeng Phet (BL14)", time: "~25 min", pay: "Card tap" },
    { to: "Suvarnabhumi Airport", dest: "Suvarnabhumi Airport", route: "MRT → Phetchaburi (BL21) → transfer to Airport Rail Link at Makkasan → airport", time: "~35–45 min", pay: "ARL has its own ticket/tokens" },
    { to: "Don Mueang Airport", dest: "Don Mueang International Airport", route: "Grab / taxi (≈45–60 min depending on traffic)", time: "~45–60 min", pay: "Grab app or cash" }
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
    { h: "Money & payments", b: ["Currency: Thai Baht (฿). Cards work in malls and hotels; street food, markets, taxis and boats are mostly cash.", "MRT accepts contactless cards; BTS does not.", "ATMs charge a foreign-card fee (commonly ฿220) 🔎, so withdraw larger amounts less often.", "Carry small notes and coins (฿10 coins for BTS machines).", "SuperRich exchange offices usually beat airport and hotel rates.", "A SuperRich exchange office is also reported at Central Rama 9 (5th floor), a short walk from the hotel. Confirm on Google Maps or the mall directory before you go 🔎."] },
    { h: "Weather & clothing", b: ["Hot and humid; short but heavy rain showers. Check the forecast 🔎.", "Pack light clothes, a compact umbrella, sunscreen, comfortable shoes.", "Indoor A/C is cold; bring a light layer.", "Temples: cover shoulders and knees; remove shoes where required."] },
    { h: "Health & safety", b: ["Drink bottled water.", "Pharmacies (Boots, Watsons) are common; Central Rama 9 has one.", "Watch for pickpockets in crowded markets and on trains.", "Cross at footbridges; traffic doesn't always stop at crossings.", "Rama 9 is generally safe; use normal city caution at night."] },
    { h: "Etiquette", b: ["Greet with a wai and “sawasdee krap” (male) / “sawasdee ka” (female).", "Respect the monarchy; avoid disparaging comments.", "Don't touch people's heads; don't point your feet at people or Buddha images.", "Remove shoes in homes, some shops and temples.", "Keep calm; raising your voice is impolite.", "Women should not touch monks."] },
    { h: "Connectivity", b: ["Tourist SIM / eSIM from AIS, True or dtac 🔎.", "Free Wi-Fi in malls, cafés and the hotel.", "Download offline maps for Rama 9."] },
    { h: "Packing checklist", b: ["Passport, entry documents, hotel booking", "Travel insurance", "Power adapter (220 V) 🔎", "Contactless credit card for MRT", "Small cash", "Power bank", "Umbrella or rain jacket", "Sunscreen, insect repellent", "Prescription medicines with a copy of the prescription"] }
  ],

  // BKK Night Out (Explore > Night Out). Ratings/review counts/taxi times are Google's, read from the hotel's
  // Google listing on 12 Nov 2026. Budgets are ESTIMATES by cuisine (Google data had no price level).
  nightout: {
    asOf: "12 Nov 2026",
    hotelQuery: "Avani Ratchada Bangkok Hotel",
    top: [
      { n: "Maderla", ph: "🍜", type: "Thai restaurant", rating: 4.9, reviews: 547, taxi: 5, go: "About 5 min by Grab from the hotel (Google's estimate). Open Map, then tap Directions.", budget: "฿200-450" },
      { n: "ตำตำ ต้นตำรับ (Belle Grand Rama 9)", ph: "🥗", q: "ตำตำ ต้นตำรับ Belle Grand Rama 9", type: "Thai restaurant", rating: 4.8, reviews: 215, taxi: 5, walk: "about 10 min walk (~600 m)", go: "Belle Grand Rama 9 is about 600 m from the hotel: roughly a 10-minute walk, or ~5 min by Grab.", budget: "฿150-350" },
      { n: "Treehouse Cafe & Bar", ph: "🍸", type: "Cafe & bar (Google lists it as a restaurant)", rating: 4.8, reviews: 2356, taxi: 16, go: "About 16 min by Grab (Google's estimate). The most-reviewed place in this list. Check the route in Maps before you go.", budget: "฿400-900 with drinks" },
      { n: "Come Pah", ph: "🍛", type: "Thai restaurant", rating: 4.7, reviews: 257, taxi: 5, go: "About 5 min by Grab (Google's estimate).", budget: "฿200-450" },
      { n: "Dal Dal Korean Restaurant", ph: "🥘", type: "Korean restaurant", rating: 4.7, reviews: 543, taxi: 5, go: "About 5 min by Grab (Google's estimate).", budget: "฿300-700" },
      { n: "Kumpoon - Central Rama 9", ph: "🍲", type: "Thai restaurant", rating: 4.6, reviews: 398, taxi: 6, walk: "inside Central Rama 9, about a 4-min walk", go: "Inside Central Rama 9, a 4-minute walk (~250 m) from the hotel. Use the mall directory for the floor.", budget: "฿200-450" },
      { n: "Baan Ying Original Siam Kitchen", ph: "🍜", type: "Thai restaurant", rating: 4.6, reviews: 340, taxi: 3, go: "About 3 min by Grab (Google's estimate), the closest of the group by car.", budget: "฿250-500" },
      { n: "Have A Zeed - Central Rama 9", ph: "🍛", type: "Thai restaurant", rating: 4.5, reviews: 214, taxi: 4, walk: "inside Central Rama 9, about a 4-min walk", go: "Inside Central Rama 9, a 4-minute walk (~250 m) from the hotel.", budget: "฿150-350" },
      { n: "MUGI - The Prom Din Daeng", ph: "🍣", type: "Japanese restaurant", rating: 5.0, reviews: 170, taxi: 11, go: "About 11 min by Grab (Google's estimate). Perfect score but fewer reviews.", budget: "฿300-700" }
    ],
    find: [
      { n: "Pubs & bars", icon: "🍺", q: "pub bar near", budget: "฿400-1,000" },
      { n: "Rooftop bars", icon: "🌃", q: "rooftop bar near", budget: "฿800-2,000+" },
      { n: "Cocktail bars", icon: "🍸", q: "cocktail bar near", budget: "฿500-1,200" },
      { n: "Chill cafés", icon: "☕", q: "cafe near", budget: "฿100-250" },
      { n: "Live music", icon: "🎶", q: "live music bar near", budget: "฿400-900" },
      { n: "Late-night food", icon: "🍜", q: "late night food near", budget: "฿100-300" }
    ],
    districts: [
      { n: "Asok / Sukhumvit", photo: "district-asok", icon: "🏙️", how: "MRT Phra Ram 9 → Sukhumvit (BL22), about 10 min. BTS Asok and Terminal 21 are right there.", budget: "฿500-1,200", note: "The closest big nightlife and dining area." },
      { n: "Thonglor & Ekkamai", photo: "district-thonglor", icon: "🥂", how: "MRT to Sukhumvit (BL22), change to BTS Asok, then BTS to Thong Lo (E6), about 35-45 min in total. Grab is faster late at night.", budget: "฿600-1,500", note: "Trendier bars, cocktail spots and cafés." },
      { n: "Silom / Sala Daeng", photo: "district-silom", icon: "🌆", how: "MRT straight to Silom (BL26), about 20 min, no change. BTS Sala Daeng is the interchange.", budget: "฿500-1,200", note: "Pubs and bars near Lumphini Park and Silom." }
    ],
    tips: [
      "Trains run roughly 05:30-00:00 🔎, so plan to take a Grab home late. Tap Home > Show to taxi driver for the hotel's Thai address card.",
      "In Google Maps, use the Rating filter (4.5+), Open now, and Popular times to pick a place at the right moment.",
      "Budgets are per person and approximate. Rooftop bars add up fast; check prices on the Maps listing."
    ]
  },
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
