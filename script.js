const WA="963950078785";
const gymPhotos=["IMG_3952.webp","IMG_3955(1).webp","IMG_3957(1).webp","IMG_3958(1).webp","IMG_3961(1).webp","IMG_3960(1).webp","IMG_3959(1).webp"];
const coaches=[
 {name:"HUSSEIN BAKKOR",arName:"حسين بكور",specialty:"Strength & Conditioning",arSpecialty:"القوة واللياقة البدنية",hours:"Daily · 10:00 — 18:00",arHours:"يومياً · 10:00 — 18:00",image:"assets/coaches/coach1.webp"},
 {name:"AHMAD ATKIEDDIEN",arName:"أحمد تقي الدين",specialty:"Bodybuilding & Hypertrophy",arSpecialty:"كمال الأجسام وتضخيم العضلات",hours:"Daily · 14:00 — 22:00",arHours:"يومياً · 14:00 — 22:00",image:"assets/coaches/coach2.webp"},
 {name:"MOTASIEM MOJAHED",arName:"معتصم مجاهد",specialty:"Fitness & Weight Loss",arSpecialty:"اللياقة وخسارة الوزن",hours:"Daily · 16:00 — 23:00",arHours:"يومياً · 16:00 — 23:00",image:"assets/coaches/coach3.webp"},
 {name:"MANAL ALAHMAD",arName:"منال الأحمد",specialty:"Strength & Conditioning",arSpecialty:"القوة واللياقة البدنية",hours:"Daily · 10:00 — 18:00",arHours:"يومياً · 10:00 — 18:00",image:"assets/coaches/coach4.webp"},
 {name:"MOHAMMED TALLAG",arName:"محمد تلاج",specialty:"Strength & Conditioning",arSpecialty:"القوة واللياقة البدنية",hours:"Daily · 10:00 — 18:00",arHours:"يومياً · 10:00 — 18:00",image:"assets/coaches/coach5.webp"}
]
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let currentPhoto=0, autoTimer=null;
const galleryImage=$("#galleryImage"), stage=$("#galleryStage"), photoNumber=$("#photoNumber"), thumbs=$("#thumbs"), progress=$("#galleryProgress");
gymPhotos.forEach((file,i)=>{const b=document.createElement("button");b.type="button";b.innerHTML=`<img src="assets/gym/${file}" alt="AKGYM gym view ${i+1}" loading="lazy" decoding="async" width="112" height="70">`;b.onclick=()=>showPhoto(i,true);thumbs.appendChild(b)});
function showPhoto(i,manual=false){currentPhoto=(i+gymPhotos.length)%gymPhotos.length;stage.classList.add("changing");setTimeout(()=>{galleryImage.src=`assets/gym/${gymPhotos[currentPhoto]}`;photoNumber.textContent=String(currentPhoto+1).padStart(2,"0");progress.style.width=`${((currentPhoto+1)/gymPhotos.length)*100}%`;$$('#thumbs button').forEach((b,n)=>b.classList.toggle('active',n===currentPhoto));stage.classList.remove('changing')},180);if(manual) restartGallery()}
function restartGallery(){clearInterval(autoTimer);autoTimer=setInterval(()=>showPhoto(currentPhoto+1),5200)}
showPhoto(0);restartGallery();$("#prevPhoto").onclick=()=>showPhoto(currentPhoto-1,true);$("#nextPhoto").onclick=()=>showPhoto(currentPhoto+1,true);stage.onmouseenter=()=>clearInterval(autoTimer);stage.onmouseleave=restartGallery;

function openModal(id){const m=$("#"+id);m.classList.add("open");m.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeModals(){ $$('.modal.open').forEach(m=>{m.classList.remove('open');m.setAttribute('aria-hidden','true')});document.body.style.overflow="" }
$$('[data-close]').forEach(b=>b.onclick=closeModals);$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModals()}));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});

const coachGrid=$("#coachGrid");
/* ===== أوقات الدوام: عدّل الأوقات من هون (الساعة بنظام 24: [من, إلى, 'm' مختلط | 'w' نساء فقط]) ===== */
const hoursData=[
 {days:[6,0,1,2,3,4],label:"SATURDAY — THURSDAY",arLabel:"السبت — الخميس",slots:[[6,11,'m'],[11,15,'w'],[15,23,'m']]},
 {days:[5],label:"FRIDAY",arLabel:"الجمعة",slots:[[15,20,'m']]}
];
function fmtHour(h,ar){const x=h%24,p=x<12?(ar?'ص':'AM'):(ar?'م':'PM'),n=x%12||12;return `${n}:00 ${p}`}
function damascusNow(){try{const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Damascus',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()),g=t=>p.find(x=>x.type===t).value;return{d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')),t:+g('hour')+(+g('minute'))/60}}catch(e){const n=new Date();return{d:n.getDay(),t:n.getHours()+n.getMinutes()/60}}}
function renderHours(){
  const box=$("#hoursBox");if(!box)return;const ar=lang==='ar',now=damascusNow();
  let cur=null;
  const rows=hoursData.map(r=>`<div class="hours-row"><div class="hours-day">${ar?r.arLabel:r.label}</div><div class="hours-slots">${r.slots.map(sl=>{const on=r.days.includes(now.d)&&now.t>=sl[0]&&now.t<sl[1];if(on)cur=sl[2];return `<div class="slot ${sl[2]==='w'?'women':'mixed'}${on?' now':''}"><b>${fmtHour(sl[0],ar)} — ${fmtHour(sl[1],ar)}</b><span>${sl[2]==='w'?(ar?'نساء فقط':'WOMEN ONLY'):(ar?'مختلط':'MIXED')}</span></div>`}).join('')}</div></div>`).join('');
  const status=cur?`<span class="hours-status open"><i></i>${ar?'مفتوح الآن':'OPEN NOW'} · ${cur==='w'?(ar?'نساء فقط':'WOMEN ONLY'):(ar?'مختلط':'MIXED')}</span>`:`<span class="hours-status"><i></i>${ar?'مغلق حالياً':'CLOSED NOW'}</span>`;
  box.innerHTML=`<div class="hours-head"><h3>${ar?'أوقات الدوام':'OPENING HOURS'}</h3>${status}</div>${rows}`;
}
setInterval(()=>{try{renderHours()}catch(e){}},60000);


/* ===== عروض الموقع: تُقرأ من offers.json ويمكن ربطها لاحقاً بواجهة نشر آمنة ===== */
const defaultOffers=[
 {id:"student-offer",active:true,tag:"STUDENT OFFER",arTag:"عرض الطلاب",num:"10",unit:"%",title:"10% OFF FOR UNIVERSITY STUDENTS",arTitle:"خصم 10% لطلاب الجامعات",desc:"Choose your university to verify the offer.",arDesc:"اختر جامعتك للاستفادة من العرض.",btn:"VIEW OFFER",arBtn:"عرض التفاصيل",type:"uni"}
];
let offers=[...defaultOffers];
const safeText=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function isOfferCurrent(o){
  if(o.active===false)return false;
  const now=new Date();
  if(o.startDate && !Number.isNaN(Date.parse(o.startDate)) && now < new Date(o.startDate+"T00:00:00")) return false;
  if(o.endDate && !Number.isNaN(Date.parse(o.endDate)) && now > new Date(o.endDate+"T23:59:59")) return false;
  return true;
}
async function loadPublicOffers(){
  try{
    let response=await fetch("/api/offers",{cache:"no-store"});
    if(!response.ok && (location.hostname === "localhost" || location.hostname === "127.0.0.1")) response=await fetch("./offers.json",{cache:"no-store"});
    if(!response.ok) throw new Error("Offers feed unavailable");
    const data=await response.json();
    if(!Array.isArray(data.offers)) throw new Error("Invalid offers feed");
    offers=data.offers.filter(o=>o && typeof o==="object" && typeof o.id==="string" && typeof o.num!=="undefined" && o.title && o.arTitle && isOfferCurrent(o));
  }catch(error){
    console.warn("Using built-in AKGYM offers fallback.",error);
    offers=defaultOffers.filter(isOfferCurrent);
  }
  renderOffers();
}
function renderOffers(){
  const box=$("#offersList");if(!box)return;const ar=lang==='ar';box.replaceChildren();
  const visible=offers.filter(isOfferCurrent);
  if(!visible.length){
    const empty=document.createElement("p");
    empty.className="offers-empty";
    empty.textContent=ar?"لا توجد عروض متاحة حالياً.":"No current offers right now.";
    box.appendChild(empty);return;
  }
  visible.forEach(o=>{
    const a=document.createElement('article');a.className='offer-card reveal';
    a.innerHTML=`<div class="offer-number">${safeText(o.num)}<sup>${safeText(o.unit||'')}</sup></div><div class="offer-copy"><span class="offer-tag">${safeText(ar?o.arTag:o.tag)}</span><h3>${safeText(ar?o.arTitle:o.title)}</h3><p>${safeText(ar?o.arDesc:o.desc)}</p></div><button class="btn btn-outline" type="button">${safeText(ar?o.arBtn:o.btn)}</button>`;
    a.querySelector('button').onclick=()=>{
      if(o.type==='uni' || o.type==='details'){
        const modal=$('#offerModal'),arNow=lang==='ar';
        const title=modal.querySelector('h3'),desc=modal.querySelector('p'),uniSelect=$('#uniSelect'),uniList=$('#uniList'),selected=$('#selectedUni'),use=$('#useOffer');
        title.textContent=arNow?(o.arTitle||o.title):(o.title||o.arTitle);
        desc.textContent=arNow?(o.arDesc||o.desc||''):(o.desc||o.arDesc||'');
        const student=o.type==='uni';
        uniSelect.style.display=student?'':'none';uniList.style.display=student?'':'none';selected.style.display=student?'':'none';use.style.display=student?'':'none';
        if(student){
          const labels=translations[lang];
          modal.querySelector('.eyebrow').textContent=labels['offerModal.eyebrow'];
          uniSelect.querySelector('span').textContent=labels['offerModal.select'];
          use.textContent=labels['offerModal.use'];
          $('#selectedUni').textContent=''; $('#useOffer').disabled=true;
        }
        openModal('offerModal');
      }else window.open(`https://wa.me/${WA}?text=${encodeURIComponent(o.msg||'مرحباً AKGYM')}`,'_blank','noopener,noreferrer');
    };
    box.appendChild(a);if(window.__akRevealObserver)window.__akRevealObserver.observe(a);
  });
}

/* ===== فلتر الكوتشات: حسب الاختصاص وحسب الدوام ===== */
const cf={spec:'all',shift:'all'};
const shifts=[['all','All','الكل'],['morning','Morning','صباحاً',6,12],['afternoon','Afternoon','ظهراً',12,17],['evening','Evening','مساءً',17,24]];
function coachMatch(c){
  if(cf.spec!=='all'&&c.specialty!==cf.spec)return false;
  if(cf.shift==='all')return true;
  const t=(c.hours.match(/\d{1,2}(?=:\d{2})/g)||[]).map(Number);if(t.length<2)return true;
  const sh=shifts.find(x=>x[0]===cf.shift);return t[0]<sh[4]&&t[1]>sh[3];
}
function renderFilters(){
  const box=$("#coachFilters");if(!box)return;const ar=lang==='ar';
  const specs=[...new Map(coaches.map(c=>[c.specialty,c.arSpecialty]))];
  const chip=(grp,val,label)=>`<button type="button" class="chip${cf[grp]===val?' on':''}" data-g="${grp}" data-v="${val}">${label}</button>`;
  box.innerHTML=`<div class="filter-row"><span class="filter-label">${ar?'الاختصاص':'SPECIALTY'}</span>${chip('spec','all',ar?'الكل':'All')}${specs.map(([e,a])=>chip('spec',e,ar?a:e)).join('')}</div><div class="filter-row"><span class="filter-label">${ar?'الدوام':'SHIFT'}</span>${shifts.map(x=>chip('shift',x[0],ar?x[2]:x[1])).join('')}</div>`;
  box.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cf[b.dataset.g]=b.dataset.v;renderCoaches()});
}
function renderCoaches(){
  coachGrid.innerHTML="";renderFilters();const list=coaches.filter(coachMatch);if(!list.length)coachGrid.innerHTML='<p class="coach-empty">'+(lang==='ar'?'ما في كوتشات بهالفلتر.':'No coaches match this filter.')+'</p>';
  const ar=lang==='ar';
  list.forEach((c,i)=>{
    const card=document.createElement('article');
    card.className='coach-card reveal';
    card.innerHTML=`<div class="coach-photo"><img src="${c.image}" loading="lazy" decoding="async" alt="${ar?c.arName:c.name}" onerror="this.onerror=null;this.src='assets/coaches/placeholder.webp'"></div><div class="coach-body"><span class="coach-role">${ar?'COACH':'COACH'}</span><h3>${ar?c.arName:c.name}</h3><p class="coach-specialty">${ar?c.arSpecialty:c.specialty}</p><span class="coach-hours">${ar?c.arHours:c.hours}</span></div>`;
    card.onclick=()=>openCoach(c,i);
    coachGrid.appendChild(card);
  });
  updateCoachToggle();
  if(window.__akRevealObserver) coachGrid.querySelectorAll('.reveal').forEach(el=>window.__akRevealObserver.observe(el));
}
function openCoach(c,i=0){const img=$("#coachModalImg");const ar=lang==='ar';img.onerror=()=>{img.onerror=null;img.src="assets/coaches/placeholder.webp"};img.src=c.image;$("#coachModalName").textContent=ar?c.arName:c.name;$("#coachModalSpecialty").textContent=ar?c.arSpecialty:c.specialty;$("#coachModalHours").textContent=ar?c.arHours:c.hours;$("#coachWhatsApp").href=`https://wa.me/${WA}?text=${encodeURIComponent(`مرحباً AKGYM، أريد التواصل مع الكوتش ${c.arName}.`)}`;openModal('coachModal')}
const uniSelect=$("#uniSelect"),uniList=$("#uniList"),selectedUni=$("#selectedUni"),useOffer=$("#useOffer");uniSelect.onclick=()=>uniList.classList.toggle('open');$$('[data-uni]').forEach(b=>b.onclick=()=>{const u=b.dataset.uni;selectedUni.textContent=(lang==='ar'?`الجامعة المختارة: ${u}`:`Selected university: ${u}`);useOffer.disabled=false;useOffer.dataset.uni=u;uniList.classList.remove('open')});useOffer.onclick=()=>{const u=useOffer.dataset.uni;if(!u)return;window.open(`https://wa.me/${WA}?text=${encodeURIComponent(`مرحباً AKGYM، أريد الاستفادة من عرض خصم 10% لطلاب الجامعات. جامعتي هي ${u}.`)}`,'_blank')};

function arDur(m){return m===1?'شهر واحد':m===2?'شهران':m<=10?`${m} أشهر`:`${m} شهراً`}
const price=4000,months=$("#months"),total=$("#priceTotal"),duration=$("#durationText");function updatePrice(){let m=Math.min(24,Math.max(1,parseInt(months.value)||1));months.value=m;total.textContent=(price*m).toLocaleString('en-US');duration.textContent=lang==='ar'?(m===1?'شهر واحد':`${m} أشهر`):(m===1?'1 month':`${m} months`);$("#formDuration").value=duration.textContent;const cur=$("#priceCurrency");if(cur)cur.textContent=lang==='ar'?'ل.س':'S.P.'}$("#minus").onclick=()=>{months.value=+months.value-1;updatePrice()};$("#plus").onclick=()=>{months.value=+months.value+1;updatePrice()};months.oninput=updatePrice;$("#joinOpen").onclick=()=>openModal('joinModal');$("#joinForm").onsubmit=e=>{e.preventDefault();const name=$("#fullName").value.trim(),phone=$("#memberPhone").value.trim(),dur=$("#formDuration").value;window.open(`https://wa.me/${WA}?text=${encodeURIComponent(`مرحباً AKGYM، أرغب بالاشتراك في النادي.\nالاسم الكامل: ${name}\nرقم الهاتف: ${phone}\nمدة الاشتراك: ${arDur(+months.value||1)}\nأرغب بإكمال التسجيل مع النادي.`)}`,'_blank');closeModals()};

const translations={ar:{"nav.explore":"استكشف","nav.offers":"العروض","nav.coaches":"الكوتشات","nav.contact":"تواصل معنا","nav.membership":"الاشتراك","hero.quote":"الجسم يحقق ما يؤمن به العقل","hero.powered":"بدعم من","hero.cta":"استكشف النادي","explore.eyebrow":"النادي","explore.title":"استكشف النادي","explore.text":"ادخل إلى AKGYM واستكشف صالة التدريب ومنطقة الكارديو وغرف تبديل الملابس وكل تفاصيل النادي.","offers.eyebrow":"العروض الحالية","offers.title":"العروض الحالية","offers.tag":"عرض الطلاب","offers.heading":"خصم 10% لطلاب الجامعات","offers.description":"اختر جامعتك للاستفادة من العرض.","offers.open":"عرض التفاصيل","coaches.eyebrow":"الفريق","coaches.title":"الكوتشات","coaches.text":"تعرف على فريق الكوتشات وتواصل مع الكوتش مباشرة عبر AKGYM.","membership.eyebrow":"انضم إلى AKGYM","membership.title":"الاشتراك","membership.text":"اختر مدة اشتراكك. سعر الشهر الحالي هو 4,000 ليرة سورية.","membership.note":"مدة مرنة · التسجيل مباشرة عبر واتساب","membership.duration":"مدة الاشتراك","membership.join":"اشترك الآن","contact.eyebrow":"موقعنا","contact.title":"تواصل معنا","contact.locationTitle":"الموقع","contact.location":"دمشق، ركن الدين، قرب شارع برنية.","contact.whatsappTitle":"واتساب","contact.instagramTitle":"إنستغرام","contact.facebookTitle":"فيسبوك","contact.complaintsTitle":"الشكاوى","contact.map":"افتح في خرائط Google ←","footer.home":"الرئيسية","footer.contact":"تواصل معنا","footer.privacy":"سياسة الخصوصية","footer.terms":"الشروط والأحكام","footer.rights":"جميع الحقوق محفوظة.","offerModal.eyebrow":"عرض خاص","offerModal.title":"خصم 10% لطلاب الجامعات","offerModal.text":"حسم 10 بالمئة لطلاب الجامعات التالية:","offerModal.select":"اختر الجامعة","offerModal.use":"استفد من العرض","coachModal.label":"كوتش","coachModal.contact":"تواصل مع الكوتش","joinModal.eyebrow":"طلب اشتراك","joinModal.title":"الانضمام إلى AKGYM","joinModal.name":"الاسم الكامل","joinModal.phone":"رقم الهاتف","joinModal.duration":"مدة الاشتراك","joinModal.send":"إرسال الطلب عبر واتساب"},en:{"nav.explore":"Explore","nav.offers":"Offers","nav.coaches":"Coaches","nav.contact":"Contact","nav.membership":"Membership","hero.quote":"THE BODY ACHIEVES WHAT THE MIND BELIEVES","hero.powered":"POWERED BY","hero.cta":"EXPLORE THE GYM","explore.eyebrow":"THE FACILITY","explore.title":"EXPLORE THE GYM","explore.text":"Step inside AKGYM. Explore the training floor, cardio zone, changing rooms and every detail of the club.","offers.eyebrow":"CURRENT OFFERS","offers.title":"CURRENT OFFERS","offers.tag":"STUDENT OFFER","offers.heading":"10% OFF FOR UNIVERSITY STUDENTS","offers.description":"Choose your university to verify the offer.","offers.open":"VIEW OFFER","coaches.eyebrow":"THE TEAM","coaches.title":"OUR COACHES","coaches.text":"Meet the team and contact your coach directly through AKGYM.","membership.eyebrow":"JOIN AKGYM","membership.title":"MEMBERSHIP","membership.text":"Choose your membership duration. The monthly price is currently 4,000 SYP.","membership.note":"Flexible duration · Direct registration via WhatsApp","membership.duration":"MEMBERSHIP DURATION","membership.join":"JOIN NOW","contact.eyebrow":"FIND US","contact.title":"CONTACT US","contact.locationTitle":"LOCATION","contact.location":"Damascus, Rukn Al-Din, near Barniya Street.","contact.whatsappTitle":"WHATSAPP","contact.instagramTitle":"INSTAGRAM","contact.facebookTitle":"FACEBOOK","contact.complaintsTitle":"COMPLAINTS","contact.map":"OPEN IN GOOGLE MAPS →","footer.home":"Home","footer.contact":"Contact","footer.privacy":"Privacy Policy","footer.terms":"Terms & Conditions","footer.rights":"All rights reserved.","offerModal.eyebrow":"SPECIAL OFFER","offerModal.title":"10% OFF FOR UNIVERSITY STUDENTS","offerModal.text":"10% discount for students of the following universities:","offerModal.select":"SELECT UNIVERSITY","offerModal.use":"USE THIS OFFER","coachModal.label":"COACH","coachModal.contact":"CONTACT COACH","joinModal.eyebrow":"MEMBERSHIP REQUEST","joinModal.title":"JOIN AKGYM","joinModal.name":"FULL NAME","joinModal.phone":"PHONE NUMBER","joinModal.duration":"MEMBERSHIP DURATION","joinModal.send":"SEND REQUEST ON WHATSAPP"}};
Object.assign(translations.ar,{
 "nav.myCard":"بطاقتي","card.eyebrow":"بوابة المشتركين","card.title":"بطاقتي","card.intro":"ادخل رقم العضوية ورقم الموبايل المسجّل لدى النادي لعرض بطاقتك وبيانات الزيارات.","card.memberCode":"رقم العضوية أو الرقم الوطني","card.phone":"رقم الموبايل","card.signIn":"عرض بطاقتي","card.help":"استخدم رقم الموبايل المسجّل لدى النادي. إذا لم يعمل، راجع الاستقبال.","card.digital":"بطاقة عضوية إلكترونية","card.memberName":"اسم المشترك","card.total":"إجمالي الجلسات","card.used":"مرات الحضور المسجلة","card.remaining":"الجلسات المتبقية","card.plan":"الاشتراك","card.expiry":"تاريخ الانتهاء","card.signOut":"تسجيل الخروج","card.save":"حفظ رمز QR (صورة)","card.print":"طباعة البطاقة","card.close":"إغلاق ✕","card.loading":"عم نتحقق من بياناتك…","card.invalid":"تعذر التحقق. تأكد من رقم العضوية ورقم الموبايل المسجّل.","card.unavailable":"خدمة البطاقة الإلكترونية غير مفعّلة حالياً. يرجى مراجعة الاستقبال.","card.active":"فعّال","card.expired":"منتهي","card.future":"لم يبدأ بعد","card.unknown":"غير متاح"
});
Object.assign(translations.en,{
 "nav.myCard":"My Card","card.eyebrow":"MEMBER PORTAL","card.title":"MY CARD","card.intro":"Enter your member code and the mobile number registered with the club to view your card and visit totals.","card.memberCode":"MEMBER CODE / NATIONAL ID","card.phone":"MOBILE NUMBER","card.signIn":"VIEW MY CARD","card.help":"Use the mobile number registered with the club. If it does not work, contact reception.","card.digital":"DIGITAL MEMBER CARD","card.memberName":"MEMBER NAME","card.total":"TOTAL VISITS","card.used":"RECORDED CHECK-INS","card.remaining":"VISITS LEFT","card.plan":"MEMBERSHIP","card.expiry":"EXPIRES","card.signOut":"SIGN OUT","card.save":"SAVE QR CODE (PNG)","card.print":"PRINT","card.close":"CLOSE ✕","card.loading":"Checking your membership…","card.invalid":"Verification failed. Check your member code and registered mobile number.","card.unavailable":"The online card service is not activated yet. Please contact reception.","card.active":"Active","card.expired":"Expired","card.future":"Not started","card.unknown":"Unavailable"
});
let lang='en';
function applyLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.body.classList.toggle('rtl',lang==='ar');$("#langBtn").textContent=lang==='ar'?'English':'العربية';$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(translations[lang][k])el.textContent=translations[lang][k]});const nav=$('#mainNav');if(nav){nav.querySelectorAll('a').forEach(a=>{a.style.animation='none'});void nav.offsetWidth;if(nav.querySelectorAll('a').length)nav.querySelectorAll('a').forEach(a=>{a.style.animation=''});}updatePrice();if(window.__akCardRefreshLanguage)window.__akCardRefreshLanguage()}
$("#langBtn").onclick=()=>{lang=lang==='en'?'ar':'en';applyLanguage()};$("#menuBtn").onclick=()=>$("#mainNav").classList.toggle('open');$$('#mainNav a').forEach(a=>a.onclick=()=>$("#mainNav").classList.remove('open'));

$$('[data-info]').forEach(b=>b.onclick=()=>{const ar=lang==='ar';$("#infoTitle").textContent=b.dataset.info==='privacy'?(ar?'سياسة الخصوصية':'Privacy Policy'):(ar?'الشروط والأحكام':'Terms & Conditions');$("#infoText").textContent=b.dataset.info==='privacy'?(ar?'نحترم خصوصية زوار AKGYM ولا نجمع بيانات عبر الموقع إلا عندما يرسل المستخدم طلباً بنفسه عبر واتساب.':'AKGYM respects visitor privacy. This front-end website does not store submitted membership data on a server; requests are sent directly to WhatsApp when the user chooses to submit them.'):(ar?'المعلومات والأسعار والعروض قابلة للتحديث من إدارة النادي. إرسال طلب عبر واتساب لا يعني تأكيد العضوية حتى يتم التواصل مع النادي.':'Membership prices, offers and information may be updated by AKGYM. A WhatsApp request is not a confirmed membership until the club contacts the customer.');openModal('infoModal')});

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});window.__akRevealObserver=observer;$$('.reveal').forEach(el=>observer.observe(el));
const siteHeader=$(".site-header");const sectionLinks=$$('#mainNav a');function setHeaderTheme(id){siteHeader.classList.remove('theme-dark','theme-light','theme-gray','theme-red');let theme='theme-light';if(!id||id==='home')theme='theme-dark';else if(id==='offers')theme='theme-red';else if(id==='membership')theme='theme-gray';siteHeader.classList.add(theme);sectionLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${id}`))}const sectionObserver=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setHeaderTheme(visible.target.id)},{rootMargin:'-22% 0px -58% 0px',threshold:[0,.1,.25,.5]});$$('main section[id]').forEach(section=>sectionObserver.observe(section));window.addEventListener('scroll',()=>{const h=document.documentElement,sc=h.scrollTop/(h.scrollHeight-h.clientHeight)*100;$("#scrollProgress").style.width=`${sc}%`;siteHeader.classList.toggle('scrolled',h.scrollTop>40);if(h.scrollTop<80)setHeaderTheme('home')},{passive:true});$("#year").textContent=new Date().getFullYear();applyLanguage();setHeaderTheme('home');

$$('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.08,y=(e.clientY-r.top-r.height/2)*.08;el.style.transform=`translate(${x}px,${y}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});
$$('.magnetic-card').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width*8,y=(e.clientY-r.top-r.height/2)/r.height*8;el.style.transform=`perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-3px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});


/* ===== Champions hero slideshow ===== */
const champions=["ARNOLD","CHRIS","RONIE"].map(n=>[1,2,3].map(i=>encodeURI(`assets/poses/${n}/POSE ${i}.webp`)));
/* قصّ تلقائي: بيشيل الفراغ الشفاف حوالين كل بطل حتى تصير كل الصور بنفس القياس والمكان */
const cropCache={};
function loadCropped(src){
  if(cropCache[src]) return cropCache[src];
  return cropCache[src]=new Promise(res=>{
    const img=new Image();
    img.onerror=()=>res(src);
    img.onload=()=>{
      try{
        const w=img.naturalWidth,h=img.naturalHeight;
        const k=Math.min(1,600/Math.max(w,h)),aw=Math.max(1,Math.round(w*k)),ah=Math.max(1,Math.round(h*k));
        const c=document.createElement('canvas');c.width=aw;c.height=ah;
        const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,aw,ah);
        const d=cx.getImageData(0,0,aw,ah).data;
        let hasAlpha=false;for(let i=3;i<d.length;i+=4){if(d[i]<250){hasAlpha=true;break}}
        const cols=new Array(aw).fill(0),rows=new Array(ah).fill(0);
        for(let y=0;y<ah;y++)for(let x=0;x<aw;x++){
          const i=(y*aw+x)*4;
          const on=hasAlpha?d[i+3]>24:(d[i]+d[i+1]+d[i+2])/3>40;
          if(on){cols[x]++;rows[y]++}
        }
        const first=a=>a.findIndex(v=>v>=2),last=a=>{for(let i=a.length-1;i>=0;i--)if(a[i]>=2)return i;return -1};
        let x0=first(cols),x1=last(cols),y0=first(rows),y1=last(rows);
        if(x0<0||y0<0||x1<=x0||y1<=y0) return res(src);
        if((x1-x0)/aw>.97&&(y1-y0)/ah>.97) return res(src);
        const px=Math.round(aw*.01),py=Math.round(ah*.01);
        x0=Math.max(0,x0-px);y0=Math.max(0,y0-py);x1=Math.min(aw-1,x1+px);y1=Math.min(ah-1,y1+py);
        const sx=x0/k,sy=y0/k,sw=(x1-x0+1)/k,sh=(y1-y0+1)/k;
        const m=Math.min(1,1600/Math.max(sw,sh));
        const o=document.createElement('canvas');o.width=Math.round(sw*m);o.height=Math.round(sh*m);
        o.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,o.width,o.height);
        res(o.toDataURL('image/webp',.88));
      }catch(e){res(src)} // مثلاً لما الموقع مفتوح كملف مباشرة (file://)
    };
    img.src=src;
  });
}
(function(){
  const poses=[...document.querySelectorAll('#champStage .pose')];
  if(!poses.length) return;
  champions.flat().forEach(loadCropped);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  (async function loop(){
    for(let c=0;;c=(c+1)%champions.length){
      const srcs=await Promise.all(champions[c].map(loadCropped));
      poses.forEach((p,i)=>{p.src=srcs[i]});
      await Promise.all(poses.map(p=>p.decode?p.decode().catch(()=>{}):0));
      poses.forEach(p=>p.classList.add('show'));
      await wait(5500);
      poses.forEach(p=>p.classList.remove('show'));
      await wait(1200);
    }
  })();
})();

/* ===== شهادة + عرض المزيد/أقل للكوتشات ===== */
translations.ar["coaches.cert"]="جميع مدربينا حاصلون على شهادات رسمية معتمدة من الاتحاد الرياضي.";
translations.en["coaches.cert"]="All our coaches hold official certified credentials accredited by the Sports Federation.";

const COACH_LIMIT=3;
let coachesOpen=false;
const coachToggle=$("#coachToggle");
function updateCoachToggle(){
  const cards=[...coachGrid.children];
  cards.forEach((c,i)=>c.classList.toggle('coach-hidden',!coachesOpen&&i>=COACH_LIMIT));
  coachToggle.hidden=cards.length<=COACH_LIMIT;
  const ar=lang==='ar';
  coachToggle.textContent=coachesOpen?(ar?'عرض أقل':'SHOW LESS'):(ar?'عرض المزيد':'SHOW MORE');
}
coachToggle.onclick=()=>{coachesOpen=!coachesOpen;updateCoachToggle();if(!coachesOpen)$("#coaches").scrollIntoView({behavior:'smooth',block:'start'})};
const _applyLang=applyLanguage;
applyLanguage=function(){_applyLang();renderHours();renderOffers();renderCoaches();updateCoachToggle()};
applyLanguage();
loadPublicOffers();


/* ===== Interactive electric-blue glow ===== */
(function(){
  const glow = document.getElementById('interactiveGlow');
  if(!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0, x = window.innerWidth/2, y = window.innerHeight/2;
  const move = (clientX, clientY) => {
    x = clientX; y = clientY;
    if(raf) return;
    raf = requestAnimationFrame(()=>{
      glow.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      raf = 0;
    });
    document.body.classList.add('glow-active');
  };
  window.addEventListener('mousemove', e => move(e.clientX,e.clientY), {passive:true});
  window.addEventListener('mouseleave', () => document.body.classList.remove('glow-active'));
  window.addEventListener('touchstart', e => {
    if(e.touches[0]) move(e.touches[0].clientX,e.touches[0].clientY);
  }, {passive:true});
  window.addEventListener('touchmove', e => {
    if(e.touches[0]) move(e.touches[0].clientX,e.touches[0].clientY);
  }, {passive:true});
})();


/* ===== Private member card portal. Real member data is never hardcoded in the public site. ===== */
(function setupMemberCard(){
  const form=$("#memberCardForm"); if(!form)return;
  const msg=$("#cardMessage"), card=$("#digitalMemberCard"), loginBtn=$("#cardLoginBtn");
  const modal = $("#my-card"), closeModal = $("#cardModalClose"), cardTrigger = $(".my-card-nav");
  if (!modal || !cardTrigger) return;
  const openModal = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (!form.hidden) $("#cardMemberCode")?.focus(); }, 30);
  };
  const closeModalFn=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';if(cardTrigger)cardTrigger.focus()};
  if(cardTrigger)cardTrigger.addEventListener('click',e=>{e.preventDefault();openModal()});
  if(closeModal)closeModal.addEventListener('click',closeModalFn);
  modal.addEventListener('click',e=>{if(e.target===modal)closeModalFn()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeModalFn()});
  const t=k=>translations[lang][k]||translations.en[k]||k;
  const setMessage=(key,success=false)=>{msg.textContent=t(key);msg.classList.toggle('success',success)};
  const formatDate=value=>{if(!value)return t('card.unknown');const d=new Date(`${String(value).slice(0,10)}T12:00:00`);if(Number.isNaN(d.getTime()))return String(value);return new Intl.DateTimeFormat(lang==='ar'?'ar-SY':'en-GB',{year:'numeric',month:'short',day:'numeric'}).format(d)};
  let currentCardStatus='unknown', currentCardExpiry='';
  window.__akCardRefreshLanguage=()=>{if(!card.hidden){$("#cardStatus").textContent=t(currentCardStatus==='active'?'card.active':currentCardStatus==='expired'?'card.expired':currentCardStatus==='future'?'card.future':'card.unknown');$("#cardExpiry").textContent=formatDate(currentCardExpiry);}};
  const hideCard=()=>{card.hidden=true;form.hidden=false;form.reset();msg.textContent='';msg.classList.remove('success');if(window.AKQR)try{AKQR('#memberBarcode','')}catch(e){}};
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const memberCode=$("#cardMemberCode").value.trim(),phone=$("#cardPhone").value.trim();
    if(!memberCode||!phone)return;
    loginBtn.disabled=true;loginBtn.textContent=t('card.loading');setMessage('card.loading');
    try{
      const response=await fetch('/api/member-card',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({memberCode,phone}),cache:'no-store',credentials:'same-origin'});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){setMessage(response.status===503?'card.unavailable':'card.invalid');return;}
      const m=data.member||{},s=data.subscription||{},v=data.visits||{};
      const code=String(m.barcodeValue||m.memberCode||memberCode).slice(0,80);
      $("#cardFullName").textContent=String(m.fullName||'—');$("#cardCodeText").textContent=code;
      $("#cardTotal").textContent=v.total!==null&&v.total!==undefined&&Number.isFinite(Number(v.total))?Number(v.total):'—';
      $("#cardUsed").textContent=v.used!==null&&v.used!==undefined&&Number.isFinite(Number(v.used))?Number(v.used):'—';
      $("#cardRemaining").textContent=v.remaining!==null&&v.remaining!==undefined&&Number.isFinite(Number(v.remaining))?Number(v.remaining):'—';
      $("#cardPlan").textContent=String(s.planName||'—');$("#cardExpiry").textContent=formatDate(s.endDate);
      const status=String(s.status||'unknown');currentCardStatus=status;currentCardExpiry=s.endDate||'';$("#cardStatus").textContent=status==='active'?t('card.active'):status==='expired'?t('card.expired'):status==='future'?t('card.future'):t('card.unknown');
      if(window.AKQR){try{AKQR('#memberBarcode',code,{cell:4,margin:2})}catch(e){$("#memberBarcode").replaceChildren()}}
      form.hidden=true;card.hidden=false;setMessage('card.active',true);
    }catch(error){setMessage('card.unavailable')}
    finally{loginBtn.disabled=false;loginBtn.textContent=t('card.signIn')}
  });
  $("#cardSignOut").addEventListener('click',hideCard);

  // ===== حفظ / طباعة الباركود =====
  const cardInfo=()=>{
    const s=$("#memberBarcode");
    let svgHtml='';
    if(s){const c=s.cloneNode(true);const vb=(s.getAttribute('viewBox')||'0 0 300 74').split(/\s+/).map(Number);c.setAttribute('width',vb[2]||300);c.setAttribute('height',vb[3]||74);c.removeAttribute('style');svgHtml=c.outerHTML;}
    return {
      svgHtml,
      code:($("#cardCodeText")?.textContent||'').trim(),
      name:($("#cardFullName")?.textContent||'').trim(),
      plan:($("#cardPlan")?.textContent||'').trim(),
      expiry:($("#cardExpiry")?.textContent||'').trim(),
      total:($("#cardTotal")?.textContent||'').trim(),
      used:($("#cardUsed")?.textContent||'').trim(),
      remaining:($("#cardRemaining")?.textContent||'').trim(),
    };
  };
  const rasterize=()=>new Promise(resolve=>{
    const info=cardInfo();
    if(!info.svgHtml||!info.code)return resolve(null);
    const W=920,H=560,S=2;
    const canvas=document.createElement('canvas');canvas.width=W*S;canvas.height=H*S;
    const ctx=canvas.getContext('2d');ctx.scale(S,S);
    ctx.fillStyle='#0b0b0b';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e10613';ctx.fillRect(0,0,W,10);
    ctx.direction='rtl';
    ctx.textAlign='center';ctx.fillStyle='#ffffff';
    ctx.font='bold 40px system-ui,sans-serif';ctx.fillText('AKGYM',W/2,86);
    ctx.font='bold 44px system-ui,sans-serif';ctx.fillText(info.name||'—',W/2,158);
    ctx.font='18px system-ui,sans-serif';ctx.fillStyle='#c9c9c9';ctx.fillText('بطاقة عضوية إلكترونية — MEMBER CARD',W/2,196);
    ctx.fillStyle='#ffffff';ctx.fillRect(60,232,W-120,180);
    const img=new Image();
    img.onload=()=>{
      const bw=W-160,bh=130,ix=80,iy=252;
      const ratio=Math.min(bw/img.width,bh/img.height);
      const dw=img.width*ratio,dh=img.height*ratio;
      ctx.drawImage(img,ix+(bw-dw)/2,iy+(bh-dh)/2,dw,dh);
      ctx.fillStyle='#111';ctx.font='bold 22px monospace';ctx.fillText(info.code,W/2,398);
      ctx.textAlign='right';ctx.fillStyle='#e9e9e9';ctx.font='20px system-ui,sans-serif';
      ctx.fillText('الاشتراك: '+(info.plan||'—'),W-70,470);
      ctx.fillText('تاريخ الانتهاء: '+(info.expiry||'—'),W-70,502);
      ctx.textAlign='left';
      ctx.fillText('الجلسات: '+(info.used||'—')+' / '+(info.total||'—')+'   ·   المتبقية: '+(info.remaining||'—'),70,470);
      ctx.fillStyle='#8a8a8a';ctx.font='16px system-ui,sans-serif';ctx.fillText('arakgym • AKGYM',70,528);
      resolve(canvas);
    };
    img.onerror=()=>resolve(null);
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?>'+info.svgHtml);
  });
  const saveBtn=$("#cardSave");
  if(saveBtn)saveBtn.addEventListener('click',async()=>{
    const canvas=await rasterize();
    if(!canvas)return;
    const code=(cardInfo().code||'member').replace(/[^\w-]+/g,'');
    canvas.toBlob(blob=>{
      if(!blob)return;
      const link=document.createElement('a');
      link.href=URL.createObjectURL(blob);
      link.download='AKGYM-card-'+code+'.png';
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(link.href),4000);
    },'image/png');
  });
  const printBtn=$("#cardPrint");
  if(printBtn)printBtn.addEventListener('click',()=>{
    const info=cardInfo();
    if(!info.code)return;
    const w=window.open('','_blank');
    if(!w)return;
    w.document.write('<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>بطاقة عضوية — '+safeText(info.code)+'</title><style>body{font-family:system-ui,Segoe UI,Tahoma,sans-serif;text-align:center;padding:30px;color:#111}h2{margin:6px 0}h3{margin:2px 0 18px}svg{max-width:100%;height:auto}.box{border:2px solid #111;border-radius:14px;padding:24px;max-width:640px;margin:0 auto}table{margin:16px auto 0;border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 14px;font-size:15px}</style></head><body><div class="box"><h2>AKGYM</h2><div>بطاقة عضوية إلكترونية</div><h3>'+safeText(info.name)+'</h3>'+info.svgHtml+'<table><tr><th>رقم العضوية</th><td>'+safeText(info.code)+'</td></tr><tr><th>الاشتراك</th><td>'+safeText(info.plan)+'</td></tr><tr><th>الانتهاء</th><td>'+safeText(info.expiry)+'</td></tr><tr><th>الجلسات</th><td>'+safeText(info.used)+' / '+safeText(info.total)+'</td></tr><tr><th>المتبقية</th><td>'+safeText(info.remaining)+'</td></tr></table></div><script>setTimeout(function(){window.print()},300)<\/script></body></html>');
    w.document.close();
  });
})();
