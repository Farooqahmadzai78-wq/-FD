import type { LocaleCode } from "./i18n";

export type GuideBlock = { title: string; lines: string[] };

const fr: GuideBlock[] = [
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

const en: GuideBlock[] = [
  {
    title: "1. Read the ingredient list",
    lines: [
      "Look for any animal-derived ingredient: gelatine, rennet, fat, lard, broth.",
      "Check E numbers: E120 (cochineal), E441 (gelatine), E471/E472 (mono- and diglycerides), E542, E904 (shellac).",
      "“Natural flavours” may contain alcohol: they are doubtful unless the maker specifies otherwise.",
    ],
  },
  {
    title: "2. Spot the alcohol",
    lines: [
      "Ethanol, ethyl alcohol, wine vinegar, alcoholic vanilla extract, liqueur.",
      "Alcohol used as a flavour carrier stays doubtful until the residual level is known.",
    ],
  },
  {
    title: "3. Check the meat and the slaughter",
    lines: [
      "Meat is halal only if the animal was ritually slaughtered in the name of Allah.",
      "“Pork free” does not mean halal: how it was slaughtered matters as much as the species.",
    ],
  },
  {
    title: "4. Look for a recognised certification",
    lines: [
      "Trusted logos: LPPOM MUI (Indonesia), JAKIM (Malaysia), HFA, AVS, HMC, SFCVH.",
      "A “halal” logo without a named certifying body is worthless.",
      "Check that the certificate number is still valid on the certifier's website.",
    ],
  },
  {
    title: "5. Beware of cross-contamination",
    lines: [
      "The same production line may also process pork and animal gelatine.",
      "“May contain” warnings also apply to animal derivatives.",
    ],
  },
  {
    title: "6. When in doubt",
    lines: [
      "Contact the manufacturer: the exact composition of additives can be disclosed.",
      "The Prophet ﷺ said: “Leave what makes you doubt for what does not make you doubt.”",
      "This tool helps you decide; it never replaces a scholar's ruling.",
    ],
  },
];

const ar: GuideBlock[] = [
  {
    title: "١. اقرأ قائمة المكونات",
    lines: [
      "ابحث عن أي مكون حيواني: الجيلاتين، المنفحة، الدهون، شحم الخنزير، المرق.",
      "تحقق من الإضافات: E120 (القرمز)، E441 (جيلاتين)، E471/E472، E542، E904 (اللك).",
      "«النكهات الطبيعية» قد تحتوي على كحول، فهي مشبوهة ما لم يوضح المُصنّع.",
    ],
  },
  {
    title: "٢. انتبه للكحول",
    lines: [
      "الإيثانول، الكحول الإيثيلي، خل النبيذ، خلاصة الفانيليا الكحولية، الخمور.",
      "الكحول المستعمل كحامل للنكهة يبقى مشبوهًا حتى تُعرف نسبته المتبقية.",
    ],
  },
  {
    title: "٣. تحقق من اللحم وطريقة الذبح",
    lines: [
      "اللحم حلال فقط إذا ذُبح الحيوان ذبحًا شرعيًا باسم الله.",
      "«خالٍ من لحم الخنزير» لا يعني حلال؛ طريقة الذبح مهمة كنوع الحيوان.",
    ],
  },
  {
    title: "٤. ابحث عن شهادة معتمدة",
    lines: [
      "شعارات موثوقة: LPPOM MUI (إندونيسيا)، JAKIM (ماليزيا)، HFA، AVS، HMC، SFCVH.",
      "شعار «حلال» دون ذكر جهة تصديق لا قيمة له.",
      "تأكد من صلاحية رقم الشهادة على موقع الجهة المانحة.",
    ],
  },
  {
    title: "٥. احذر التلوث المتبادل",
    lines: [
      "قد يُصنَّع المنتج على نفس الخط الذي يعالج لحم الخنزير والجيلاتين الحيواني.",
      "عبارة «قد يحتوي على» تشمل أيضًا المشتقات الحيوانية.",
    ],
  },
  {
    title: "٦. عند الشك",
    lines: [
      "اتصل بالمُصنّع؛ فتركيب الإضافات معلومة يمكن الإفصاح عنها.",
      "قال النبي ﷺ: «دع ما يريبك إلى ما لا يريبك».",
      "هذه الأداة للمساعدة على القرار ولا تغني عن فتوى عالم.",
    ],
  },
];

const ps: GuideBlock[] = [
  {
    title: "۱. د اجزاوو لړلیک ولولئ",
    lines: [
      "د هر ډول حیواني اجزاوو په اړه پلټنه وکړئ: جیلاټین، پنیراو، وازګه، د خنزیر شحم، ښوروا.",
      "د E کوډونه وڅېړئ: E120 (کوچنیل)، E441 (جیلاټین)، E471/E472، E542، E904.",
      "طبیعي بویونه کېدای شي الکول ولري: تر هغه چې جوړوونکي روښانه کړي نه وي شکمن دي.",
    ],
  },
  {
    title: "۲. الکولو ته پاملرنه وکړئ",
    lines: [
      "ایتانول، ایتیل الکول، د سرکې شراب، د وانیلا الکولي بوی، خمر.",
      "هغه الکول چې د بوی د لېږدولو لپاره کارول کېږي تر څو چې پاتې شونې ثابته نشي شکمن پاتې کېږي.",
    ],
  },
  {
    title: "۳. غوښه او ذبح کول وڅېړئ",
    lines: [
      "غوښه یوازې هغه وخت حلاله ده چې د الله په نوم د اسلامي شریعت له مخې حلاله شوې وي.",
      "«بې له خنزیر» د حلال مانا نه لري؛ د ذبحې طریقه هومره مهمه ده څومره چې د حیوان نسل.",
    ],
  },
  {
    title: "۴. معتبرې نښې او اسناد ولټوئ",
    lines: [
      "باوري لوګوګانې: LPPOM MUI (اندونیزیا)، JAKIM (مالیزیا)، HFA، AVS، HMC، SFCVH.",
      "د تصدیق کوونکې ادارې له نوم پرته د «حلال» نښه هېڅ ارزښت نه لري.",
      "ډاډ ترلاسه کړئ چې د شهادتنامې شمېره د مرجع ادارې په ویبپاڼه کې لا باوري ده.",
    ],
  },
  {
    title: "۵. د ککړتیاوو تبادلې ته پام وکړئ",
    lines: [
      "ممکنه ده د پروسس برخه د خنزیر او حیواني جیلاټین په ورته لیکه کې کارول شوې وي.",
      "د «کېدای شي ولري» پام لرنه حیواني مشتقاتو ته هم شامله ده.",
    ],
  },
  {
    title: "۶. د شک پر مهال",
    lines: [
      "له جوړوونکي سره اړیکه ونیسئ؛ د اجزاوو کچه هغه معلومات دي چې روښانه کېدای شي.",
      "رسول الله ﷺ فرمايلي: «هغه څه پرېږده چې ستا په زړه کې شک پیدا کوي او هغه څه غوره کړه چې شک نلري».",
      "دا وسیله د پرېکړې لپاره مرستندویه ده او د عالم د فتوا ځای نه نیسي.",
    ],
  },
];

const fa: GuideBlock[] = [
  {
    title: "۱. فهرست ترکیبات را بخوانید",
    lines: [
      "به دنبال هرگونه ترکیبات حیوانی باشید: ژلاتین، پنیرمایه، چربی، شحم خوک، عصاره گوشت.",
      "کدهای E را بررسی کنید: E120، E441 (ژلاتین)، E471/E472، E542، E904.",
      "«طعم‌دهنده‌های طبیعی» ممکن است حاوی الکل باشند: بدون توضیح سازنده مشکوک هستند.",
    ],
  },
  {
    title: "۲. شناسایی الکل",
    lines: [
      "اتانول، اتيل الکل، سرکه شراب، عصاره وانیل الکلی، مشروبات.",
      "الکل استفاده‌شده به عنوان حامل طعم تا زمان مشخص شدن مقدار باقی‌مانده مشکوک می‌ماند.",
    ],
  },
  {
    title: "۳. بررسی گوشت و ذبح",
    lines: [
      "گوشت تنها در صورتی حلال است که حیوان طبق موازین شرعی و به نام الله ذبح شده باشد.",
      "«بدون گوشت خوک» به معنای حلال بودن نیست؛ نحوه ذبح به اندازه نوع حیوان اهمیت دارد.",
    ],
  },
  {
    title: "۴. جستجوی گواهی‌های معتبر",
    lines: [
      "لوگوهای معتبر: LPPOM MUI (اندونزی)، JAKIM (مالزی)، HFA، AVS، HMC، SFCVH.",
      "علامت «حلال» بدون ذکر مرجع صادرکننده ارزش اعتباری ندارد.",
      "از معتبر بودن شماره گواهی در وب‌سایت صادرکننده اطمینان حاصل کنید.",
    ],
  },
  {
    title: "۵. توجه به آلودگی متقاطع",
    lines: [
      "خط تولید یکسان ممکن است برای گوشت خوک و ژلاتین حیوانی نیز استفاده شود.",
      "عبارت «ممکن است حاوی باشد» شامل مشتقات حیوانی نیز می‌شود.",
    ],
  },
  {
    title: "۶. در صورت شک",
    lines: [
      "با سازنده تماس بگیرید؛ جزییات دقیق افزودنی‌ها اطلاعاتی قابل انتشار است.",
      "پیامبر اکرم ﷺ فرمودند: «آنچه تو را به شک می‌اندازد رها کن و به آنچه شک نداری روی آور.»",
      "این ابزار کمکی است و جایگزین نظر عالم دینی نمی‌شود.",
    ],
  },
];

const it: GuideBlock[] = [
  {
    title: "1. Leggi la lista degli ingredienti",
    lines: [
      "Cerca qualsiasi ingrediente di origine animale: gelatina, caglio, grasso, strutto, brodo.",
      "Controlla i codici E: E120 (cocciniglia), E441 (gelatina), E471/E472 (mono e digliceridi), E542, E904 (gommalacca).",
      "Gli «aromi naturali» possono contenere alcol: sono dubbi senza specifiche del produttore.",
    ],
  },
  {
    title: "2. Individua l'alcol",
    lines: [
      "Etanolo, alcol etilico, aceto di vino, estratto di vaniglia alcolico, liquori.",
      "L'alcol usato come supporto per aromi rimane dubbio finché non si conosce la quantità residua.",
    ],
  },
  {
    title: "3. Verifica carne e macellazione",
    lines: [
      "La carne è halal solo se l'animale è stato macellato ritualmente nel nome di Allah.",
      "«Senza maiale» non significa halal: il metodo di macellazione conta quanto la specie.",
    ],
  },
  {
    title: "4. Cerca una certificazione riconosciuta",
    lines: [
      "Logo affidabili: LPPOM MUI (Indonesia), JAKIM (Malesia), HFA, AVS, HMC, SFCVH.",
      "Un logo «halal» senza il nome dell'ente certificatore non ha valore.",
      "Verifica che il numero di certificato sia valido sul sito dell'ente.",
    ],
  },
  {
    title: "5. Attenzione alla contaminazione incrociata",
    lines: [
      "La stessa linea di produzione può trattare maiale e gelatina animale.",
      "L'avviso «può contenere» riguarda anche i derivati animali.",
    ],
  },
  {
    title: "6. In caso di dubbio",
    lines: [
      "Contatta il produttore: la composizione esatta degli additivi è un'informazione comunicabile.",
      "Il Profeta ﷺ ha detto: «Lascia ciò che ti fa dubitare per ciò che non ti fa dubitare.»",
      "Questo strumento è un aiuto decisionale e non sostituisce il parere di uno studioso.",
    ],
  },
];

const ru: GuideBlock[] = [
  {
    title: "1. Читайте состав ингредиентов",
    lines: [
      "Ищите любые ингредиенты животного происхождения: желатин, сычуг, жир, свиное сало, бульон.",
      "Проверяйте Е-добавки: E120 (кошениль), E441 (желатин), E471/E472, E542, E904 (шеллак).",
      "«Натуральные ароматизаторы» могут содержать алкоголь и являются сомнительными без уточнения производителя.",
    ],
  },
  {
    title: "2. Определяйте алкоголь",
    lines: [
      "Этанол, этиловый спирт, винный уксус, алкогольный экстракт ванили, ликёры.",
      "Спирт, используемый как носитель аромата, остаётся сомнительным, пока неизвестен остаточный уровень.",
    ],
  },
  {
    title: "3. Проверяйте мясо и убой",
    lines: [
      "Мясо является халяльным только в том случае, если животное забито ритуально с именем Аллаха.",
      "«Без свинины» не означает халяль: способ убоя так же важен, как и вид животного.",
    ],
  },
  {
    title: "4. Ищите признанный сертификат",
    lines: [
      "Надёжные логотипы: LPPOM MUI (Индонезия), JAKIM (Малайзия), HFA, AVS, HMC, SFCVH.",
      "Логотип «халяль» без указания органа по сертификации не имеет силы.",
      "Проверьте правильность номера сертификата на сайте органа.",
    ],
  },
  {
    title: "5. Остерегайтесь перекрёстного загрязнения",
    lines: [
      "Одна и та же производственная линия может обрабатывать свинину и животный желатин.",
      "Предупреждение «может содержать» также относится к животным производным.",
    ],
  },
  {
    title: "6. В случае сомнений",
    lines: [
      "Свяжитесь с производителем: точный состав добавок является открытой информацией.",
      "Пророк ﷺ сказал: «Оставь то, что вызывает у тебя сомнения, и обратись к тому, что не вызывает сомнений».",
      "Этот инструмент служит помощью в принятии решений и не заменяет фетву богослова.",
    ],
  },
];

export function getHalalGuide(locale: LocaleCode): GuideBlock[] {
  if (locale === "fr") return fr;
  if (locale === "ps") return ps;
  if (locale === "fa") return fa;
  if (locale === "it") return it;
  if (locale === "ru") return ru;
  if (locale.startsWith("ar")) return ar;
  return en;
}
