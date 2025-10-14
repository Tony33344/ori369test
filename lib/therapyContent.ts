export interface TherapyContent {
  id: string;
  name: string;
  shortDescription: string;
  duration: number;
  price: number;
  fullContent: {
    introduction: string;
    sections: {
      title: string;
      content: string;
    }[];
  };
}

export const therapyContentData: Record<string, TherapyContent> = {
  "elektrostimulacija": {
    id: "elektrostimulacija",
    name: "Elektrostimulacija",
    shortDescription: "Elektrostimulacija aktivira mišično tkivo, izboljšuje krvni obtok in lajša bolečine.",
    duration: 20,
    price: 20,
    fullContent: {
      introduction: "Elektrostimulacijska terapija je vrsta fizikalne terapije, ki s pomočjo električnega toka in električnih impulzov zmanjšuje bolečine, pospešuje celični metabolizem in hitrejše celjenje.",
      sections: [
        {
          title: "Kaj je Elektrostimulacijska Terapija?",
          content: "Elektrostimulacijska terapija je vrsta fizikalne terapije, ki s pomočjo električnega toka in električnih impulzov zmanjšuje bolečine, pospešuje celični metabolizem in hitrejše celjenje. Pri tej terapiji električni impulzi preko elektrod na koži prehajajo globlje v tkivo in povzročijo kemični in električni učinek na celice. Na celičnem nivoju olajšujejo prehod Ca+, K+ in Na– ionov in depolarizacijo živčnih vlaken ter mišično kontrakcijo.\n\nElektrični tok nizkih frekvenc (0-200Hz) pri tem deluje direktno in indirektno na vzdražna (mišice in živci) in nevzdražna (kosti in telesna maščoba) mišična tkiva. Indirektni učinek elektrostimulacije povzroča takojšnje zmanjšanje bolečine in mišične kontrakcije, direkten učinek pa pospešuje celični metabolizem in pospešeno celično rast.\n\nPoznamo dve vrsti elektrostimulacije: TENS in FES. TENS (Transcutaneos electrical nerve stimulation) se uporablja za zdravljenje bolečine, FES (Functional electrical stimulation) pa se uporablja za zdravljenje oslabljenih in poškodovanih mišic."
        },
        {
          title: "Kako Deluje Elektrostimulacijska Terapija s TENS-om?",
          content: "TENS (transkutana elektro-nevro stimulacija) z nizkofrekvenčnimi električnimi tokovi stimulira mielinizirana aferentna živčna vlakna na koži, kjer je prisotna bolečina. Pri tem lahko zmanjša ali blokira bolečino na 2 načina:\n\n**Teorija vrat** – električni tok, ki prehaja skozi kožo preko elektrod, draži in stimulira senzorične živce (debela mielinizirana aferentna živčna vlakna). Senzorični signal tako s terapijo nadomesti signal bolečine.\n\n**Teorija endorfinov** – nizki in kratki električni impulzi dražijo receptorje za bolečino v hrbtenjači in posledično stimulirajo tvorbo endorfinov v možganih. Endorfini so hormoni in naravni analgetiki, saj zmanjšujejo občutek bolečine in povzročajo občutek ugodja in sprostitve."
        },
        {
          title: "Glavni Učinki Elektrostimulacijske Terapije s FES-om",
          content: "FES (Funkcionalna električna stimulacija) s pomočjo električnih impulzov draži živčno-mišična vlakna in izvablja mišične kontrakcije. Električni impulz vzdraži motorični živec, ki se nahaja vzdolž poteka mišice in pošlje informacijo o signalu v možgane.\n\nMišica ne razlikuje, ali so ukaz za krčenje poslali možgani ali električni stimulator. Na ta način lahko:\n\n- Povečamo ali ponovno pridobimo mišično maso\n- Vzdržujemo ali povečamo obseg gibljivosti (po daljši imobilizaciji)\n- Zmanjšujemo spatičnost (npr. pri pacientih s cerebr alno paralizo)\n- Treniramo mišično moč in vzdržljivost"
        },
        {
          title: "Katere Poškodbe in Boleča Stanja Zdravimo?",
          content: "**S TENS-om** zdravimo vsa stanja, kjer je prisotna bolečina:\n- Mišične in sklepne bolečine\n- Bolečine v amputacijskem krnu\n- Bolečine pri malignih obolenjih\n- Revmatska obolenja (revmatoidni artritis)\n- Posthereptična bolečina\n- Splošna sprostitev celega telesa\n\n**S FES-om** zdravimo:\n- Atrofirane mišiče\n- Bolezen mišične distrofije\n- Mišične lezije\n- Zmanjšan obseg gibljivosti\n- Sindrom težkih nog\n- Mišične krče\n- Vensko in arterijsko insuficienco\n- Hemiplegično stopalo in hemiplegično ramo\n- Spastičnost udov\n- Nestabilnost sklepov\n- Inkontinenco"
        },
        {
          title: "Kdaj je Terapija Odsvetovana?",
          content: "**TENS je odsvetovan pri:**\n- Organskih okvarah srca (aritmija)\n- Srčnem spodbujevalniku\n- Majhnih otrocih in osebah, ki niso sposobne govoriti\n- Nezdravljenih rakavih obolenjih\n\n**FES je kontraindiciran pri:**\n- Srčnem spodbujevalniku ali defibrilatorju\n- Kovinskih implantih\n- Nosečnosti\n- Nediagnosticirani akutni poškodbi\n- Akutni krvavitvi\n- Rakavih obolenjih"
        },
        {
          title: "Koliko Časa Traja Zdravljenje?",
          content: "Zdravljenje s TENS-om lahko traja vse dokler se bolečina ne zmanjša ali izgine. S transkutano električno stimulacijo se zdravi tako akutno kot tudi kronično bolečino, zato je čas zdravljenja odvisen od posameznikovega stanja.\n\nZdravljenje s FES-om je v celoti odvisno od cilja, ki ga želimo doseči. Če želimo povrniti ali izboljšati mišično vzdržljivost je povprečen čas zdravljenja do 6 tednov."
        }
      ]
    }
  },
  "manualna-terapija": {
    id: "manualna-terapija",
    name: "Manualna Terapija",
    shortDescription: "Z nežnimi ročnimi tehnikami terapevt sprošča napetosti in izboljšuje gibljivost.",
    duration: 20,
    price: 30,
    fullContent: {
      introduction: "Manualna terapija je dobila ime iz besede manus=roka, ki nakazuje na uporabo terapevtovih rok, kot glavnega orodja zdravljenja. Je ena izmed najbolj priljubljenih oblik zdravljenja, saj človeka obravnava celostno.",
      sections: [
        {
          title: "Kaj Je Manualna Terapija?",
          content: "Manualna terapija je dobila ime iz besede manus=roka, ki nakazuje na uporabo terapevtovih rok, kot glavnega orodja zdravljenja. Je ena izmed najbolj priljubljenih oblik zdravljenja, saj človeka obravnava celostno. Ne osredotoča se samo na odpravo simptomov (bolečin, vnetij, podplutb), pač pa tudi na iskanje vzrokov za nastanek težav in je tako lahko učinkovito orodje v procesu diagnostike.\n\nManualna terapija na telo pacienta deluje direktno ali indirektno. Obema načinoma je skupen cilj ustvarjanje pozitivnih sprememb v pacientovem živčnem sistemu, tkivu in doživljanju bolečine."
        },
        {
          title: "Katera Zdravstvena Stanja Zdravimo?",
          content: "Zdravstvena stanja, ki jih zdravimo z manualno terapijo vključujejo težave s sklepi, mišicami, vezmi in drugimi mehkimi tkivi:\n\n- **Bolečine v križu** – lajšamo bolečine v spodnjem hrbtu ter bolečine, povezane s hernijo diska, mišičnimi napetostmi, skoliozo\n- **Bolečine v vratu** – sprostitev mišic, izboljšanje gibljivosti vratnih vretenc\n- **Športne poškodbe** – zdravljenje poškodb mišic, kit, vezi in sklepov\n- **Artroza** – mobilizacija sklepov, terapevtska masaža\n- **Artritis** – olajšanje bolečin pri osteoartritisu ali revmatoidnem artritisu\n- **Tendinitis** – zmanjšanje obremenitve tetive\n- **Bursitis** – zmanjševanje vnetja burze okoli sklepov\n- **Skolioza** – izboljšanje drže in zmanjšanje bolečine\n- **Multipla skleroza** – lajšanje spastičnosti\n- **Cerebralna paraliza** – izboljšanje motoričnih funkcij\n- **Glavoboli** – sprostitev mišic v vratu in ramenih\n- **Rehabilitacija po operacijah** – obnovitev gibljivosti in moči"
        },
        {
          title: "Osnovne Tehnike Manualne Terapije",
          content: "Pri vseh manualnih tehnikah terapevt z fizičnim delovanjem na telo manipulira mišične strukture, fascije in vezivno tkivo. Osnovne tehnike, ki jih uporabljamo:\n\n- Manipulacija fascij z Myoskeletal Alignment Techniques\n- Mobilizacija živčevja\n- IASTM terapija\n- Terapevtska masaža – športna in sprostitvena masaža\n- Suho iglanje – dry needling\n- Akupunktna masaža po Penzlu\n- Trigger point terapija\n- Terapija z ventuzami – cupping\n- Sklepna mobilizacija in manipulacija\n- Mediataping\n- Terapevtska vadba\n- Prečna frikcija\n- Samomasaža z masažnim valjem"
        },
        {
          title: "Glavni Učinki Manualne Terapije",
          content: "**1. Lajšanje bolečine** – zmanjšanje bolečine z uporabo masaže, mobilizacije sklepov ali manipulacije mehkih tkiv.\n\n**2. Izboljšanje gibljivosti** – obnovitev ali izboljšanje gibljivosti prizadetih sklepov z raztezanjem, mobilizacijo in manipulacijo.\n\n**3. Obnova funkcije** – obnova ali izboljšanje funkcije prizadetega dela telesa, še posebej pomembno pri rehabilitaciji.\n\nDrugi učinki: zmanjševanje vnetnih procesov, zmanjšanje možnosti za ponovne poškodbe, izboljšanje mišičnega ravnovesja, zmanjšanje stresa in sprostitev celotnega telesa."
        },
        {
          title: "Indikacije in Kontraindikacije",
          content: "**Indikacije:**\n- Mišično–skeletne bolečine\n- Mišične napetosti\n- Poškodbe mehkih tkiv\n- Zmanjšan obseg giba v sklepu\n- Artritična stanja\n- Športne poškodbe\n- Nekatera nevrološka stanja\n- Telesne asimetrije\n- Rehabilitacija po in pred operacijo\n\n**Absolutne kontraindikacije:**\n- Hude poškodbe hrbtenice (npr. zlomi)\n- Akutni zlomi\n- Akutne nevrološke motnje\n- Kostne okužbe\n- Nezdravljena hipertenzija\n- Akutna vnetja ali poškodbe\n- Krvne motnje\n- Tumorji\n- Huda bolečina, ki se poslabša z gibanjem"
        },
        {
          title: "Koliko Časa Traja Zdravljenje?",
          content: "Trajanje zdravljenja je odvisno od vrste in resnosti poškodbe, posameznikovega odziva na terapijo in ciljev zdravljenja.\n\n**Pri akutnih stanjih** in manjših poškodbah se izboljšanje pojavi razmeroma hitro (med 3-6 terapij).\n\n**Pri hujših poškodbah** ali kroničnih težavah pa zdravljenje lahko traja od nekaj tednov do več mesecev.\n\nVsak primer je edinstven, zato je natančno trajanje odvisno od individualnih potreb, napredka terapevtskega procesa in priporočil terapevta."
        }
      ]
    }
  },
  "tecar-terapija": {
    id: "tecar-terapija",
    name: "Tecar Terapija",
    shortDescription: "Napredna terapija s pomočjo radiofrekvenčne energije.",
    duration: 30,
    price: 40,
    fullContent: {
      introduction: "TECAR terapija je napredna oblika zdravljenja, ki s pomočjo radiofrekvenčne energije pospešuje regeneracijo tkiv, lajša bolečine in izboljšuje cirkulacijo ter presnovo celic.",
      sections: [
        {
          title: "Kaj Je TECAR Terapija?",
          content: "Glavni cilj terapije je stimulacija telesu lastnih fizioloških procesov celjenja. TECAR terapija skrajša čas zdravljenja ter pozitivno vpliva na krepitev notranjih obnovitvenih sposobnosti tkiv. Uporabljamo jo v kombinaciji z manualno terapijo in na ta način globinsko zmehčamo mišično tkivo ter pospešujemo naravne presnovne procese.\n\nTerapija omogoča zdravljenje različnih težav na različnih delih telesa kot so tendinitisi, adhezivni kapsulitisi, teniški in golfski komolci, burzitisi, artroze kolka, kolena, pubalgije, zlomi, zvini, plantarni fasciitis, bolečine v križu, vratu, brazgotine itd.\n\nLahko se izvaja kot samostojna terapija ali pa kot dopolnitev k ostalim terapijam."
        },
        {
          title: "Kako Deluje TECAR Terapija?",
          content: "TECAR terapija je oblika zdravljenja, ki temelji na proizvajanju toplotne energije. Gre za neinvazivno visokofrekvenčno energijo, ki spodbuja biološke procese samoregeneracije v celicah. S tem spodbuja naravne fiziološke procese tkiva in metabolizma, kar posledično pospešuje celjenje.\n\n**TECAR aparatura** vključuje premično elektrodo (fizioterapevti jo rokujejo), fiksno elektrodo (je v stiku s kožo pacienta in deluje kot prevodnik), ter kontaktno kremo.\n\n**Dva načina prenosa energije:**\n\n- **Kapacitivna elektroda** – usmerjena v tkiva z večjo vsebnostjo elektrolitov (mehka tkiva in mišice)\n- **Rezistivna elektroda** – osredotoča se na večje in bolj odporne strukture (tetive, kosti in sklepi)"
        },
        {
          title: "Glavni Klinični Učinki",
          content: "Glavni klinični učinki zdravljenja s TECAR terapije so:\n\n- **Pospeševanje celjenja** in regeneracije tkiva\n- **Centralizacija simptomov** – naprava v tkivu sproži proces samoceljenja\n- **Boljša cirkulacija krvi** – ključnega pomena za celjenje v akutni fazi poškodbe\n- **Pospešen dovod kisika** v celicah omogoča hitrejšo regeneracijo\n- **Zmanjševanje bolečine** – blagodejno delovanje na bolečinske receptorje"
        },
        {
          title: "Klinične Indikacije",
          content: "Prednosti in klinične indikacije pri zdravljenju s TECAR terapijo:\n\n- Poškodbe mehko-tkivnih struktur in zmanjševanje edema\n- Pospeševanje celjenja in podpora vnetnim procesom\n- Sproščanje hipertoničnih mišic\n- Pospeševanje procesa obnove različnih struktur (sklepi, mišice, tkiva, celice)\n- Lajšanje bolečin v mišicah in sklepih\n- Trajno blokiranje živčnih impulzov\n- Povečanje obsega gibljivosti\n- Izboljšanje krvnega obtoka"
        },
        {
          title: "Katere Poškodbe In Boleča Stanja Zdravimo?",
          content: "S TECAR Terapijo odpravljamo različne poškodbe, ki za zdravljenje potrebujejo pospešen pretok krvi, samoceljenje in večjo prožnost post operativnih brazgotin. Terapijo lahko izvajamo v akutni, subakutni in post operativni fazi.\n\n**Pogoste poškodbe:**\n\n- Specifične in nespecifične bolečine v hrbtu\n- Artroza kolka in kolena\n- Sklepni artritis\n- Sindrom zamrznjene rame\n- Skakalno koleno\n- Teniški komolec\n- Sindrom karpalnega kanala\n- Vnetje sklepov in sklepnih ovojnic\n- Po rekonstrukciji sprednje križne vezi (ACL)\n- Poškodbe ligamentov\n- SLAP lezija\n- Poškodba upogibovalk kolena\n- Mišična bolečina\n- Vnetje živcev\n- Poškodba zadnjih stegenskih strun"
        },
        {
          title: "Kontraindikacije in Previdnosti",
          content: "**Kontraindikacije in previdnosti TECAR terapije:**\n\n- Previdnost pri nosečnicah okoli trebuha\n- Motnje senzibilitete\n- Vnetne spremembe na koži in odprte rane\n- Krvavitve\n- Maligna stanja\n- Vročinska stanja\n- Infekcije\n- Kovinski predmeti na koži in aktivne implantirane medicinske naprave\n- Previdnost pri rastnih conah otrok\n\nPred apliciranjem terapije se izvede fizioterapevtski pregled z anamnezo."
        }
      ]
    }
  },
  "magnetna-terapija": {
    id: "magnetna-terapija",
    name: "Magnetna Terapija",
    shortDescription: "Uporaba magnetnih polj za stimulacijo telesa in regeneracijo.",
    duration: 20,
    price: 30,
    fullContent: {
      introduction: "Magnetno polje se ustvari s pomočjo električne naprave, ki ustvarja elektromagnetno valovanje. Le to v človeškem organizmu povzroči dvig celičnega metabolizma, tkivo pa je posledično bolj obogateno s kisikom in snovmi, ki jih potrebuje za lastno obnovo in celjenje.",
      sections: [
        {
          title: "Kaj je Magnetna Terapija?",
          content: "Magnetno polje se ustvari s pomočjo električne naprave, ki ustvarja elektromagnetno valovanje. Le to v človeškem organizmu povzroči dvig celičnega metabolizma, tkivo pa je posledično bolj obogateno s kisikom in snovmi, ki jih potrebuje za lastno obnovo in celjenje.\n\nLočimo dve vrsti magnetne terapije:\n\n- **Nizkofrekvenčna magnetoterapija** – ustvarja magnetno polje s frekvenco nižjo od 50 Hz in se uporablja predvsem za celjenje kostnih zlomov\n- **Visokofrekvenčna magnetoterapija** – ustvarja magnetno polje s frekvenco med 2000 do 3000 Hz in se uporablja pri kompleksnejših poškodbah in degenerativnih boleznih\n\nMagnetno polje lahko penetrira skozi vsa tkiva. To velja predvsem pri aplikaciji, saj deluje čez oblačila in mavec."
        },
        {
          title: "Kako Magnetoterapija Zdravi Poškodbe?",
          content: "Magnetoterapija poškodbe in boleča stanja zdravi na način, da izboljšuje mehanske in kemične procesne mehanizme, ki se odvijajo na nivoju celice.\n\n**Magnetna polja v celici povzročijo:**\n\n1. Povišan metabolizem\n2. Povečano propustnost in elastičnost celične membrane\n3. Povečano aktivnost in energijsko zalogo celice\n4. Pospešeno celično komunikacijo in njeno podvajanje\n5. Pospešeno celično obnovo in rast\n\n**Učinki na telo:**\n\n- Zmanjšanje in odprava bolečine\n- Zmanjšanje vnetja in otekline\n- Povečanje obsega gibljivosti\n- Pospešeno celjenje tkiv\n- Pospešena regeneracija živcev\n- Krepi kostna tkiva\n- Sprošča mišične spazme"
        },
        {
          title: "Biološka Stimulacija",
          content: "Biološka stimulacija je proces spodbujanja celičnih bioloških aktivnosti, ki pripomorejo k njeni obnovi, rasti in regeneraciji. Aktivacija presnovnih procesov in povečanih energijskih zalog v celici vpliva na zdravljenje tkiva.\n\nKo magnetno polje penetrira v tkivo, se v tkivu sprosti dodatna energija, ki jo celica izkoristi za tvorbo različnih molekul. Molekule, kot so NO2 (dušikov oksid) zmanjšujejo bolečino, vnetje in oteklino, osteofiti pa pospešujejo celjenje kosti, s pomočjo tvorbe novega kostnega tkiva."
        },
        {
          title: "Vpliv Na Zmanjšanje Bolečine",
          content: "Magnetna terapija zmanjšuje ali v celoti blokira bolečino tako, da:\n\n- Stimulira tvorbo vnetnih mediatorjev (citokini in prostaglandini)\n- Aktivira sproščanje endorfinov v krvni obtok\n- Modulira živčne impulze in zmanjša prenos bolečinskih signalov\n- Pospeši krvni obtok za izboljšano oskrbo s kisikom in hranilnimi snovmi"
        },
        {
          title: "Katera Zdravstvena Stanja Zdravimo?",
          content: "Najpogostejša zdravstvena stanja, ki jih lahko učinkovito zdravimo z magnetno terapijo:\n\n- Artritis sklepov (revmatoidni artritis)\n- Ankilozirajoči spondilitis\n- Postoperativna stanja\n- Zlomi kosti\n- Osteoporoza\n- Osteoartroza\n- Hernija diska\n- Zamrznjena rama\n- Parestezije (mravljinčenje v okončinah)\n- Vnetje išiasa\n- Lumbalgija\n- Bolečine v hrbtu različnih izvorov\n- Poškodbe hrbtenjače\n- Vnetje perifernih živcev\n- Sindrom karpalnega kanala"
        },
        {
          title: "Kontraindikacije",
          content: "**Magnetna terapija je kontraindicirana pri:**\n\n- Prisotnosti kovinskih implantantov v telesu (ortopedski vsadki, zobni implanti)\n- Prisotnosti elektronskih naprav v telesu (srčni spodbujevalnik, notranji defibrilator)\n- Nosečnosti\n- Malignih obolenjih (predvsem nezdravljena)\n- Motnjah krvnega obtoka (globoka venska tromboza)\n- Akutnih okužbah (vnetna in infekcijska stanja)"
        },
        {
          title: "Trajanje Zdravljenja",
          content: "Trajanje zdravljenja z magnetoterapijo je v veliki meri odvisno od diagnoze. Najpomembnejše je, da se terapija izvaja redno in da se samo aplikacijo postopoma podaljšuje (časovno).\n\nDokazano je bilo, da je magnetna terapija najbolj učinkovita, če se jo izvaja vsak dan v nekoliko daljšem časovnem obdobju – meseci do leta. Pri prizadetosti skeletnega sistema je priporočena aplikacija magneta celo več krat dnevno."
        }
      ]
    }
  },
  "cupping": {
    id: "cupping",
    name: "Cupping (Ventuze)",
    shortDescription: "Terapija z ventuzami za celjenje in regeneracijo.",
    duration: 30,
    price: 30,
    fullContent: {
      introduction: "Terapija z ventuzami (cupping), je manualna tehnika, ki s pomočjo majhnih skodelic (ventuz) pospešuje celjenje, regeneracijo in lajša simptome bolečih stanj.",
      sections: [
        {
          title: "Kaj Je Terapija z Ventuzami?",
          content: "Terapija z ventuzami (cupping), je manualna tehnika, ki s pomočjo majhnih skodelic (ventuz) pospešuje celjenje, regeneracijo in lajša simptome bolečih stanj. Ventuze terapevt namesti na kožo tako, da jo ta posesa vase, ustvari vakuum in poveča cirkulacijo.\n\nV terapiji se za cupping uporabljajo silikonske, plastične ali steklene ventuze, skozi katere je moč videti kožno tkivo. Terapija z ventuzami se najpogosteje uporablja za lajšanje simptomov kroničnih bolečin, fibromialgije, bolečin v križu in vratu ter nevralgičnih bolečin.\n\nTerapija z ventuzami je najstarejša tradicionalna kitajska medicinska metoda. Njena uporaba se omenja že v času egipčanskih civilizacij."
        },
        {
          title: "Kako Deluje Terapija z Ventuzami?",
          content: "Terapija z ventuzami lahko pospešuje izmenjavo snovi potrebnih za regeneracijo, ter odvod odpadnih snovi in toksinov iz človekovega telesa.\n\n**Mokra tehnika** – z majhnim prerezom na koži omogočimo takojšnjo odstranitev toksinov skupaj z odpadno krvjo. Na mesto lahko pride sveža kri obogatena s kisikom in hranljivimi sestavinami za tkivo.\n\n**Teorija živčnega sistema** – ventuze, ki jih apliciramo na kožo, vzdražijo periferne živce, ti pa pošljejo signale v možgane. Možgani naj bi v tem primeru reagirali po principu »teorije vrat« zmanjševanja in blokiranja bolečinskih dražljajev."
        },
        {
          title: "Učinki in Prednosti Terapije",
          content: "**Učinki na različnih nivojih:**\n\n- **Koža** – izboljša metabolizem, delovanje žlez znojnic, lojnic in celjenje ran\n- **Mišice** – spodbuja pretok krvi skozi mišice in limfno drenažo\n- **Sklepi** – poveča pretok krvi in sekrecijo sinovialne tekočine\n- **Krvni sistem** – izboljšuje delovanje rdečih in belih krvnih telesc\n- **Živčni sistem** – stimulira senzorične periferne živce\n\n**Skupni učinki:**\n\n- Zmanjšan občutek bolečine\n- Zmanjšano vnetje\n- Izboljšana cirkulacija\n- Hitrejša regeneracija tkiva\n- Hitrejše celjenje poškodovanega tkiva\n- Izboljšano delovanje imunskega sistema\n- Sprostitev celega telesa\n- Odprava škodljivih snovi iz telesa"
        },
        {
          title: "Pri Katerih Zdravstvenih Težavah Uporabljamo Cupping?",
          content: "Cupping terapijo najpogosteje uporabljamo za:\n\n- Kronične bolečine\n- Bolečine v vratu in križu\n- Hernija diska\n- Glavoboli in migrene\n- Utesnitveni sindromi (karpalni kanal, sindrom rame)\n- Vnetna stanja in otekline\n- Boleče mišice in trigger točke\n- Mišični spazmi in zakrčenost\n- Artritis in spondilitis\n- Oslabljena gibljivosti sklepov\n- Bolečine v kolenu\n- Artroza sklepov\n- Športne poškodbe\n- Hipertenzija\n- Oslabljen krvni obtok\n- Oslabljeno delovanje limfe\n- Stres in napetosti\n- Astma in bronhitis\n- Težave s prebavo"
        }
      ]
    }
  },
  "dryneedeling": {
    id: "dryneedeling",
    name: "Dry Needling",
    shortDescription: "Invazivna fizioterapevtska metoda s suhim iglanjem.",
    duration: 30,
    price: 30,
    fullContent: {
      introduction: "Dry needeling (terapija s suhim iglanjem), je invazivna fizioterapevtska metoda, ki s penetracijo tankih igel skozi kožo stimulira miofascialne prožilne točke, mišice in vezivno tkivo ter s tem zdravi živčno-mišično-skeletna obolenja in poškodbe.",
      sections: [
        {
          title: "Kaj Je Dry Needeling Terapija?",
          content: "Dry needeling (terapija s suhim iglanjem), je invazivna fizioterapevtska metoda, ki s penetracijo tankih igel skozi kožo stimulira miofascialne prožilne točke, mišice in vezivno tkivo ter s tem zdravi živčno-mišično-skeletna obolenja in poškodbe.\n\nMio-fascialne prožilne točke (Myofascial trigger points) so hiperrazdražljive točke v skeletni mišici, ki so povezane z občutljivim in otipljivim vozličem v napetem delu mišičnega vlakna. S stimulacijo mio-fascialnih prožilnih točk izovemo fiziološke procese, ki povzročajo zmanjšanje oziroma odpravo bolečine.\n\nDry needeling metoda triger točk je bila prvič oklicana in priznana metoda v letu 1979 s strani Češkoslovaškega zdravnika dr. Karla Lewit-a."
        },
        {
          title: "Kako Deluje in Učinkuje Dry Needeling?",
          content: "Dry needeling deluje in učinkuje na dveh nivojih:\n\n**PERIFERNI UČINKI** (lokalni odziv s trzljajem):\n\nKo terapevt vbode iglo v prožilno točko pride do »lokalnega odziva s trzanjem«. Trzljaj je refleks, ki povzroči da se zakrčeno mišično vlakno oziroma vozlič sprosti in da se de-organizirana mišična vlakna ponovno vrnejo v prvotno organizirano stanje. Posledično se tkivo oziroma mišica vrne v svojo primerno dolžino, izboljša pa se lokalni krvni pretok.\n\n**CENTRALNI UČINKI** (teorija vrat, placebo):\n\nKo se igla zapiči v prožilno točko se istočasno stimulira velika aferentna živčna vlakna, ki potekajo od periferije preko hrbtenjače in nato v možgane. Ta stimulirana vlakna v možgane začnejo pošiljati informacije o tem, da se na periferiji nekaj dogaja (vbod igle), s tem pa se prenos signalov o lokalni bolečini zmanjša in počasi izzveni. Temu procesu pravimo »teorija vrat«."
        },
        {
          title: "Katere Težave Učinkovito Zdravimo?",
          content: "Z dry needling terapijo učinkovito zdravimo:\n\n- Sindrom miofascialne bolečine\n- Mišični spazmi in povečan mišični tonus\n- Tendinopatije (teniški komolec, golf komolec, tendinitis ahilove tetive, supraspinatusa)\n- Tekaško koleno, patelarni tendinitis\n- Stare brazgotine\n- Multipla skleroza\n- Kronične bolečine v vratu in križu\n- Glavoboli in migrene\n- Bruksizem\n- Težave s temporomandibularnim sklepom\n- Vnetja perifernih živcev (n. radialis, trovejni obrazni živec, išias)\n- Utesnitveni sindrom (karpalni kanal, rotatorna manšeta, piriformis, tarzalni sindrom)\n- Fantomske bolečine\n- Skolioza\n- Bolečine v medenici"
        },
        {
          title: "Kontraindikacije",
          content: "**Absolutne kontraindikacije:**\n\n- Strah pacienta pred iglami\n- Vsa akutna stanja in poškodbe\n- Področje ali okončina z limfedemom\n- Področje ali okončina po odstranitvi bezgavk\n- Nesodelujoč pacient\n- Pacient, ki se ni sposoben izraziti\n\n**Relativne kontraindikacije:**\n\n- Posamezniki s parestezijami\n- Nosečnice\n- Otroci\n- Pacienti na antikoagulantni terapiji\n- Osteoporotični posamezniki\n- Posamezniki z epilepsijo\n- Povečano tveganje za infekcije\n- Občutljivi pacienti"
        },
        {
          title: "Razlika Med Dry Needeling in Akupunkturo",
          content: "**Akupunktura** temelji na tradicionalni kitajski medicini in prepričanju, da je za bolezni in poškodbe krivo porušeno energijsko ravnovesje. Pri akupunkturni tehniki terapevti obravnavajo akupunkturne (energetske točke) z namenom, da bi se spet vzpostavilo energijsko ravnovesje.\n\n**Dry needeling** izhaja iz sodobne medicine in temelji na natančni anatomiji in fiziologiji živčno-mišično-skeletnega sistema. Pri dry needeling terapiji terapevt obravnava trigger točke (prožilne točke), v katere vstavi tanke terapevtske igle. Te točke se nahajajo v samih mišicah in mišičnih fascijah.\n\nGlavni namen terapije s suhim iglanjem je sprostitev zakrčene mišice in s tem odprava bolečine in drugih simptomov."
        },
        {
          title: "Koliko Obravnav Bom Potreboval?",
          content: "Število obravnav temelji na posameznikovem zdravstvenem stanju oziroma na zdravstveni težavi, ki zahteva zdravljenje z dry needeling tehniko.\n\nVeliko vlogo pri tem igra telesni in psihološki odziv posameznika na terapijo. Pri določenih posameznikih je izboljšanje mogoče zaznati že po samo eni obravnavi. Običajno sicer tudi velja da je pri zdravljenju s suhim iglanjem potrebnih le par terapij (1-5).\n\nDolgotrajna uporaba te tehnike ni zaželena, saj gre še vseeno za invazivno metodo, ki predstavlja večje tveganje za nastanek stranskih in neželenih učinkov."
        }
      ]
    }
  },
  "mis": {
    id: "mis",
    name: "MIS (Magnetna indukcijska stimulacija)",
    shortDescription: "Magnetna indukcijska stimulacija - revolucionarna terapija.",
    duration: 20,
    price: 30,
    fullContent: {
      introduction: "Magnetna indukcijska stimulacija (MIS) je revolucionarna terapija, ki z inovativnim pristopom zagotavlja izjemne rezultate.",
      sections: [
        {
          title: "Kaj je Magnetna Indukcijska Stimulacija?",
          content: "Nezdrave celice napolni in stimulira z izboljšano oksigenacijo in cirkulacijo ter jim povrne normalno delovanje. Izboljša tudi celično absorpcijo kisika in hranilnih snovi, hkrati pa odstrani toksine, zaradi česar se zmanjšajo vnetja in bolečine ter skrajša čas okrevanja."
        },
        {
          title: "Glavni Učinki",
          content: "S svojim edinstvenim ekscitativnim učinkom se MIS bistveno razlikuje od tradicionalnih terapij. Spodbuja nastajanje novih krvnih žil in s tem izboljša prekrvavitev na območju poškodbe. Fokusni udarni valovi so se izkazali za zelo učinkovite pri zdravljenju kroničnih bolečinskih stanj."
        }
      ]
    }
  },
  "laserska-terapija": {
    id: "laserska-terapija",
    name: "Laserska Terapija",
    shortDescription: "Neinvazivna metoda z laserskimi svetlobnimi žarki.",
    duration: 10,
    price: 10,
    fullContent: {
      introduction: "Laserska terapija je neinvazivna metoda zdravljenja, ki s pomočjo laserskih svetlobnih žarkov stimulira človeško tkivo z namenom zmanjšanja bolečine in pospešitve regeneracije.",
      sections: [
        {
          title: "Kaj Je Laserska Terapija?",
          content: "Beseda laser pomeni ojačanje svetlobe s stimulirano emisijo sevanja. Ta vrsta terapije ima zelo širok spekter uporabe in je primerna za lajšanje simptomov akutnih poškodb in bolezni, kot tudi za preprečevanje poslabšanja simptomov pri kroničnih bolečinah in boleznih."
        },
        {
          title: "Glavni Učinki",
          content: "Glavna učinka zdravljenja sta celjenje ran in kontrola bolečine. Pri celjenju ran prihaja do pospešene celične proliferacije, povečane sinteze kolagena in manjšanja brazgotinskega tkiva. Pri kontroli bolečine se zmanjša občutek bolečine zaradi sproščanja endorfinov in izboljšane mikrocirkulacije."
        }
      ]
    }
  },
  "media-taping": {
    id: "media-taping",
    name: "Media Taping",
    shortDescription: "Metoda z elastičnimi traki za odpravo bolečin in otekline.",
    duration: 10,
    price: 10,
    fullContent: {
      introduction: "Medi taping je metoda zdravljenja, ki z aplikacijo samolepilnih elastičnih trakov na kožo odpravlja bolečine, otekline in druge simptome poškodb.",
      sections: [
        {
          title: "Kaj Je Media Taping?",
          content: "Mediateping pomaga telesu ponovno vzpostaviti homeostazo. Terapija je primerna v akutni in subaktuni fazi, v kronični in rehabilitacijski fazi in celo kot preventiva pred poškodbami. Samolepilni elastični trakovi so izdelani iz bombažnih in elastičnih vlaken."
        },
        {
          title: "Kako Delujejo Trakovi?",
          content: "Trakovi preko kože delujejo na možgane in učinkujejo na vse fiziološke sisteme. Trak stimulira aktivacijo mehanoreceptorjev in nociceptorjev ter izzove reakcije telesa, ki se kažejo kot zmanjšan občutek bolečine, izboljšana cirkulacija in zmanjšanje vnetja."
        }
      ]
    }
  }
};

export function getTherapyBySlug(slug: string): TherapyContent | undefined {
  return therapyContentData[slug];
}

export function getAllTherapySlugs(): string[] {
  return Object.keys(therapyContentData);
}
