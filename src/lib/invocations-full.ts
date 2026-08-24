import morningImg from "@/assets/inv-morning.jpg";
import wakingImg from "@/assets/images/inv_waking_1785598815604.jpg";
import nightImg from "@/assets/inv-night.jpg";
import quranImg from "@/assets/inv-quran.jpg";
import travelImg from "@/assets/inv-travel.jpg";
import homeImg from "@/assets/inv-home.jpg";
import duaImg from "@/assets/inv-dua.jpg";
import mosqueImg from "@/assets/mosque.jpg";

import sleepingImg from "@/assets/images/inv_sleeping_1785583861257.jpg";
import eatingImg from "@/assets/images/inv_eating_1785583872966.jpg";
import homeEntryImg from "@/assets/images/inv_home_entry_1785583883668.jpg";
import vehicleImg from "@/assets/images/inv_vehicle_1785583893337.jpg";
import kaabaImg from "@/assets/images/inv_kaaba_1785583907915.jpg";
import wuduImg from "@/assets/images/inv_wudu_1785583920890.jpg";
import fastingImg from "@/assets/images/inv_fasting_1785583931087.jpg";
import quranReadImg from "@/assets/images/inv_quran_1785583942283.jpg";
import mirrorImg from "@/assets/images/inv_mirror_1785583957573.jpg";
import sickImg from "@/assets/images/inv_sick_1785583970022.jpg";
import rainImg from "@/assets/images/inv_rain_1785583982012.jpg";
import quotidienCover from "@/assets/images/category_quotidien_1785582473894.jpg";
import adorationsCover from "@/assets/images/category_adorations_1785582491908.jpg";
import protectionCover from "@/assets/images/protection_card_cover_1785758739200.jpg";
import eventsCover from "@/assets/images/category_events_1785582524191.jpg";

import afterEatingImg from "@/assets/images/inv_after_eating.svg";
import undressingImg from "@/assets/images/inv_undressing.svg";
import sneezingImg from "@/assets/images/inv_sneezing.svg";
import homeExitImg from "@/assets/images/inv_home_exit_1785590373819.jpg";
import milkImg from "@/assets/images/inv_milk_1785590387764.jpg";
import afterPrayerImg from "@/assets/images/inv_after_prayer_1785590400568.jpg";
import fridayImg from "@/assets/images/inv_friday_1785590416974.jpg";
import anxietyImg from "@/assets/images/inv_anxiety_1785590428996.jpg";
import fearImg from "@/assets/images/inv_fear_1785590440719.jpg";
import debtImg from "@/assets/images/inv_debt_1785590452200.jpg";
import forgivenessImg from "@/assets/images/inv_forgiveness_1785590473429.jpg";
import childrenImg from "@/assets/images/inv_children_1785590485681.jpg";
import windImg from "@/assets/images/inv_wind_1785590498155.jpg";
import thunderImg from "@/assets/images/inv_thunder_1785590509464.jpg";
import marketImg from "@/assets/images/inv_market_1785590523344.jpg";
import moonCrescentImg from "@/assets/images/inv_moon_crescent_1785590536370.jpg";

import mosqueEntryUserImg from "@/assets/images/inv_entry_mosque_user_1785681675161.jpg";
import mosqueExitUserImg from "@/assets/images/inv_mosque_exit_user_1785679668854.jpg";
import fridayUserImg from "@/assets/images/inv_friday_user_1785679684866.jpg";
import quranReadUserImg from "@/assets/images/inv_quran_before_read_user_1785681716422.jpg";
import iftarUserImg from "@/assets/images/inv_iftar_user_1785681690110.jpg";
import kaabaViewUserImg from "@/assets/images/inv_kaaba_view_user_1785681705455.jpg";

import gravesUserImg from "@/assets/images/inv_graves_user_1785683061363.jpg";
import crescentUserImg from "@/assets/images/inv_crescent_user_1785683074236.jpg";
import marketUserImg from "@/assets/images/inv_market_user_1785683088427.jpg";
import thunderUserImg from "@/assets/images/inv_thunder_user_1785683100190.jpg";
import windUserImg from "@/assets/images/inv_wind_user_1785683114607.jpg";
import rainUserImg from "@/assets/images/inv_rain_user_1785683125354.jpg";

const enteringMosqueImg = mosqueEntryUserImg;
const leavingMosqueImg = mosqueExitUserImg;
const afterPrayerImgNew = afterPrayerImg;

const kaabaImgUser = kaabaViewUserImg;
const fastingImgUser = iftarUserImg;
const wuduBeforeImgUser = wuduImg;
const wuduAfterImgUser = wuduBeforeImgUser;
import ghuslImgUser from "@/assets/images/inv_ghusl_user.jpg";
import wcInImgUser from "@/assets/images/inv_wc_in_user.png";
import wcOutImgUser from "@/assets/images/inv_wc_out_user.png";

import anxietyImgUser from "@/assets/images/inv_anxiety_user.jpg";
import fearImgUser from "@/assets/images/inv_fear_user.jpg";
const angerImgUser = anxietyImgUser;
import debtImgUser from "@/assets/images/inv_debt_user.jpg";
import forgivenessImgUser from "@/assets/images/inv_forgiveness_user.jpg";
import sickImgUser from "@/assets/images/inv_sick_user.jpg";
import misfortuneImgUser from "@/assets/images/inv_misfortune_user.jpg";
const childrenImgUser = childrenImg;

export type InvocationCatKey = "daily" | "worship" | "protection" | "events";

export type InvocationItem = {
  id: string;
  catKey: InvocationCatKey;
  order: number;
  title: Record<string, string>;
  arabic: string;
  translit: string;
  translation: Record<string, string>;
  source: string;
  icon: string;
  image: string;
};

export const INVOCATION_CATEGORIES: {
  key: InvocationCatKey;
  label: Record<string, string>;
  bgGradient: string;
  bgColor: string;
  icon: string;
  coverImage: string;
}[] = [
  {
    key: "daily",
    label: {
      fr: "Quotidien",
      en: "Daily Life",
      ar: "اليومية",
      ps: "ورځنۍ غوښتنې",
      it: "Vita Quotidiana",
      ru: "Повседневные",
      fa: "روزمره",
    },
    bgGradient: "from-amber-400 via-orange-400 to-amber-500",
    bgColor: "#F97316",
    icon: "sunrise",
    coverImage: quotidienCover,
  },
  {
    key: "worship",
    label: {
      fr: "Adorations",
      en: "Acts of Worship",
      ar: "العبادات",
      ps: "عبادتونه",
      it: "Atti di Culto",
      ru: "Поклонение",
      fa: "عبادات",
    },
    bgGradient: "from-sky-400 via-blue-400 to-sky-500",
    bgColor: "#3B82F6",
    icon: "mosque",
    coverImage: adorationsCover,
  },
  {
    key: "protection",
    label: {
      fr: "Protection et situations",
      en: "Protection & Needs",
      ar: "الحماية والمواقف",
      ps: "ساتیری او حالات",
      it: "Protezione e Situazioni",
      ru: "Защита и ситуации",
      fa: "حفاظت و موقعیت‌ها",
    },
    bgGradient: "from-emerald-400 via-teal-500 to-emerald-600",
    bgColor: "#10B981",
    icon: "shield",
    coverImage: protectionCover,
  },
  {
    key: "events",
    label: {
      fr: "Événements et nature",
      en: "Events & Nature",
      ar: "المناسبات والطبيعة",
      ps: "پېښې او طبیعت",
      it: "Eventi e Natura",
      ru: "События и природа",
      fa: "حوادث و طبیعت",
    },
    bgGradient: "from-slate-500 via-indigo-600 to-slate-700",
    bgColor: "#475569",
    icon: "cloud-rain",
    coverImage: eventsCover,
  },
];

export const FULL_INVOCATIONS: InvocationItem[] = [
  // --- QUOTIDIEN (14 items) ---
  {
    id: "daily-1",
    catKey: "daily",
    order: 1,
    title: {
      fr: "Au réveil",
      en: "Upon Waking Up",
      ar: "عند الاستيقاظ",
      ps: "له خوبه د پاڅېدو مهال",
      it: "Al risveglio",
      ru: "При пробуждении",
      fa: "هنگام بیدار شدن",
    },
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    translit: "Alhamdu lillahi-lladhi ahyana ba'da ma amatana wa ilayhi-n-nushur",
    translation: {
      fr: "Louange à Allah qui nous a rendu la vie après nous avoir fait mourir, et c'est vers Lui qu'est la résurrection.",
      en: "Praise be to Allah Who brought us back to life after causing us to die, and unto Him is the resurrection.",
      ar: "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور.",
      ps: "ټولې ستاینې هغه الله لره دي چې موږ ته یې له مړینې وروسته بیرته ژوند راکړ او همغه لوري ته راژوندي کېدل دي.",
      it: "Lode ad Allah che ci ha ridato la vita dopo averci fatto morire, e a Lui è la resurrezione.",
      ru: "Хвала Аллаху, Который оживил нас после того, как умертвил нас, и к Нему предстоит воскрешение.",
      fa: "ستایش خدایی را که ما را پس از میراندن زنده کرد و رستاخیز به سوی اوست.",
    },
    source: "Bukhari, Muslim",
    icon: "sunrise",
    image: wakingImg,
  },
  {
    id: "daily-2",
    catKey: "daily",
    order: 2,
    title: {
      fr: "Avant de dormir",
      en: "Before Sleeping",
      ar: "قبل النوم",
      ps: "له بېدېدو وړاندې",
      it: "Prima di dormire",
      ru: "Перед сном",
      fa: "قبل از خوابیدن",
    },
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    translit: "Bismika Allahumma amutu wa ahya",
    translation: {
      fr: "En Ton nom, ô Allah, je meurs et je vis.",
      en: "In Your name, O Allah, I die and I live.",
      ar: "باسمك اللهم أموت وأحيا.",
      ps: "ستاسو په نوم ای الله! زه مرم او ژوندی کېږم.",
      it: "In Tuo nome, o Allah, muoio e vivo.",
      ru: "С Именем Твоим, о Аллах, я умираю и живу.",
      fa: "به نام تو ای خدا، می‌میرم و زنده می‌شوم.",
    },
    source: "Bukhari",
    icon: "moon",
    image: sleepingImg,
  },
  {
    id: "daily-3",
    catKey: "daily",
    order: 3,
    title: {
      fr: "Avant de manger",
      en: "Before Eating",
      ar: "قبل الأكل",
      ps: "له خوړو وړاندې",
      it: "Prima di mangiare",
      ru: "Перед едой",
      fa: "قبل از غذا خوردن",
    },
    arabic: "بِسْمِ اللَّهِ",
    translit: "Bismillah",
    translation: {
      fr: "Au nom d'Allah. (Et si l'on oublie au début: Bismillahi fi awwalihi wa akhirih)",
      en: "In the name of Allah. (If forgotten at start: In the name of Allah at its beginning and end)",
      ar: "بسم الله (وإذا نسي في أوله: بسم الله في أوله وآخره).",
      ps: "د الله په نامه. (که په پیل کې هېر شي: بسم الله في اوله وافره)",
      it: "Nel nome di Allah.",
      ru: "С именем Аллаха.",
      fa: "به نام خدا.",
    },
    source: "At-Tirmidhi, Abu Dawud",
    icon: "utensils",
    image: eatingImg,
  },
  {
    id: "daily-4",
    catKey: "daily",
    order: 4,
    title: {
      fr: "Après le repas",
      en: "After Eating",
      ar: "بعد الأكل",
      ps: "له خوړو وروسته",
      it: "Dopo il pasto",
      ru: "После еды",
      fa: "بعد از غذا خوردن",
    },
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    translit:
      "Alhamdu lillahi-lladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation: {
      fr: "Louange à Allah qui m'a nourri de cela et me l'a accordé sans force ni puissance de ma part.",
      en: "Praise be to Allah Who fed me this and provided it for me without any strength or power on my part.",
      ar: "الحمد لله الذي أطعمني هذا ورزقنيه من غير حول مني ولا قوة.",
      ps: "ټولې ستاینې هغه الله لره دي چې دا خواړه یې ماته راکړل او روزي یې راکړه بې له دې چې زما کوم توان او ځواک وي.",
      it: "Lode ad Allah che mi ha nutrito di questo e me lo ha fornito senza mia forza né potenza.",
      ru: "Хвала Аллаху, Который накормил меня этим и наделил этим без всякой силы и могущества с моей стороны.",
      fa: "سپاس خدایی را که این غذا را به من داد و آن را بدون هیچ توان و نیرویی از جانب من، روزی‌ام ساخت.",
    },
    source: "At-Tirmidhi, Abu Dawud",
    icon: "heart",
    image: afterEatingImg,
  },
  {
    id: "daily-5",
    catKey: "daily",
    order: 5,
    title: {
      fr: "En entrant chez soi",
      en: "Upon Entering Home",
      ar: "عند دخول المنزل",
      ps: "کور ته د ننوتلو مهال",
      it: "Entrando in casa",
      ru: "При входе в дом",
      fa: "هنگام ورود به خانه",
    },
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    translit: "Bismillahi walajna wa bismillahi kharajna wa 'ala rabbina tawakkalna",
    translation: {
      fr: "Au nom d'Allah nous entrons, au nom d'Allah nous sortons, et en notre Seigneur nous plaçons notre confiance.",
      en: "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.",
      ar: "بسم الله ولجنا وبسم الله خرجنا وعلى ربنا توكلنا.",
      ps: "د الله په نوم ننووتلو او د الله په نوم وتلو او پر خپل رب مو توکل وکړ.",
      it: "Nel nome di Allah entriamo, nel nome di Allah usciamo, e nel nostro Signore confidiamo.",
      ru: "С именем Аллаха мы вошли, с именем Аллаха вышли и на нашего Господа уповаем.",
      fa: "به نام خدا وارد شدیم و به نام خدا خارج شدیم و بر پروردگارمان توکل کردیم.",
    },
    source: "Abu Dawud",
    icon: "door-in",
    image: homeEntryImg,
  },
  {
    id: "daily-6",
    catKey: "daily",
    order: 6,
    title: {
      fr: "En sortant de chez soi",
      en: "Upon Leaving Home",
      ar: "عند الخروج من المنزل",
      ps: "له کوره د وتلو مهال",
      it: "Uscendo di casa",
      ru: "При выходе из дома",
      fa: "هنگام خروج از خانه",
    },
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    translit: "Bismillah, tawakkaltu 'ala-llah, wa la hawla wa la quwwata illa billah",
    translation: {
      fr: "Au nom d'Allah, je place ma confiance en Allah; il n'y a de force ni de puissance qu'en Allah.",
      en: "In the name of Allah, I place my trust in Allah; there is no power nor strength except through Allah.",
      ar: "بسم الله توكلت على الله ولا حول ولا قوة إلا بالله.",
      ps: "د الله په نوم، پر الله مې توکل وکړ او بې له الله بل هیڅ توان او ځواک نشته.",
      it: "Nel nome di Allah, confido in Allah; non c'è forza né potenza se non in Allah.",
      ru: "С именем Аллаха, уповаю на Аллаха; нет силы и могущества ни у кого, кроме Аллаха.",
      fa: "به نام خدا، بر خدا توکل کردم و هیچ نیرو و توانگری جز به خدا نیست.",
    },
    source: "At-Tirmidhi, Abu Dawud",
    icon: "door-out",
    image: homeExitImg,
  },
  {
    id: "daily-7",
    catKey: "daily",
    order: 7,
    title: {
      fr: "En se regardant dans le miroir",
      en: "Looking in the Mirror",
      ar: "عند النظر في المرآة",
      ps: "آینې ته د کتنې مهال",
      it: "Guardandosi allo specchio",
      ru: "Глядя в зеркало",
      fa: "هنگام نگاه کردن در آینه",
    },
    arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
    translit: "Allahumma kama hassanta khalqi fahassin khuluqi",
    translation: {
      fr: "Ô Allah, de même que Tu as embelli ma création physique, embellis mon comportement.",
      en: "O Allah, just as You made my physical appearance beautiful, make my character beautiful.",
      ar: "اللهم كما حسنت خلقي فحسن خُلقي.",
      ps: "ای الله! لکه څنګه چې دې زما بڼه ښکلې کړې، زما اخلاق هم ښکلي کړه.",
      it: "O Allah, come hai reso bella la mia creazione, rendi bello il mio carattere.",
      ru: "О Аллах, как Ты сделал прекрасным мой облик, так сделай прекрасным и мой нрав.",
      fa: "بارالها، همان‌طور که آفرینش مرا نیکو گرداندی، اخلاق مرا نیز نیکو گردان.",
    },
    source: "Ahmad, Ibn Hibban",
    icon: "mirror",
    image: mirrorImg,
  },
  {
    id: "daily-8",
    catKey: "daily",
    order: 8,
    title: {
      fr: "Avant de se déshabiller",
      en: "Before Undressing",
      ar: "قبل خلع الملابس",
      ps: "د کاليو ایستلو وړاندې",
      it: "Prima di spogliarsi",
      ru: "Перед раздеванием",
      fa: "قبل از درآوردن لباس",
    },
    arabic: "بِسْمِ اللَّهِ",
    translit: "Bismillah",
    translation: {
      fr: "Au nom d'Allah.",
      en: "In the name of Allah.",
      ar: "بسم الله.",
      ps: "د الله په نوم.",
      it: "Nel nome di Allah.",
      ru: "С именем Аллаха.",
      fa: "به نام خدا.",
    },
    source: "At-Tirmidhi",
    icon: "shirt-off",
    image: undressingImg,
  },
  {
    id: "daily-9",
    catKey: "daily",
    order: 9,
    title: {
      fr: "En montant dans un véhicule",
      en: "Boarding a Vehicle",
      ar: "عند ركوب الدابة أو السيارة",
      ps: "په سپارلۍ د سپرېدو مهال",
      it: "Salendo su un veicolo",
      ru: "При посадке в транспорт",
      fa: "هنگام سوار شدن بر وسیله نقلیه",
    },
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    translit:
      "Subhana-lladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
    translation: {
      fr: "Gloire à Celui qui a mis ceci à notre service alors que nous n'en étions pas capables, et c'est vers notre Seigneur que nous retournons.",
      en: "Glory to Him Who has subjected this to us when we could never have done it by ourselves, and unto our Lord we return.",
      ar: "سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون.",
      ps: "پاک دی هغه ذات چې دا یې زموږ په خدمت کې درولی حال دا چې موږ ته د دې وس نه و، او موږ خپل رب ته راستنېدونکي یو.",
      it: "Gloria a Colui che ha messo questo al nostro servizio mentre noi non ne eravamo capaci.",
      ru: "Пречист Тот, Кто подчинил нам это, ведь сами мы не смогли бы этого сделать, и поистине к нашему Господу мы возвращаемся.",
      fa: "منزه است خدایی که این را مسخر ما گرداند وگرنه ما توانایی آن را نداشتیم و ما به سوی پروردگارمان بازمی‌گردیم.",
    },
    source: "Abu Dawud, At-Tirmidhi",
    icon: "car",
    image: vehicleImg,
  },
  {
    id: "daily-10",
    catKey: "daily",
    order: 10,
    title: {
      fr: "Quand on éternue",
      en: "Upon Sneezing",
      ar: "عند العطاس",
      ps: "د پرنجېدو مهال",
      it: "Quando si starnutisce",
      ru: "При чихании",
      fa: "هنگام عطسه کردن",
    },
    arabic: "الْحَمْدُ لِلَّهِ (ويرد المكتفي: يَرْحَمُكَ اللَّهُ)",
    translit: "Alhamdu lillah (Response: Yarhamuka-llah)",
    translation: {
      fr: "Louange à Allah (Et celui qui entend répond: Qu'Allah te fasse miséricorde).",
      en: "Praise be to Allah (Response: May Allah have mercy on you).",
      ar: "الحمد لله (ويرد السامع: يرحمك الله).",
      ps: "الحمد لله (او اورېدونکی وایي: يرحمك الله).",
      it: "Lode ad Allah (Risposta: Che Allah ti usi misericordia).",
      ru: "Хвала Аллаху (Слушающий отвечает: Да помилует тебя Аллах).",
      fa: "سپاس خدا را (و شنونده می‌گوید: خدا تو را رحمت کند).",
    },
    source: "Bukhari",
    icon: "sneeze",
    image: sneezingImg,
  },
  {
    id: "daily-11",
    catKey: "daily",
    order: 11,
    title: {
      fr: "Après avoir bu du lait",
      en: "After Drinking Milk",
      ar: "بعد شرب الحليب",
      ps: "د شيدو له څښلو وروسته",
      it: "Dopo aver bevuto il latte",
      ru: "После питья молока",
      fa: "بعد از نوشیدن شیر",
    },
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ",
    translit: "Allahumma barik lana fihi wa zidna minh",
    translation: {
      fr: "Ô Allah, bénis-le pour nous et augmente-nous-en.",
      en: "O Allah, bless it for us and grant us more of it.",
      ar: "اللهم بارك لنا فيه وزدنا منه.",
      ps: "ای الله! دا زموږ لپاره برکاتي کړه او موږ ته ترې زیات راکړه.",
      it: "O Allah, benedicilo per noi e aumentacelo.",
      ru: "О Аллах, сделай это благословенным для нас и добавь нам этого.",
      fa: "بارالها، این را برای ما با برکت گردان و بر آن بیفزای.",
    },
    source: "At-Tirmidhi, Abu Dawud",
    icon: "drink",
    image: milkImg,
  },
  {
    id: "daily-12",
    catKey: "daily",
    order: 12,
    title: {
      fr: "Avant de lire le Coran",
      en: "Before Reading Quran",
      ar: "قبل قراءة القرآن",
      ps: "د قرآنکریم له تلاوت وړاندې",
      it: "Prima di leggere il Corano",
      ru: "Перед чтением Корана",
      fa: "قبل از تلاوت قرآن",
    },
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    translit: "A'udhu billahi mina-sh-shaytani-r-rajim",
    translation: {
      fr: "Je cherche protection auprès d'Allah contre Satan le maudit.",
      en: "I seek refuge in Allah from Satan the outcast.",
      ar: "أعوذ بالله من الشيطان الرجيم.",
      ps: "زه له رټل شوي شیطان څخه الله ته پناه وړم.",
      it: "Cerzo rifugio in Allah da Satana il maledetto.",
      ru: "Прибегаю к защите Аллаха от проклятого сатаны.",
      fa: "از شیطان رانده شده به خدا پناه می‌برم.",
    },
    source: "Sourate An-Nahl (16:98)",
    icon: "quran",
    image: quranReadUserImg,
  },
  {
    id: "worship-0",
    catKey: "worship",
    order: 0,
    title: {
      fr: "En entrant à la mosquée",
      en: "Entering the Mosque",
      ar: "عند دخول المسجد",
      ps: "مسجد ته د ننوتلو مهال",
      it: "Entrando nella moschea",
      ru: "При входе в мечеть",
      fa: "هنگام ورود به مسجد",
    },
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    translit: "Allahumma-ftah li abwaba rahmatik",
    translation: {
      fr: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
      en: "O Allah, open for me the doors of Your mercy.",
      ar: "اللهم افتح لي أبواب رحمتك.",
      ps: "ای الله! زما لپاره د خپلې رحمت دروازې پرانیزه.",
      it: "O Allah, aprimi le porte della Tua misericordia.",
      ru: "О Аллах, открой для меня враتا Твоей милости.",
      fa: "بارالها، درهای رحمتت را بر من بگشا.",
    },
    source: "Muslim",
    icon: "mosque",
    image: enteringMosqueImg,
  },
  {
    id: "worship-1",
    catKey: "worship",
    order: 1,
    title: {
      fr: "En sortant de la mosquée",
      en: "Leaving the Mosque",
      ar: "عند الخروج من المسجد",
      ps: "له مسجده د وتلو مهال",
      it: "Uscendo dalla moschea",
      ru: "При выходе из мечети",
      fa: "هنگام خروج از مسجد",
    },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    translit: "Allahumma inni as'aluka min fadlik",
    translation: {
      fr: "Ô Allah, je Te demande de Ta grâce.",
      en: "O Allah, I ask You for Your bounty.",
      ar: "اللهم إني أسألك من فضلك.",
      ps: "ای الله! زه له تا څخه ستاسو فضل او لورېینه غواړم.",
      it: "O Allah, Ti chiedo la Tua grazia.",
      ru: "О Аллах, поистине, я прошу Тебя о Твоей милости.",
      fa: "بارالها، من از فضل و کرم تو درخواست می‌کنم.",
    },
    source: "Muslim",
    icon: "mosque-out",
    image: leavingMosqueImg,
  },
  {
    id: "worship-2",
    catKey: "worship",
    order: 2,
    title: {
      fr: "Après la prière",
      en: "After Prayer",
      ar: "بعد الصلاة",
      ps: "له لمانځه وروسته",
      it: "Dopo la preghiera",
      ru: "После молитвы",
      fa: "بعد از نماز",
    },
    arabic:
      "أَسْتَغْفِرُ اللَّهَ (٣x) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    translit:
      "Astaghfirullah (3x), Allahumma anta-s-salam wa minka-s-salam, tabarakta ya dhal-jalali wal-ikram",
    translation: {
      fr: "Je demande pardon à Allah (3x). Ô Allah, Tu es la Paix et de Toi vient la paix, béni sois-Tu, ô Détenteur de la majesté et de la noblesse.",
      en: "I ask Allah for forgiveness (3x). O Allah, You are Peace and from You comes peace. Blessed are You, Possessor of majesty and honor.",
      ar: "أستغفر الله (ثلاثاً)، اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام.",
      ps: "زه له الله بښنه غواړم (۳ ځلې). ای الله! ته سوله يې او له تا سوله ده، برکتي يې ای د لويۍ او عزت څښتنه.",
      it: "Chiedo perdono ad Allah (3 volte). O Allah, Tu sei la Pace e da Te viene la pace.",
      ru: "Прошу прощения у Аллаха (3 раза). О Аллах, Ты — Мир и от Тебя — мир, благословен Ты, о Обладатель величия и уважения.",
      fa: "از خدا آمرزش می‌خواهم (۳ بار). خدایا تو سلامی و سلامتی از توست، مبارکی ای دارنده جلال و اکرام.",
    },
    source: "Muslim",
    icon: "prayer",
    image: afterPrayerImgNew,
  },
  {
    id: "worship-3",
    catKey: "worship",
    order: 3,
    title: {
      fr: "En voyant la Kaaba",
      en: "Upon Seeing Kaaba",
      ar: "عند رؤية الكعبة",
      ps: "د کعبې شريفې د لیدلو مهال",
      it: "Alla vista della Kaaba",
      ru: "При виде Каабы",
      fa: "هنگام دیدن کعبه",
    },
    arabic: "اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً",
    translit: "Allahumma zid hadhal-bayta tashrifan wa ta'ziman wa takriman wa mahabah",
    translation: {
      fr: "Ô Allah, accorde à cette Maison davantage d'honneur, de grandeur, de noblesse et de vénération.",
      en: "O Allah, increase this House in honor, esteem, respect, and awe.",
      ar: "اللهم زد هذا البيت تشريفاً وتعظيماً وتكريماً ومهابة.",
      ps: "ای الله! دې کور ته په شرافت، لويۍ، عزت او هیبت کې ډېروالی ورکړه.",
      it: "O Allah, aumenta per questa Casa l'onore, la grandezza e il rispetto.",
      ru: "О Аллах, умножь почет, величие, уважение и трепет перед этим Домом.",
      fa: "بارالها، شرف و عظمت و تکریم و مهابت این خانه را بیفزا.",
    },
    source: "Ash-Shafi'i, Sunan Al-Kubra",
    icon: "kaaba",
    image: kaabaImgUser,
  },
  {
    id: "worship-4",
    catKey: "worship",
    order: 4,
    title: {
      fr: "En rompant le jeûne",
      en: "Breaking the Fast",
      ar: "عند الإفطار",
      ps: "د روژې ماتولو مهال",
      it: "Rompendo il digiuno",
      ru: "При разговении",
      fa: "هنگام افطار",
    },
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    translit: "Dhahaba-z-zama'u wabtallati-l-'uruqu wa thabata-l-ajru in sha'a Allah",
    translation: {
      fr: "La soif est partie, les veines sont irriguées et la récompense est acquise si Allah le veut.",
      en: "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
      ar: "ذهب الظمأ وابتلت العروق وثبت الأجر إن شاء الله.",
      ps: "تنده ټوله شوه، رګونه لوند شول او اجر ثابت شو که الله غوښتل.",
      it: "La sete è passata, le vene si sono bagnate e la ricompensa è confermata, se Allah vuole.",
      ru: "Ушла жажда, жилы наполнились влагой, и награда уже ждет, если пожелает Аллах.",
      fa: "تشنگی برطرف شد، رگ‌ها سیراب گشتند و پاداش ان‌شاءالله ثبت گردید.",
    },
    source: "Abu Dawud",
    icon: "fasting-break",
    image: fastingImgUser,
  },
  {
    id: "worship-5",
    catKey: "worship",
    order: 5,
    title: {
      fr: "Le vendredi",
      en: "On Friday",
      ar: "يوم الجمعة",
      ps: "د جمعې په ورځ",
      it: "Il Venerdì",
      ru: "В пятницу",
      fa: "روز جمعه",
    },
    arabic:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ",
    translit: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin kama sallayta 'ala Ibrahima",
    translation: {
      fr: "Ô Allah, prie sur Muhammad et sur la famille de Muhammad comme Tu as prié sur Ibrahim.",
      en: "O Allah, send blessings upon Muhammad and upon the family of Muhammad as You sent blessings upon Ibrahim.",
      ar: "اللهم صل على محمد وعلى آل محمد كما صليت على إبراهيم.",
      ps: "ای الله! په محمد او د هغه په کورنۍ درود ولیږه لکه څنګه چې دې په ابراهیم درود لیږلی و.",
      it: "O Allah, invia le Tue benedizioni su Muhammad e sulla sua famiglia.",
      ru: "О Аллах, благослови Мухаммада и семейство Мухаммада, как благословил Ибрахима.",
      fa: "بارالها، بر محمد و آل محمد درود فرست همان‌گونه که بر ابراهیم درود فرستادی.",
    },
    source: "Bukhari",
    icon: "friday",
    image: fridayUserImg,
  },
  {
    id: "worship-6",
    catKey: "worship",
    order: 6,
    title: {
      fr: "Avant les ablutions",
      en: "Before Ablution (Wudu)",
      ar: "قبل الوضوء",
      ps: "له اودس وړاندې",
      it: "Prima dell'abluzione",
      ru: "Перед омовением",
      fa: "قبل از وضو",
    },
    arabic: "بِسْمِ اللَّهِ",
    translit: "Bismillah",
    translation: {
      fr: "Au nom d'Allah.",
      en: "In the name of Allah.",
      ar: "بسم الله.",
      ps: "د الله په نوم.",
      it: "Nel nome di Allah.",
      ru: "С именем Аллаха.",
      fa: "به نام خدا.",
    },
    source: "Abu Dawud, Ibn Majah",
    icon: "wudu",
    image: wuduBeforeImgUser,
  },
  {
    id: "worship-7",
    catKey: "worship",
    order: 7,
    title: {
      fr: "Après les ablutions",
      en: "After Ablution (Wudu)",
      ar: "بعد الوضوء",
      ps: "له اودس وروسته",
      it: "Dopo l'abluzione",
      ru: "После омовения",
      fa: "بعد از وضو",
    },
    arabic:
      "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    translit:
      "Ash-hadu an la ilaha illa Allahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    translation: {
      fr: "J'atteste qu'il n'y a de divinité qu'Allah Seul sans associé, et que Muhammad est Son serviteur et Messager.",
      en: "I bear witness that none has the right to be worshipped except Allah alone, and Muhammad is His servant and Messenger.",
      ar: "أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله.",
      ps: "زه شهادت ورکوم چې بې له یو الله بل معبود نشته، او شهادت ورکوم چې محمد د هغه بنده او رسول دی.",
      it: "Testimonio che non c'è altro dio all'fuori di Allah e che Muhammad è il Suo servo e Messaggero.",
      ru: "Свидетельствую, что нет божества, кроме одного лишь Аллаха, и свидетельствоваю, что Мухаммад — Его раб и Посланник.",
      fa: "گواهی می‌دهم که معبودی جز خدای یگانه نیست و گواهی می‌دهم که محمد بنده و فرستاده اوست.",
    },
    source: "Muslim",
    icon: "wudu-after",
    image: wuduAfterImgUser,
  },
  {
    id: "worship-8",
    catKey: "worship",
    order: 8,
    title: {
      fr: "Avant le Ghusl",
      en: "Before Ritual Bath (Ghusl)",
      ar: "قبل الغسل",
      ps: "له غسل وړاندې",
      it: "Prima del Ghusl",
      ru: "Перед купанием (Гусль)",
      fa: "قبل از غسل",
    },
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    translit: "Bismillahi-r-Rahmani-r-Rahim",
    translation: {
      fr: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
      en: "In the name of Allah, the Most Gracious, the Most Merciful.",
      ar: "بسم الله الرحمن الرحيم.",
      ps: "د پخلاینونکي او مهربان الله په نامه.",
      it: "Nel nome di Allah, il Clemente, il Misericordioso.",
      ru: "С именем Аллаха, Милостивого, Милосердного.",
      fa: "به نام خداوند بخشنده مهربان.",
    },
    source: "Fiqh as-Sunnah",
    icon: "shower",
    image: ghuslImgUser,
  },
  {
    id: "worship-9",
    catKey: "worship",
    order: 9,
    title: {
      fr: "Avant d'entrer aux toilettes",
      en: "Entering the Restroom",
      ar: "قبل دخول الخلاء",
      ps: "تشناب ته د ننوتلو وړاندې",
      it: "Prima di entrare in bagno",
      ru: "Перед входом в туалет",
      fa: "قبل از ورود به دستشویی",
    },
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ",
    translit: "Allahumma inni a'udhu bika minal-khubthi wal-khaba'ith",
    translation: {
      fr: "Ô Allah, je cherche protection auprès de Toi contre les démons mâles et femelles.",
      en: "O Allah, I seek refuge in You from male and female evil spirits.",
      ar: "اللهم إني أعوذ بك من الخبث والخبائث.",
      ps: "ای الله! زه له نارینه او ښځینه شیطانانو څخه تا ته پناه وړم.",
      it: "O Allah, cerco rifugio in Te dai demoni maschi e femmine.",
      ru: "О Аллах, поистине, я прибегаю к Тебе от злых духов мужского и женского пола.",
      fa: "بارالها، از شیاطین نر و ماده به تو پناه می‌برم.",
    },
    source: "Bukhari, Muslim",
    icon: "wc-in",
    image: wcInImgUser,
  },
  {
    id: "worship-10",
    catKey: "worship",
    order: 10,
    title: {
      fr: "En sortant des toilettes",
      en: "Leaving the Restroom",
      ar: "عند الخروج من الخلاء",
      ps: "له تشنابه د وتلو مهال",
      it: "Uscendo dal bagno",
      ru: "При выходе из туалета",
      fa: "هنگام خروج از دستشویی",
    },
    arabic: "غُفْرَانَكَ",
    translit: "Ghufranaka",
    translation: {
      fr: "Je demande Ton pardon.",
      en: "I ask You for Your forgiveness.",
      ar: "غفرانك.",
      ps: "ستاسو بښنه غواړم.",
      it: "Chiedo il Tuo perdono.",
      ru: "Прошу Твоего прощения.",
      fa: "آمرزش تو را می‌خواهم.",
    },
    source: "Abu Dawud, At-Tirmidhi",
    icon: "wc-out",
    image: wcOutImgUser,
  },
  {
    id: "worship-11",
    catKey: "worship",
    order: 11,
    title: {
      fr: "En entrant à la mosquée",
      en: "Entering the Mosque",
      ar: "عند دخول المسجد",
      ps: "مسجد ته د ننوتلو مهال",
      it: "Entrando in moschea",
      ru: "При входе в мечеть",
      fa: "هنگام ورود به مسجد",
    },
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    translit: "Allahumma-ftah li abwaba rahmatik",
    translation: {
      fr: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
      en: "O Allah, open for me the gates of Your mercy.",
      ar: "اللهم افتح لي أبواب رحمتك.",
      ps: "ای الله! ماته د خپل رحمت دروازې پرانیزه.",
      it: "O Allah, me apri le porte della Tua misericordia.",
      ru: "О Аллах, открой для меня врата Твоей милости.",
      fa: "بارالها، درهای رحمتت را بر من بگشا.",
    },
    source: "Muslim",
    icon: "mosque-in",
    image: enteringMosqueImg,
  },

  // --- PROTECTION ET SITUATIONS (8 items) ---
  {
    id: "protection-1",
    catKey: "protection",
    order: 1,
    title: {
      fr: "Contre l'anxiété",
      en: "Against Anxiety & Grief",
      ar: "عند الهم والحزن",
      ps: "د اندېښنې او غم د شتون مهال",
      it: "Contro l'ansia",
      ru: "От тревоги и грусти",
      fa: "برای رفع اضطراب و غم",
    },
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ",
    translit:
      "Allahumma inni a'udhu bika minal-hammi wal-hazani wal-'ajzi wal-kasali wal-bukhli wal-jubn",
    translation: {
      fr: "Ô Allah, je cherche refuge auprès de Toi contre le souci, la tristesse, l'incapacité, la paresse, l'avarice et la lâcheté.",
      en: "O Allah, I seek refuge in You from anxiety, sorrow, helplessness, laziness, miserliness, and cowardice.",
      ar: "اللهم إني أعوذ بك من الهم والحزن والعجز والكسل والبخل والجُبن.",
      ps: "ای الله! زه له غم، خپګان، بې وسۍ، سستۍ، بخل او ډار څخه تا ته پناه وړم.",
      it: "O Allah, cerco rifugio in Te dall'ansia, dalla tristezza e dalla pigrizia.",
      ru: "О Аллах, я прибегаю к Тебе от тревоги, печали, слабости, лени, скупости и трусости.",
      fa: "بارالها، از اندوه و غم و ناتوانی و تنبلی و بخل و ترس به تو پناه می‌برم.",
    },
    source: "Bukhari",
    icon: "shield",
    image: anxietyImgUser,
  },
  {
    id: "protection-2",
    catKey: "protection",
    order: 2,
    title: {
      fr: "Contre la peur",
      en: "Against Fear",
      ar: "عند الخوف",
      ps: "د وېرې د شتون مهال",
      it: "Contro la paura",
      ru: "От страха",
      fa: "در هنگام ترس",
    },
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    translit: "A'udhu bikalimati-llahi-t-tammati min sharri ma khalaq",
    translation: {
      fr: "Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
      en: "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
      ar: "أعوذ بكلمات الله التامات من شر ما خلق.",
      ps: "زه د الله په پورو کلمو د مخلوقاتو له شره پناه غواړم.",
      it: "Cerco rifugio nelle Parole Perfette di Allah dal male di ciò che Egli ha creato.",
      ru: "Прибегаю к совершенным словам Аллаха от зла того, что Он сотворил.",
      fa: "به کلمات کامل خدا از شر آنچه آفریده پناه می‌برم.",
    },
    source: "Muslim",
    icon: "fear",
    image: fearImgUser,
  },
  {
    id: "protection-3",
    catKey: "protection",
    order: 3,
    title: {
      fr: "Contre la colère",
      en: "Against Anger",
      ar: "عند الغضب",
      ps: "د غصې د کنټرول مهال",
      it: "Contro la rabbia",
      ru: "При гневе",
      fa: "هنگام خشم",
    },
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    translit: "A'udhu billahi mina-sh-shaytani-r-rajim",
    translation: {
      fr: "Je cherche protection auprès d'Allah contre Satan le maudit.",
      en: "I seek refuge in Allah from Satan the outcast.",
      ar: "أعوذ بالله من الشيطان الرجيم.",
      ps: "زه له رټل شوي شیطان څخه الله ته پناه وړم.",
      it: "Cerco rifugio in Allah da Satana il maledetto.",
      ru: "Прибегаю к защите Аллаха от проклятого сатаны.",
      fa: "از شیطان رانده شده به خدا پناه می‌برم.",
    },
    source: "Bukhari, Muslim",
    icon: "anger",
    image: angerImgUser,
  },
  {
    id: "protection-4",
    catKey: "protection",
    order: 4,
    title: {
      fr: "Contre les dettes",
      en: "Against Debt",
      ar: "لقضاء الدين",
      ps: "د پور د پرېکولو لپاره",
      it: "Contro i debiti",
      ru: "Для избавления от долгов",
      fa: "برای ادای قرض",
    },
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    translit: "Allahumma-kfini bihalalika 'an haramik, wa aghnini bifadlika 'amman siwak",
    translation: {
      fr: "Ô Allah, suffis-moi par ce que Tu as rendu licite contre ce que Tu as rendu interdit, et enrichis-moi de Ta grâce afin de me passer de tout autre que Toi.",
      en: "O Allah, suffice me with Your lawful against Your prohibited, and enrich me by Your grace from all besides You.",
      ar: "اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك.",
      ps: "ای الله! ماته پر حلالو بسنه وکړه له حررامو او زه له خپل فضل څخه په لورېینې بې نیازه کړه.",
      it: "O Allah, fammi bastare il Tuo lecito contro il Tuo proibito e arricchiscimi della Tua grazia.",
      ru: "О Аллах, сделай так, чтобы дозволенного Тобой было мне достаточно, и обогати меня Своей милостью.",
      fa: "بارالها، مرا با حلال خود از حرام بی‌نیاز کن و به فضل خود از غیر خود بی‌نیاز گردان.",
    },
    source: "At-Tirmidhi",
    icon: "debt",
    image: debtImgUser,
  },
  {
    id: "protection-5",
    catKey: "protection",
    order: 5,
    title: {
      fr: "Demander le pardon",
      en: "Asking Forgiveness",
      ar: "طلب المغفرة والاستغفار",
      ps: "د بښنې غوښتلو دعا",
      it: "Chiedere il perdono",
      ru: "Мольба о прощении",
      fa: "طلب آمرزش",
    },
    arabic:
      "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ",
    translit: "Astaghfirullahal-'Azim alladhi la ilaha illa huwal-Hayyul-Qayyumu wa atubu ilayh",
    translation: {
      fr: "Je demande pardon à Allah l'Immense, en dehors de qui il n'y a pas de divinité, le Vivant, Celui qui subsiste par Lui-même, et je me repens à Lui.",
      en: "I seek the forgiveness of Allah the Mighty, besides Whom there is no deity, the Ever-Living, the Sustainer, and I repent to Him.",
      ar: "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.",
      ps: "زه له لوي الله بښنه غواړم چې بې له هغه بل معبود نشته، ژوندی او تلمدامی دی، او هغه ته توبه باسم.",
      it: "Chiedo perdono ad Allah l'Immenso, all'fuori del Quale non c'è dio, il Vivente.",
      ru: "Прошу прощения у Великого Аллаха, кроме Которого нет иного божества, Живого, Вседержителя, и приношу Ему свое покаяние.",
      fa: "از خدای بزرگ که معبودی جز او نیست، زنده و پاینده است، آمرزش می‌خواهم و به سوی او توبه می‌کنم.",
    },
    source: "Abu Dawud, At-Tirmidhi",
    icon: "hands",
    image: forgivenessImgUser,
  },
  {
    id: "protection-6",
    catKey: "protection",
    order: 6,
    title: {
      fr: "Pour le malade",
      en: "Visiting the Sick",
      ar: "دعاء للمريض",
      ps: "د ناروغ لپاره دعا",
      it: "Per il malato",
      ru: "За больного",
      fa: "برای بیمار",
    },
    arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    translit: "La ba'sa, tahurun in sha'a Allah",
    translation: {
      fr: "Pas de mal, c'est une purification si Allah le veut.",
      en: "No harm, it is a purification if Allah wills.",
      ar: "لا بأس، طهور إن شاء الله.",
      ps: "کومه اندېښنه نشته، ان شاء الله د ګناهونو پاکوالی دی.",
      it: "Nessun male, è una purificazione se Allah vuole.",
      ru: "Не беда, это очищение, если пожелает Аллах.",
      fa: "باکی نیست، ان‌شاءالله پاک‌کننده گناهان است.",
    },
    source: "Bukhari",
    icon: "sick",
    image: sickImgUser,
  },
  {
    id: "protection-7",
    catKey: "protection",
    order: 7,
    title: {
      fr: "En cas de malheur",
      en: "In Times of Calamity",
      ar: "عند المصيبة",
      ps: "د مصیبت په مهال",
      it: "In caso di calamità",
      ru: "При несчастье",
      fa: "هنگام مصیبت",
    },
    arabic:
      "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    translit:
      "Inna lillahi wa inna ilayhi raji'un, Allahumma'-jurni fi musibati wa akhlif li khayran minha",
    translation: {
      fr: "Nous sommes à Allah et c'est à Lui que nous retournons. Ô Allah, récompense-moi dans mon malheur et remplace-le moi par quelque chose de meilleur.",
      en: "We belong to Allah and to Him we shall return. O Allah, reward me in my affliction and replace it for me with something better.",
      ar: "إنا لله وإنا إليه راجعون، اللهم أجرني في مصيبتي وأخلف لي خيراً منها.",
      ps: "موږ ټول د الله یو او همغه لوري ته راستنېدونکي یو، ای الله! ماته په دې مصیبت کې اجر راکړه او په بدل کې تر دې غوره راته راکړه.",
      it: "Apparteniamo ad Allah e a Lui ritorniamo. O Allah, ricompensami nella mia sfortuna.",
      ru: "Поистине, мы принадлежим Аллаху и к Нему возвращаемся. О Аллах, вознагради меня в моей беде и замени ее чем-то лучшим.",
      fa: "ما از آنِ خداییم و به سوی او بازمی‌گردیم. خدایا در این مصیبت به من پاداش ده و بهتر از آن را جایگزین فرما.",
    },
    source: "Muslim",
    icon: "grief",
    image: misfortuneImgUser,
  },
  {
    id: "protection-8",
    catKey: "protection",
    order: 8,
    title: {
      fr: "Pour protéger les enfants",
      en: "Protecting Children",
      ar: "لحماية الأطفال والتحصين",
      ps: "د ماشومانو د ساتنې دعا",
      it: "Per proteggere i bambini",
      ru: "Для защиты детей",
      fa: "برای حفاظت از کودکان",
    },
    arabic:
      "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    translit:
      "U'idhukuma bikalimatil-lahit-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah",
    translation: {
      fr: "Je cherche protection pour vous auprès des paroles parfaites d'Allah contre tout démon, tout animal venimeux et tout mauvais œil.",
      en: "I seek protection for you in the Perfect Words of Allah from every devil, poisonous reptile, and evil eye.",
      ar: "أعيذكما بكلمات الله التامة من كل شيطان وهامة ومن كل عين لامة.",
      ps: "زه تاسو دواړه د الله په بشپړو کلمو د هر شیطان، زهرجن ژوي او بدې سترګې څخه ساتم.",
      it: "Vi metto sotto la protezione delle Parole Perfette di Allah da ogni demonio e malocchio.",
      ru: "Прибегаю к совершенным словам Аллаха для вашей защиты от каждого шайтана, ядовитого гада и от сглаза.",
      fa: "شما را به کلمات کامل خدا از شر هر شیطان و جانور گزنده و چشم بد می‌سپارم.",
    },
    source: "Bukhari",
    icon: "child",
    image: childrenImgUser,
  },

  // --- ÉVÉNEMENTS ET NATURE (6 items) ---
  {
    id: "events-1",
    catKey: "events",
    order: 1,
    title: {
      fr: "Quand il pleut",
      en: "When it Rains",
      ar: "عند نزول المطر",
      ps: "د اورښت یا باران مهال",
      it: "Quando piove",
      ru: "Во время дождя",
      fa: "هنگام باریدن باران",
    },
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    translit: "Allahumma sayyiban nafi'an",
    translation: {
      fr: "Ô Allah, fais que ce soit une pluie bienfaisante.",
      en: "O Allah, make it a beneficial rain.",
      ar: "اللهم صيباً نافعاً.",
      ps: "ای الله! دا باران ګټور او برکاتي کړه.",
      it: "O Allah, fa' che sia una pioggia benefica.",
      ru: "О Аллах, пусть этот дождь будет благодатным!",
      fa: "بارالها، بارانی سودمند نازل فرما.",
    },
    source: "Bukhari",
    icon: "rain",
    image: rainUserImg,
  },
  {
    id: "events-2",
    catKey: "events",
    order: 2,
    title: {
      fr: "Quand le vent souffle",
      en: "When Wind Blows",
      ar: "عند هبوب الريح",
      ps: "د باد يا توفان مهال",
      it: "Quando soffia il vento",
      ru: "При сильном ветре",
      fa: "هنگام وزش باد",
    },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَأَعُوذُ بِكَ مِنْ شَرِّهَا",
    translit: "Allahumma inni as'aluka khayraha wa a'udhu bika min sharriha",
    translation: {
      fr: "Ô Allah, je Te demande son bien et je cherche refuge auprès de Toi contre son mal.",
      en: "O Allah, I ask You for its good and seek refuge in You from its evil.",
      ar: "اللهم إني أسألك خيرها وأعوذ بك من شرها.",
      ps: "ای الله! زه له تا څخه د دې باد خیر غواړم او له شړ تېرې پناه غواړم.",
      it: "O Allah, Ti chiedo il suo bene e cerco rifugio in Te dal suo male.",
      ru: "О Аллах, поистине, я прошу Тебя о благе этого ветра и прибегаю к Тебе от его зла.",
      fa: "بارالها، خیر آن را از تو می‌خواهم و از شرش به تو پناه می‌برم.",
    },
    source: "Abu Dawud, Ibn Majah",
    icon: "wind",
    image: windUserImg,
  },
  {
    id: "events-3",
    catKey: "events",
    order: 3,
    title: {
      fr: "En entendant le tonnerre",
      en: "Hearing Thunder",
      ar: "عند سماع الرعد",
      ps: "د تندر د اواز اورېدلو مهال",
      it: "Sentendo il tuono",
      ru: "При звуках грома",
      fa: "هنگام شنیدن صدای رعد",
    },
    arabic: "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ",
    translit: "Subhana-lladhi yusabbihu-r-ra'du bihamdihi wal-mala'ikatu min khifatih",
    translation: {
      fr: "Gloire à Celui que le tonnerre glorifie par Sa louange, ainsi que les anges par crainte de Lui.",
      en: "Glory be to Him Whom thunder praises with His praise, and the angels out of fear of Him.",
      ar: "سبحان الذي يسبح الرعد بحمده والملائكة من خيفته.",
      ps: "پاک دی هغه ذات چې تندر د هغه په ستاینه تسبیح وایي او ملایکې یې له وېرې تسبیح وایي.",
      it: "Gloria a Colui che il tuono glorifica con la Sua lode, e le angeli per timore di Lui.",
      ru: "Слава Тому, Кого восхваляет гром и ангелы от страха перед Ним.",
      fa: "منزه است خدایی که رعد به تسطیح و حمد او می‌پردازد و فرشتگان از بیم او.",
    },
    source: "Al-Muwatta",
    icon: "thunder",
    image: thunderUserImg,
  },
  {
    id: "events-4",
    catKey: "events",
    order: 4,
    title: {
      fr: "En entrant au marché",
      en: "Entering the Market",
      ar: "عند دخول السوق",
      ps: "بازار ته د ننوتلو مهال",
      it: "Entrando al mercato",
      ru: "При входе на рынок",
      fa: "هنگام ورود به بازار",
    },
    arabic:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ",
    translit:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu yuhyi wa yumitu wa huwa hayyun la yamut",
    translation: {
      fr: "Il n'y a de divinité qu'Allah Seul sans associé, à Lui la royauté et la louange, Il donne la vie et la mort, et Il est le Vivant qui ne meurt pas.",
      en: "None has the right to be worshipped except Allah alone, without partner. To Him belongs all sovereignty and praise. He gives life and causes death, and He is Ever-Living.",
      ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد يحيي ويميت وهو حي لا يموت.",
      ps: "هیڅ معبود نشته بې له یو الله، حکومت او ستاینه د هغه ده، ژوندی کول او مړ کول د هغه کار دی او هغه تل زنده دی.",
      it: "Non c'è dio all'fuori di Allah solo senza associati; a Lui appartiene la sovranità e la lode.",
      ru: "Нет божества, кроме одного лишь Аллаха, у Которого нет сотоварища. Ему принадлежит власть и хвала. Он оживляет и умерщвляет, а Сам Он — Живой, Который не умирает.",
      fa: "معبودی جز خدای یگانه نیست، فرمانروایی و سپاس از آنِ اوست، زنده می‌کند و می‌میراند و او زنده‌ای است که هرگز نمی‌میرد.",
    },
    source: "At-Tirmidhi, Ibn Majah",
    icon: "market",
    image: marketUserImg,
  },
  {
    id: "events-5",
    catKey: "events",
    order: 5,
    title: {
      fr: "En voyant le croissant de lune",
      en: "Sighting the Crescent Moon",
      ar: "عند رؤية الهلال",
      ps: "د نوې مياشتې د لیدلو مهال",
      it: "Alla vista della luna crescente",
      ru: "При виде новолуния",
      fa: "هنگام دیدن هلال ماه",
    },
    arabic:
      "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ",
    translit:
      "Allahumma ahillahu 'alayna bil-yumni wal-iman, was-salamati wal-Islam, Rabbi wa Rabbukal-lah",
    translation: {
      fr: "Ô Allah, fais que ce croissant se lève sur nous dans la bénédiction, la foi, la sécurité et l'Islam. Mon Seigneur et ton Seigneur est Allah.",
      en: "O Allah, bring it over us with blessing and faith, safety and Islam. My Lord and your Lord is Allah.",
      ar: "اللهم أهله علينا باليمن والإيمان والسلامة والإسلام، ربي وربك الله.",
      ps: "ای الله! دا نوی میاشت زموږ لپاره په خیر، ایمان، سلامتیا او اسلام راپیل کړه. زما او ستا رب الله دی.",
      it: "O Allah, fa' sorgere questa luna su di noi nella benedizione e nella fede. Il mio Signore e il tuo Signore è Allah.",
      ru: "О Аллах, сделай этот месяц для нас месяцем благополучия, веры, безопасности и Ислама. Мой Господь и твой Господь — Аллах.",
      fa: "بارالها، این هلال را با برکت و ایمان و سلامت و اسلام بر ما نو گردان. پروردگار من و تو خداست.",
    },
    source: "At-Tirmidhi",
    icon: "new-moon",
    image: crescentUserImg,
  },
  {
    id: "events-6",
    catKey: "events",
    order: 6,
    title: {
      fr: "En visitant les tombes",
      en: "Visiting Graveyards",
      ar: "عند زيارة القبور",
      ps: "د مقبرو د زیارت مهال",
      it: "Visitando le tombe",
      ru: "При посещении кладбища",
      fa: "هنگام زیارت اهل قبور",
    },
    arabic:
      "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَالاحِقُونَ",
    translit:
      "As-salamu 'alaykum ahlad-diyari minal-mu'minina wal-muslimin, wa inna in sha'a Allahu bikum la-lahiqun",
    translation: {
      fr: "Que la paix soit sur vous, ô habitants de ces demeures parmi les croyants et les musulmans, et nous allons si Allah le veut vous rejoindre.",
      en: "Peace be upon you, O inhabitants of these abodes among the believers and Muslims, and we, if Allah wills, shall join you.",
      ar: "السلام عليكم أهل الديار من المؤمنين والمسلمين، وإنا إن شاء الله بكم للاحقون.",
      ps: "سلام دې وي پر تاسو ای د دې کورونو مؤمنانو او مسلمانانو استوګنو! او موږ ان شاء الله تاسو سره یوځای کېدونکي یو.",
      it: "Pace su di voi, abitanti di queste dimore tra i credenti, e noi se Allah vuole vi raggiungeremo.",
      ru: "Мир вам, о лежащие здесь верующие и мусульмане! Поистине, если пожелает Аллах, мы присоединимся к вам.",
      fa: "سلام بر شما ای اهالی این دیار از مؤمنان و مسلمانان، و ما ان‌شاءالله به شما خواهیم پیوست.",
    },
    source: "Muslim",
    icon: "cemetery",
    image: gravesUserImg,
  },
];

export function getInvocationsByCategory(catKey: InvocationCatKey): InvocationItem[] {
  return FULL_INVOCATIONS.filter((i) => i.catKey === catKey).sort((a, b) => a.order - b.order);
}
