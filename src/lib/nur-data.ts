export type Imam = {
  id: string;
  name: string;
  country: string;
  flag: string;
  audio: string;
  fallbackAudio?: string;
};

export function getImamCountry(t: Record<string, string>, imam: Imam): string {
  switch (imam.id) {
    case "makkah":
    case "madinah":
      return t.countrySa || imam.country;
    case "mishary":
      return t.countryKw || imam.country;
    case "hafiz":
      return t.countryTr || imam.country;
    case "egypt":
      return t.countryEg || imam.country;
    case "aqsa":
      return t.countryPs || imam.country;
    default:
      return imam.country;
  }
}

/** Verified high-availability adhan audio streams */
export const IMAMS: Imam[] = [
  {
    id: "makkah",
    name: "Masjid al-Haram",
    country: "Arabie saoudite",
    flag: "🇸🇦",
    audio: "https://www.islamcan.com/audio/adhan/azan1.mp3",
    fallbackAudio: "https://www.islamcan.com/audio/adhan/azan2.mp3",
  },
  {
    id: "madinah",
    name: "Masjid an-Nabawi",
    country: "Arabie saoudite",
    flag: "🇸🇦",
    audio: "https://www.islamcan.com/audio/adhan/azan2.mp3",
    fallbackAudio: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  },
  {
    id: "mishary",
    name: "Mishary Al-Afasy",
    country: "Koweït",
    flag: "🇰🇼",
    audio: "https://www.islamcan.com/audio/adhan/azan4.mp3",
    fallbackAudio: "https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3",
  },
  {
    id: "hafiz",
    name: "Hafiz Mustafa Özcan",
    country: "Turquie",
    flag: "🇹🇷",
    audio: "https://www.islamcan.com/audio/adhan/azan6.mp3",
    fallbackAudio: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  },
  {
    id: "egypt",
    name: "Muhammad Rifat / Abdul Basit",
    country: "Égypte",
    flag: "🇪🇬",
    audio: "https://www.islamcan.com/audio/adhan/azan5.mp3",
    fallbackAudio: "https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/1.mp3",
  },
  {
    id: "aqsa",
    name: "Masjid al-Aqsa",
    country: "Palestine",
    flag: "🇵🇸",
    audio: "https://www.islamcan.com/audio/adhan/azan3.mp3",
    fallbackAudio: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  },
];

/** One unique pictogram key per invocation. */
export type InvocationIcon =
  | "sunrise"
  | "utensils"
  | "heart"
  | "door-out"
  | "door-in"
  | "shield"
  | "moon"
  | "sparkles"
  | "plane"
  | "hands"
  | "wc-in"
  | "wc-out"
  | "wudu"
  | "wudu-after"
  | "shirt-off"
  | "shirt-on"
  | "shower"
  | "mosque-in"
  | "mosque-out"
  | "prayer"
  | "quran"
  | "tasbih"
  | "kaaba"
  | "rain"
  | "wind"
  | "thunder"
  | "sun"
  | "night"
  | "mirror"
  | "market"
  | "money"
  | "car"
  | "sick"
  | "grief"
  | "anger"
  | "debt"
  | "study"
  | "gift"
  | "child"
  | "marriage"
  | "guest"
  | "sneeze"
  | "fear"
  | "cemetery"
  | "drink"
  | "fasting-break"
  | "new-moon"
  | "friday";

export type Invocation = {
  title: string;
  arabic: string;
  translit: string;
  fr: string;
  icon: InvocationIcon;
};

export const INVOCATIONS: Invocation[] = [
  {
    title: "Au réveil",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    translit: "Alhamdu lillahi alladhi ahyana ba'da ma amatana wa ilayhi-n-nushur",
    fr: "Louange à Allah qui nous a rendu la vie après nous avoir fait mourir, et c'est vers Lui qu'est la résurrection.",
    icon: "sunrise",
  },
  {
    title: "Avant de manger",
    arabic: "بِسْمِ اللَّهِ",
    translit: "Bismillah",
    fr: "Au nom d'Allah.",
    icon: "utensils",
  },
  {
    title: "Après le repas",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ",
    translit: "Alhamdu lillahi alladhi at'amani hadha wa razaqanih",
    fr: "Louange à Allah qui m'a nourri de cela et me l'a accordé.",
    icon: "heart",
  },
  {
    title: "En sortant de chez soi",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    translit: "Bismillah, tawakkaltu 'ala-llah, wa la hawla wa la quwwata illa billah",
    fr: "Au nom d'Allah, je place ma confiance en Allah ; il n'y a de force ni de puissance qu'en Allah.",
    icon: "door-out",
  },
  {
    title: "En entrant chez soi",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    translit: "Bismillahi walajna wa bismillahi kharajna wa 'ala rabbina tawakkalna",
    fr: "Au nom d'Allah nous entrons, au nom d'Allah nous sortons, et en notre Seigneur nous plaçons notre confiance.",
    icon: "door-in",
  },
  {
    title: "Contre l'anxiété",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    translit: "Hasbuna-llahu wa ni'ma-l-wakil",
    fr: "Allah nous suffit, et quel excellent protecteur !",
    icon: "shield",
  },
  {
    title: "Avant de dormir",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    translit: "Bismika Allahumma amutu wa ahya",
    fr: "En Ton nom, ô Allah, je meurs et je vis.",
    icon: "moon",
  },
  {
    title: "Demande de pardon",
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
    translit: "Astaghfiru-llaha-l-'azim wa atubu ilayh",
    fr: "Je demande pardon à Allah l'Immense et je reviens à Lui repentant.",
    icon: "sparkles",
  },
  {
    title: "En voyage",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    translit: "Subhana-lladhi sakhkhara lana hadha wa ma kunna lahu muqrinin",
    fr: "Gloire à Celui qui a mis cela à notre service, alors que nous n'aurions pu le dominer.",
    icon: "plane",
  },
  {
    title: "Pour quelqu'un qui a porté des habits",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    translit:
      "Al-hamdu lillahil-ladhi kasani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    fr: "Louange à Allah qui m'a vêtu de ceci et me l'a accordé sans force ni puissance de ma part.",
    icon: "shirt-on",
  },
  {
    title: "Avant de se déshabiller",
    arabic: "بِسْمِ اللَّهِ",
    translit: "Bismillah",
    fr: "Au nom d'Allah.",
    icon: "shirt-off",
  },
  {
    title: "Avant d'entrer aux toilettes",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ",
    translit: "Allahumma inni a'udhu bika minal-khubthi wal-khaba'ith",
    fr: "Ô Allah, je Te demande protection contre les mauvais et les mauvaises (esprits).",
    icon: "wc-in",
  },
  {
    title: "En sortant des toilettes",
    arabic: "غُفْرَانَكَ",
    translit: "Ghufranaka",
    fr: "Je demande Ton pardon.",
    icon: "wc-out",
  },
  {
    title: "Au début des ablutions",
    arabic: "بِسْمِ اللَّهِ",
    translit: "Bismillah",
    fr: "Au nom d'Allah.",
    icon: "wudu",
  },
  {
    title: "Après les ablutions",
    arabic:
      "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    translit:
      "Ash-hadu an la ilaha illa Allahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    fr: "J'atteste qu'il n'y a de divinité qu'Allah, Seul, sans associé, et que Muhammad est Son serviteur et Messager.",
    icon: "wudu-after",
  },
  {
    title: "Avant le bain rituel",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    translit: "Bismillahi-r-Rahmani-r-Rahim",
    fr: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
    icon: "shower",
  },
  {
    title: "En entrant à la mosquée",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    translit: "Allahumma-ftah li abwaba rahmatik",
    fr: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
    icon: "mosque-in",
  },
  {
    title: "En sortant de la mosquée",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    translit: "Allahumma inni as'aluka min fadlik",
    fr: "Ô Allah, je Te demande de Ta grâce.",
    icon: "mosque-out",
  },
  {
    title: "Après la prière",
    arabic: "أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ",
    translit: "Astaghfirullah, Allahumma anta-s-Salam wa minka-s-salam",
    fr: "Je demande pardon à Allah. Ô Allah, Tu es la Paix et de Toi vient la paix.",
    icon: "prayer",
  },
  {
    title: "Avant de lire le Coran",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    translit: "A'udhu billahi mina-sh-shaytani-r-rajim",
    fr: "Je cherche protection auprès d'Allah contre Satan le maudit.",
    icon: "quran",
  },
  {
    title: "Dhikr du matin et du soir",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    translit: "Subhana-llahi wa bihamdih, subhana-llahi-l-'azim",
    fr: "Gloire et louange à Allah, gloire à Allah l'Immense.",
    icon: "tasbih",
  },
  {
    title: "En voyant la Kaaba",
    arabic: "اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا",
    translit: "Allahumma zid hadha-l-bayta tashrifan wa ta'ziman",
    fr: "Ô Allah, accorde à cette Maison davantage d'honneur et de grandeur.",
    icon: "kaaba",
  },
  {
    title: "Quand il pleut",
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    translit: "Allahumma sayyiban nafi'an",
    fr: "Ô Allah, fais que ce soit une pluie bienfaisante.",
    icon: "rain",
  },
  {
    title: "Quand le vent souffle",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَأَعُوذُ بِكَ مِنْ شَرِّهَا",
    translit: "Allahumma inni as'aluka khayraha wa a'udhu bika min sharriha",
    fr: "Ô Allah, je Te demande son bien et je me protège auprès de Toi de son mal.",
    icon: "wind",
  },
  {
    title: "En entendant le tonnerre",
    arabic: "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ",
    translit: "Subhana-lladhi yusabbihu-r-ra'du bihamdihi wal-mala'ikatu min khifatih",
    fr: "Gloire à Celui que le tonnerre glorifie par Sa louange, ainsi que les anges par crainte de Lui.",
    icon: "thunder",
  },
  {
    title: "Le matin",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
    translit: "Asbahna wa asbaha-l-mulku lillah",
    fr: "Nous voici au matin, et la royauté appartient à Allah.",
    icon: "sun",
  },
  {
    title: "Le soir",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
    translit: "Amsayna wa amsa-l-mulku lillah",
    fr: "Nous voici au soir, et la royauté appartient à Allah.",
    icon: "night",
  },
  {
    title: "En se regardant dans le miroir",
    arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
    translit: "Allahumma kama hassanta khalqi fahassin khuluqi",
    fr: "Ô Allah, de même que Tu as embelli ma création, embellis mon comportement.",
    icon: "mirror",
  },
  {
    title: "En entrant au marché",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ",
    translit: "La ilaha illa-llahu wahdahu la sharika lah, lahu-l-mulku wa lahu-l-hamd",
    fr: "Il n'y a de divinité qu'Allah, Seul, sans associé ; à Lui la royauté et la louange.",
    icon: "market",
  },
  {
    title: "Pour un bien matériel accordé",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا",
    translit: "Allahumma barik lana fima razaqtana",
    fr: "Ô Allah, bénis-nous dans ce que Tu nous as accordé.",
    icon: "money",
  },
  {
    title: "En montant dans un véhicule",
    arabic: "الْحَمْدُ لِلَّهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا",
    translit: "Alhamdu lillah, subhana-lladhi sakhkhara lana hadha",
    fr: "Louange à Allah, gloire à Celui qui a mis cela à notre service.",
    icon: "car",
  },
  {
    title: "Pour le malade",
    arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    translit: "La ba'sa, tahurun in sha'a Allah",
    fr: "Aucun mal, c'est une purification si Allah le veut.",
    icon: "sick",
  },
  {
    title: "En cas de malheur",
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    translit: "Inna lillahi wa inna ilayhi raji'un",
    fr: "Nous sommes à Allah et c'est à Lui que nous retournons.",
    icon: "grief",
  },
  {
    title: "Contre la colère",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    translit: "A'udhu billahi mina-sh-shaytani-r-rajim",
    fr: "Je cherche protection auprès d'Allah contre Satan le maudit.",
    icon: "anger",
  },
  {
    title: "Contre les dettes",
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    translit: "Allahumma-kfini bihalalika 'an haramik, wa aghnini bifadlika 'amman siwak",
    fr: "Ô Allah, suffis-moi par ce que Tu as rendu licite au lieu de l'illicite, et enrichis-moi de Ta grâce.",
    icon: "debt",
  },
  {
    title: "Pour la science",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    translit: "Rabbi zidni 'ilman",
    fr: "Seigneur, augmente-moi en science.",
    icon: "study",
  },
  {
    title: "Remercier un bienfaiteur",
    arabic: "جَزَاكَ اللَّهُ خَيْرًا",
    translit: "Jazaka-llahu khayran",
    fr: "Qu'Allah te récompense par un bien.",
    icon: "gift",
  },
  {
    title: "Pour protéger les enfants",
    arabic: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ",
    translit: "U'idhukuma bikalimati-llahi-t-tammati min kulli shaytanin wa hammah",
    fr: "Je vous place sous la protection des paroles parfaites d'Allah contre tout démon et toute nuisance.",
    icon: "child",
  },
  {
    title: "Féliciter les mariés",
    arabic: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    translit: "Baraka-llahu laka wa baraka 'alayka wa jama'a baynakuma fi khayr",
    fr: "Qu'Allah te bénisse, répande Sa bénédiction sur toi et vous unisse dans le bien.",
    icon: "marriage",
  },
  {
    title: "Pour l'hôte qui a nourri",
    arabic: "اللَّهُمَّ أَطْعِمْ مَنْ أَطْعَمَنِي وَاسْقِ مَنْ سَقَانِي",
    translit: "Allahumma at'im man at'amani wasqi man saqani",
    fr: "Ô Allah, nourris celui qui m'a nourri et abreuve celui qui m'a abreuvé.",
    icon: "guest",
  },
  {
    title: "Quand on éternue",
    arabic: "الْحَمْدُ لِلَّهِ — يَرْحَمُكَ اللَّهُ",
    translit: "Alhamdu lillah — Yarhamuka-llah",
    fr: "Louange à Allah — Qu'Allah te fasse miséricorde.",
    icon: "sneeze",
  },
  {
    title: "Contre la peur",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    translit: "A'udhu bikalimati-llahi-t-tammati min sharri ma khalaq",
    fr: "Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
    icon: "fear",
  },
  {
    title: "En visitant les tombes",
    arabic: "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ",
    translit: "As-salamu 'alaykum ahla-d-diyari mina-l-mu'minin",
    fr: "Que la paix soit sur vous, habitants de ces demeures parmi les croyants.",
    icon: "cemetery",
  },
  {
    title: "Après avoir bu du lait",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ",
    translit: "Allahumma barik lana fihi wa zidna minh",
    fr: "Ô Allah, bénis-le pour nous et augmente-nous-en.",
    icon: "drink",
  },
  {
    title: "En rompant le jeûne",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    translit: "Dhahaba-z-zama'u wabtallati-l-'uruqu wa thabata-l-ajru in sha'a Allah",
    fr: "La soif est partie, les veines sont irriguées et la récompense est acquise si Allah le veut.",
    icon: "fasting-break",
  },
  {
    title: "En voyant le croissant de lune",
    arabic: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ",
    translit: "Allahumma ahillahu 'alayna bil-yumni wal-iman",
    fr: "Ô Allah, fais que ce croissant se lève sur nous avec bénédiction et foi.",
    icon: "new-moon",
  },
  {
    title: "Le vendredi",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    translit: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad",
    fr: "Ô Allah, prie sur Muhammad et sur la famille de Muhammad.",
    icon: "friday",
  },
];

export type SurahRef = { n: number; name: string; arabic: string; duration?: string };

export const SURAH_CATEGORIES: {
  key: "soothing" | "powerful" | "calm" | "catMoving" | "catPowerful" | "catCalm";
  title: string;
  subtitle: string;
  items: SurahRef[];
}[] = [
  {
    key: "soothing",
    title: "🌿 Très émouvantes et apaisantes",
    subtitle: "Des sourates qui apportent sérénité, espoir et réconfort.",
    items: [
      { n: 19, name: "Maryam", arabic: "مريم", duration: "15:30" },
      { n: 93, name: "Ad-Duha", arabic: "الضحى", duration: "01:45" },
      { n: 94, name: "Ash-Sharh", arabic: "الشرح", duration: "01:20" },
      { n: 55, name: "Ar-Rahman", arabic: "الرحمن", duration: "09:40" },
      { n: 56, name: "Al-Waqi'ah", arabic: "الواقعة", duration: "08:15" },
      { n: 36, name: "Yasin", arabic: "يس", duration: "14:20" },
      { n: 76, name: "Al-Insan", arabic: "الإنسان", duration: "05:50" },
      { n: 39, name: "Az-Zumar", arabic: "الزمر", duration: "22:10" },
      { n: 89, name: "Al-Fajr", arabic: "الفجر", duration: "04:15" },
      { n: 13, name: "Ar-Ra'd", arabic: "الرعد", duration: "13:45" },
    ],
  },
  {
    key: "powerful",
    title: "⚡ Très puissantes et impressionnantes",
    subtitle: "Des sourates qui rappellent la grandeur et la puissance de la création d'Allah.",
    items: [
      { n: 67, name: "Al-Mulk", arabic: "الملك", duration: "07:15" },
      { n: 75, name: "Al-Qiyamah", arabic: "القيامة", duration: "03:40" },
      { n: 69, name: "Al-Haqqah", arabic: "الحاقة", duration: "05:20" },
      { n: 88, name: "Al-Ghashiyah", arabic: "الغاشية", duration: "02:30" },
      { n: 81, name: "At-Takwir", arabic: "التكوير", duration: "02:10" },
      { n: 78, name: "An-Naba", arabic: "النبأ", duration: "04:30" },
      { n: 101, name: "Al-Qari'ah", arabic: "القارعة", duration: "01:10" },
      { n: 99, name: "Az-Zalzalah", arabic: "الزلزلة", duration: "01:00" },
      { n: 82, name: "Al-Infitar", arabic: "الانفطار", duration: "01:50" },
      { n: 77, name: "Al-Mursalat", arabic: "المرسلات", duration: "04:45" },
    ],
  },
  {
    key: "calm",
    title: "🌙 Pour se calmer et réfléchir",
    subtitle: "Des sourates qui invitent à la méditation, au calme et à la réflexion.",
    items: [
      { n: 18, name: "Al-Kahf", arabic: "الكهف", duration: "28:50" },
      { n: 12, name: "Yusuf", arabic: "يوسف", duration: "29:10" },
      { n: 20, name: "Taha", arabic: "طه", duration: "18:30" },
      { n: 21, name: "Al-Anbiya", arabic: "الأنبياء", duration: "16:40" },
      { n: 84, name: "Al-Inshiqaq", arabic: "الانشقاق", duration: "02:20" },
      { n: 31, name: "Luqman", arabic: "لقمان", duration: "08:35" },
      { n: 14, name: "Ibrahim", arabic: "إبراهيم", duration: "12:15" },
      { n: 59, name: "Al-Hashr", arabic: "الحشر", duration: "09:25" },
      { n: 17, name: "Al-Isra", arabic: "الإسراء", duration: "21:05" },
      { n: 41, name: "Fussilat", arabic: "فصلت", duration: "14:10" },
    ],
  },
];

export const NAMES_OF_ALLAH: { arabic: string; translit: string; fr: string }[] = [
  { arabic: "الرَّحْمَنُ", translit: "Ar-Rahman", fr: "Le Tout Miséricordieux" },
  { arabic: "الرَّحِيمُ", translit: "Ar-Rahim", fr: "Le Très Miséricordieux" },
  { arabic: "الْمَلِكُ", translit: "Al-Malik", fr: "Le Souverain" },
  { arabic: "الْقُدُّوسُ", translit: "Al-Quddus", fr: "Le Pur" },
  { arabic: "السَّلاَمُ", translit: "As-Salam", fr: "La Paix" },
  { arabic: "الْمُؤْمِنُ", translit: "Al-Mu'min", fr: "Le Rassurant" },
  { arabic: "الْمُهَيْمِنُ", translit: "Al-Muhaymin", fr: "Le Vigilant" },
  { arabic: "الْعَزِيزُ", translit: "Al-'Aziz", fr: "Le Tout-Puissant" },
  { arabic: "الْجَبَّارُ", translit: "Al-Jabbar", fr: "Le Contraignant" },
  { arabic: "الْمُتَكَبِّرُ", translit: "Al-Mutakabbir", fr: "Le Superbe" },
  { arabic: "الْخَالِقُ", translit: "Al-Khaliq", fr: "Le Créateur" },
  { arabic: "الْبَارِئُ", translit: "Al-Bari'", fr: "Celui qui donne un commencement" },
  { arabic: "الْمُصَوِّرُ", translit: "Al-Musawwir", fr: "Le Formateur" },
  { arabic: "الْغَفَّارُ", translit: "Al-Ghaffar", fr: "Le Grand Pardonneur" },
  { arabic: "الْقَهَّارُ", translit: "Al-Qahhar", fr: "Le Dominateur" },
  { arabic: "الْوَهَّابُ", translit: "Al-Wahhab", fr: "Le Donateur" },
  { arabic: "الرَّزَّاقُ", translit: "Ar-Razzaq", fr: "Le Pourvoyeur" },
  { arabic: "الْفَتَّاحُ", translit: "Al-Fattah", fr: "Celui qui ouvre" },
  { arabic: "اَلْعَلِيمُ", translit: "Al-'Alim", fr: "L'Omniscient" },
  { arabic: "الْقَابِضُ", translit: "Al-Qabid", fr: "Celui qui restreint" },
  { arabic: "الْبَاسِطُ", translit: "Al-Basit", fr: "Celui qui étend" },
  { arabic: "الْخَافِضُ", translit: "Al-Khafid", fr: "Celui qui abaisse" },
  { arabic: "الرَّافِعُ", translit: "Ar-Rafi'", fr: "Celui qui élève" },
  { arabic: "الْمُعِزُّ", translit: "Al-Mu'izz", fr: "Celui qui honore" },
  { arabic: "المُذِلُّ", translit: "Al-Mudhill", fr: "Celui qui humilie" },
  { arabic: "السَّمِيعُ", translit: "As-Sami'", fr: "Celui qui entend tout" },
  { arabic: "الْبَصِيرُ", translit: "Al-Basir", fr: "Celui qui voit tout" },
  { arabic: "الْحَكَمُ", translit: "Al-Hakam", fr: "Le Juge" },
  { arabic: "الْعَدْلُ", translit: "Al-'Adl", fr: "Le Juste" },
  { arabic: "اللَّطِيفُ", translit: "Al-Latif", fr: "Le Subtil bienveillant" },
  { arabic: "الْخَبِيرُ", translit: "Al-Khabir", fr: "Le Parfaitement informé" },
  { arabic: "الْحَلِيمُ", translit: "Al-Halim", fr: "Le Longanime" },
  { arabic: "الْعَظِيمُ", translit: "Al-'Azim", fr: "L'Immense" },
  { arabic: "الْغَفُورُ", translit: "Al-Ghafur", fr: "Le Pardonneur" },
  { arabic: "الشَّكُورُ", translit: "Ash-Shakur", fr: "Le Très Reconnaissant" },
  { arabic: "الْعَلِيُّ", translit: "Al-'Ali", fr: "Le Très Haut" },
  { arabic: "الْكَبِيرُ", translit: "Al-Kabir", fr: "Le Très Grand" },
  { arabic: "الْحَفِيظُ", translit: "Al-Hafiz", fr: "Le Gardien" },
  { arabic: "المُقِيتُ", translit: "Al-Muqit", fr: "Celui qui nourrit" },
  { arabic: "الْحسِيبُ", translit: "Al-Hasib", fr: "Celui qui tient compte de tout" },
  { arabic: "الْجَلِيلُ", translit: "Al-Jalil", fr: "Le Majestueux" },
  { arabic: "الْكَرِيمُ", translit: "Al-Karim", fr: "Le Généreux" },
  { arabic: "الرَّقِيبُ", translit: "Ar-Raqib", fr: "L'Observateur" },
  { arabic: "الْمُجِيبُ", translit: "Al-Mujib", fr: "Celui qui exauce" },
  { arabic: "الْوَاسِعُ", translit: "Al-Wasi'", fr: "L'Immensément vaste" },
  { arabic: "الْحَكِيمُ", translit: "Al-Hakim", fr: "Le Sage" },
  { arabic: "الْوَدُودُ", translit: "Al-Wadud", fr: "Le Bien-Aimant" },
  { arabic: "الْمَجِيدُ", translit: "Al-Majid", fr: "Le Glorieux" },
  { arabic: "الْبَاعِثُ", translit: "Al-Ba'ith", fr: "Celui qui ressuscite" },
  { arabic: "الشَّهِيدُ", translit: "Ash-Shahid", fr: "Le Témoin" },
  { arabic: "الْحَقُّ", translit: "Al-Haqq", fr: "La Vérité" },
  { arabic: "الْوَكِيلُ", translit: "Al-Wakil", fr: "Le Garant" },
  { arabic: "الْقَوِيُّ", translit: "Al-Qawiyy", fr: "Le Très Fort" },
  { arabic: "الْمَتِينُ", translit: "Al-Matin", fr: "L'Inébranlable" },
  { arabic: "الْوَلِيُّ", translit: "Al-Wali", fr: "L'Allié protecteur" },
  { arabic: "الْحَمِيدُ", translit: "Al-Hamid", fr: "Le Digne de louange" },
  { arabic: "الْمُحْصِي", translit: "Al-Muhsi", fr: "Celui qui dénombre tout" },
  { arabic: "الْمُبْدِئُ", translit: "Al-Mubdi'", fr: "Celui qui initie" },
  { arabic: "الْمُعِيدُ", translit: "Al-Mu'id", fr: "Celui qui recommence" },
  { arabic: "الْمُحْيِي", translit: "Al-Muhyi", fr: "Celui qui donne la vie" },
  { arabic: "الْمُمِيتُ", translit: "Al-Mumit", fr: "Celui qui donne la mort" },
  { arabic: "الْحَيُّ", translit: "Al-Hayy", fr: "Le Vivant" },
  { arabic: "الْقَيُّومُ", translit: "Al-Qayyum", fr: "Celui qui subsiste par Lui-même" },
  { arabic: "الْوَاجِدُ", translit: "Al-Wajid", fr: "Celui qui trouve tout" },
  { arabic: "الْمَاجِدُ", translit: "Al-Majid", fr: "Le Noble" },
  { arabic: "الْواحِدُ", translit: "Al-Wahid", fr: "L'Unique" },
  { arabic: "الأَحَدُ", translit: "Al-Ahad", fr: "L'Un" },
  { arabic: "الصَّمَدُ", translit: "As-Samad", fr: "Le Soutien universel" },
  { arabic: "الْقَادِرُ", translit: "Al-Qadir", fr: "Le Capable" },
  { arabic: "الْمُقْتَدِرُ", translit: "Al-Muqtadir", fr: "Le Tout-Déterminant" },
  { arabic: "الْمُقَدِّمُ", translit: "Al-Muqaddim", fr: "Celui qui fait avancer" },
  { arabic: "الْمُؤَخِّرُ", translit: "Al-Mu'akhkhir", fr: "Celui qui retarde" },
  { arabic: "الأوَّلُ", translit: "Al-Awwal", fr: "Le Premier" },
  { arabic: "الآخِرُ", translit: "Al-Akhir", fr: "Le Dernier" },
  { arabic: "الظَّاهِرُ", translit: "Az-Zahir", fr: "L'Apparent" },
  { arabic: "الْبَاطِنُ", translit: "Al-Batin", fr: "Le Caché" },
  { arabic: "الْوَالِي", translit: "Al-Wali", fr: "Le Maître souverain" },
  { arabic: "الْمُتَعَالِي", translit: "Al-Muta'ali", fr: "Le Sublime" },
  { arabic: "الْبَرُّ", translit: "Al-Barr", fr: "Le Bienfaisant" },
  { arabic: "التَّوَابُ", translit: "At-Tawwab", fr: "Celui qui accueille le repentir" },
  { arabic: "الْمُنْتَقِمُ", translit: "Al-Muntaqim", fr: "Le Vengeur" },
  { arabic: "العَفُوُّ", translit: "Al-'Afuww", fr: "Celui qui efface les péchés" },
  { arabic: "الرَّؤُوفُ", translit: "Ar-Ra'uf", fr: "Le Tout Compatissant" },
  { arabic: "مَالِكُ الْمُلْكِ", translit: "Malik-ul-Mulk", fr: "Le Roi de la royauté" },
  {
    arabic: "ذُوالْجَلاَلِ وَالإكْرَامِ",
    translit: "Dhul-Jalali wal-Ikram",
    fr: "Le Détenteur de la majesté et de la générosité",
  },
  { arabic: "الْمُقْسِطُ", translit: "Al-Muqsit", fr: "L'Équitable" },
  { arabic: "الْجَامِعُ", translit: "Al-Jami'", fr: "Celui qui rassemble" },
  { arabic: "الْغَنِيُّ", translit: "Al-Ghani", fr: "Le Riche par Lui-même" },
  { arabic: "الْمُغْنِي", translit: "Al-Mughni", fr: "Celui qui enrichit" },
  { arabic: "اَلْمَانِعُ", translit: "Al-Mani'", fr: "Celui qui préserve" },
  { arabic: "الضَّارُ", translit: "Ad-Darr", fr: "Celui qui peut nuire" },
  { arabic: "النَّافِعُ", translit: "An-Nafi'", fr: "Celui qui est utile" },
  { arabic: "النُّورُ", translit: "An-Nur", fr: "La Lumière" },
  { arabic: "الْهَادِي", translit: "Al-Hadi", fr: "Le Guide" },
  { arabic: "الْبَدِيعُ", translit: "Al-Badi'", fr: "Le Novateur" },
  { arabic: "الْبَاقِي", translit: "Al-Baqi", fr: "L'Éternel" },
  { arabic: "الْوَارِثُ", translit: "Al-Warith", fr: "L'Héritier" },
  { arabic: "الرَّشِيدُ", translit: "Ar-Rashid", fr: "Le Guide infaillible" },
  { arabic: "الصَّبُورُ", translit: "As-Sabur", fr: "Le Patient" },
];

export const HALAL_GUIDE: { title: string; lines: string[] }[] = [
  {
    title: "1. Lire la liste des ingrédients",
    lines: [
      "Cherchez tout ingrédient d'origine animale : gélatine, présure, graisse, saindoux, bouillon.",
      "Vérifiez les additifs E : E120 (cochenille), E441 (gélatine), E471/E472 (mono- et diglycérides), E542, E904 (gomme-laque).",
      "Les arômes « naturels » peuvent contenir de l'alcool : ils sont douteux sans précision du fabricant.",
    ],
  },
  {
    title: "2. Repérer l'alcool",
    lines: [
      "Éthanol, alcool éthylique, vinaigre de vin, extrait de vanille alcoolisé, liqueur.",
      "L'alcool utilisé comme support d'arôme reste douteux tant que le taux résiduel n'est pas connu.",
    ],
  },
  {
    title: "3. Vérifier la viande et l'abattage",
    lines: [
      "Une viande n'est halal que si l'animal a été abattu rituellement au nom d'Allah.",
      "« Sans porc » ne veut pas dire halal : le mode d'abattage compte autant que l'espèce.",
    ],
  },
  {
    title: "4. Chercher une certification reconnue",
    lines: [
      "Logos fiables : LPPOM MUI (Indonésie), JAKIM (Malaisie), HFA, AVS, HMC, SFCVH.",
      "Un logo « halal » sans organisme certificateur nommé n'a pas de valeur.",
      "Vérifiez que le numéro de certificat est encore valide sur le site de l'organisme.",
    ],
  },
  {
    title: "5. Attention aux contaminations croisées",
    lines: [
      "Une même ligne de production peut traiter porc et gélatine animale.",
      "La mention « peut contenir » concerne aussi les dérivés animaux.",
    ],
  },
  {
    title: "6. En cas de doute",
    lines: [
      "Contactez le fabricant : la composition exacte des additifs est une information communicable.",
      "Le Prophète ﷺ a dit : « Laisse ce qui te fait douter pour ce qui ne te fait pas douter. »",
      "Cet outil est une aide à la décision, il ne remplace pas l'avis d'un savant.",
    ],
  },
];

/* ---------- Invocation categories (4 groups) ---------- */
export type InvCategoryKey = "daily" | "worship" | "protection" | "events";

export const INV_CATEGORIES: {
  key: InvCategoryKey;
  label: string;
  emoji: string;
  icons: InvocationIcon[];
}[] = [
  {
    key: "daily",
    label: "Quotidien",
    emoji: "🌅",
    icons: [
      "sunrise",
      "utensils",
      "drink",
      "door-out",
      "door-in",
      "moon",
      "night",
      "sun",
      "wc-in",
      "wc-out",
      "shirt-on",
      "shirt-off",
      "mirror",
      "guest",
    ],
  },
  {
    key: "worship",
    label: "Adorations",
    emoji: "🕌",
    icons: [
      "wudu",
      "wudu-after",
      "shower",
      "mosque-in",
      "mosque-out",
      "prayer",
      "quran",
      "tasbih",
      "kaaba",
      "hands",
      "sparkles",
    ],
  },
  {
    key: "protection",
    label: "Protection et situations",
    emoji: "🛡️",
    icons: [
      "shield",
      "heart",
      "fear",
      "anger",
      "grief",
      "sick",
      "debt",
      "plane",
      "car",
      "market",
      "money",
      "study",
      "child",
      "cemetery",
    ],
  },
  {
    key: "events",
    label: "Événements et nature",
    emoji: "🌙",
    icons: [
      "rain",
      "wind",
      "thunder",
      "new-moon",
      "friday",
      "marriage",
      "gift",
      "sneeze",
      "fasting-break",
    ],
  },
];

export function invocationsOf(key: InvCategoryKey): Invocation[] {
  const cat = INV_CATEGORIES.find((c) => c.key === key);
  if (!cat) return [];
  return INVOCATIONS.filter((i) => cat.icons.includes(i.icon));
}
