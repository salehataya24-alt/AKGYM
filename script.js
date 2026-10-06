const WA="963950078785";
const gymPhotos=["IMG_3952.webp","IMG_3955(1).webp","IMG_3957(1).webp","IMG_3958(1).webp","IMG_3961(1).webp","IMG_3960(1).webp","IMG_3959(1).webp"];
const coaches=[
 {name:"HUSSEIN BAKKOR",arName:"حسين بكور",specialty:"Strength & Conditioning",arSpecialty:"القوة واللياقة البدنية",hours:"Daily · 10:00 — 18:00",arHours:"يومياً · 10:00 — 18:00",image:"assets/coaches/coach1.webp"},
 {name:"AHMAD ATKIEDDIEN",arName:"أحمد أتقي الدين",specialty:"Bodybuilding & Hypertrophy",arSpecialty:"كمال الأجسام وتضخيم العضلات",hours:"Daily · 14:00 — 22:00",arHours:"يومياً · 14:00 — 22:00",image:"assets/coaches/coach2.webp"},
 {name:"MOTASIEM MOJAHED",arName:"معتصم مجاهد",specialty:"Fitness & Weight Loss",arSpecialty:"اللياقة وخسارة الوزن",hours:"Daily · 16:00 — 23:00",arHours:"يومياً · 16:00 — 23:00",image:"assets/coaches/coach3.webp"},
 {name:"MANAL ALAHMAD",arName:"منال الأحمد",specialty:"Strength & Conditioning",arSpecialty:"القوة واللياقة البدنية",hours:"Daily · 10:00 — 18:00",arHours:"يومياً · 10:00 — 18:00",image:"assets/coaches/coach4.webp"},
 {name:"MOHAMMED TALLAG",arName:"محمد طلاج",specialty:"Strength & Conditioning",arSpecialty:"القوة واللياقة البدنية",hours:"Daily · 10:00 — 18:00",arHours:"يومياً · 10:00 — 18:00",image:"assets/coaches/coach5.webp"}
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


/* ===== العروض: عدّل أو أضف أو احذف عروض من هون بس ===== */
const offers=[
 {tag:"STUDENT OFFER",arTag:"عرض الطلاب",num:"10",unit:"%",title:"10% OFF FOR UNIVERSITY STUDENTS",arTitle:"خصم 10% لطلاب الجامعات",desc:"Choose your university to verify the offer.",arDesc:"اختر جامعتك للاستفادة من العرض.",btn:"VIEW OFFER",arBtn:"عرض التفاصيل",type:"uni"}
 /* مثال عرض جديد (فك التعليق وضيف فاصلة قبله):
 ,{tag:"NEW",arTag:"جديد",num:"3",unit:"+1",title:"3 MONTHS + 1 FREE",arTitle:"3 أشهر + شهر مجاني",desc:"Limited time.",arDesc:"لفترة محدودة.",btn:"ASK ON WHATSAPP",arBtn:"اسأل عبر واتساب",type:"wa",msg:"مرحباً AKGYM، أنا مهتم بالعرض."}
 */
];
function renderOffers(){
  const box=$("#offersList");if(!box)return;const ar=lang==='ar';box.innerHTML="";
  offers.forEach(o=>{
    const a=document.createElement('article');a.className='offer-card reveal';
    a.innerHTML=`<div class="offer-number">${o.num}<sup>${o.unit||''}</sup></div><div class="offer-copy"><span class="offer-tag">${ar?o.arTag:o.tag}</span><h3>${ar?o.arTitle:o.title}</h3><p>${ar?o.arDesc:o.desc}</p></div><button class="btn btn-outline" type="button">${ar?o.arBtn:o.btn}</button>`;
    a.querySelector('button').onclick=()=>o.type==='uni'?openModal('offerModal'):window.open(`https://wa.me/${WA}?text=${encodeURIComponent(o.msg||'مرحباً AKGYM')}`,'_blank');
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
let lang='en';
function applyLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.body.classList.toggle('rtl',lang==='ar');$("#langBtn").textContent=lang==='ar'?'English':'العربية';$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(translations[lang][k])el.textContent=translations[lang][k]});const nav=$('#mainNav');if(nav){nav.querySelectorAll('a').forEach(a=>{a.style.animation='none'});void nav.offsetWidth;if(nav.querySelectorAll('a').length)nav.querySelectorAll('a').forEach(a=>{a.style.animation=''});}updatePrice()}
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

/* ===== حاسبة السعرات ===== */
Object.assign(translations.ar,{"nav.calc":"احسب سعراتك الآن","calc.eyebrow":"حاسبة السعرات","calc.title":"احسب سعراتك","calc.gender":"الجنس","calc.male":"ذكر","calc.female":"أنثى","calc.height":"الطول (سم)","calc.weight":"الوزن (كغ)","calc.age":"العمر","calc.days":"عدد مرات التمرين بالأسبوع","calc.go":"احسب","calc.maintain":"سعرات الثبات","calc.cut":"سعرات الحرق","calc.bulk":"سعرات التضخيم","calc.cutSub":"لخسارة الدهون","calc.bulkSub":"لبناء العضلات","calc.maintainSub":"للحفاظ على وزنك","calc.unit":"سعرة / يوم","calc.note":"هي تقديرات تقريبية بمعادلة Mifflin-St Jeor وتختلف من شخص لآخر. استشر مختصاً للحصول على خطة دقيقة."});
Object.assign(translations.en,{"nav.calc":"Calorie Calculator","calc.eyebrow":"CALORIE CALCULATOR","calc.title":"YOUR CALORIES","calc.gender":"GENDER","calc.male":"MALE","calc.female":"FEMALE","calc.height":"HEIGHT (CM)","calc.weight":"WEIGHT (KG)","calc.age":"AGE","calc.days":"WORKOUTS PER WEEK","calc.go":"CALCULATE","calc.maintain":"MAINTENANCE","calc.cut":"BURN / CUT","calc.bulk":"BULK","calc.cutSub":"to lose fat","calc.bulkSub":"to build muscle","calc.maintainSub":"to keep your weight","calc.unit":"kcal / day","calc.note":"Approximate estimates using the Mifflin-St Jeor formula; results vary between people. Ask a professional for a precise plan."});
let calcG='m';
$$('#calcGender button').forEach(b=>b.onclick=()=>{calcG=b.dataset.g;$$('#calcGender button').forEach(x=>x.classList.toggle('on',x===b))});
const calcDays=$("#calcDays");calcDays.oninput=()=>$("#calcDaysVal").textContent=calcDays.value;
$("#calcOpen").onclick=()=>{$("#mainNav").classList.remove('open');openModal('calcModal')};
function countTo(el,v){const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/900),e=1-Math.pow(1-k,3);el.textContent=Math.round(v*e).toLocaleString('en-US');if(k<1)requestAnimationFrame(f)})(t0)}
$("#calcForm").onsubmit=e=>{
  e.preventDefault();
  const h=+$("#calcH").value,w=+$("#calcW").value,a=+$("#calcA").value,d=+calcDays.value;
  const bmr=10*w+6.25*h-5*a+(calcG==='m'?5:-161);
  const f=d===0?1.2:d<=2?1.375:d<=4?1.55:d<=6?1.725:1.9;
  const r10=x=>Math.round(x/10)*10,tdee=bmr*f;
  const cut=Math.max(tdee*.8,calcG==='m'?1500:1200),bulk=tdee*1.12;
  const res=$("#calcResult");res.hidden=false;
  countTo($("#rMaintain"),r10(tdee));countTo($("#rCut"),r10(cut));countTo($("#rBulk"),r10(bulk));
  res.scrollIntoView({behavior:'smooth',block:'nearest'});
};
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
