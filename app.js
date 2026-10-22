/* tenderBOLT v0.2: public static MVP, no live API or secure login */
(function() {
"use strict";
const STORE="tenderbolt_demo_v2", OLD="tenderbolt_demo_v1", SESSION="tenderbolt_demo_session";
const USER="demo@tenderbolt.kz", PASS="Bolt2026!";
const SOURCE="Госзакуп РК";
const STEPS=["Обзор","Сбор лотов","Анализ ТЗ","Отбор","Предложение","Контроль"];
const STATUS={new:"Новый",selected:"Отобран",rejected:"Отклонён",preparing:"Подготовка",submitted:"Подано",won:"Победа",lost:"Проигрыш"};
const AI=[
  {name:"ChatGPT",url:"https://chatgpt.com/"},
  {name:"Claude",url:"https://claude.ai/"},
  {name:"Gemini",url:"https://gemini.google.com/"},
  {name:"Perplexity",url:"https://www.perplexity.ai/"},
  {name:"Microsoft Copilot",url:"https://copilot.microsoft.com/"}
];
const ui={stage:0,query:"",status:"all",adding:false,importing:false,editing:null,selectedLot:null,error:""};
const root=document.getElementById("app");
const html=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number(n||0).toLocaleString("ru-RU",{maximumFractionDigits:0})+" ₸";
const uid=()=>("l"+Date.now().toString(36)+Math.random().toString(36).slice(2,7));
const date=s=>s&&/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+"T12:00:00").toLocaleDateString("ru-RU"):"—";
function remain(s){const d=new Date();d.setHours(0,0,0,0);return Math.ceil((new Date(s+"T00:00:00")-d)/86400000);}
function urlOK(s){try{const a=new URL(String(s));return /^https?:$/.test(a.protocol)&&!!a.hostname&&a.username===""&&a.password==="";}catch(e){return false;}}
function officialURL(s){if(!urlOK(s))return false;const h=new URL(s).hostname.toLowerCase();return ["goszakup.gov.kz","procurement.gov.kz","zakup.gov.kz"].some(x=>h===x||h.endsWith("."+x));}
const link=(u,label)=>urlOK(u)?'<a href="'+html(u)+'" target="_blank" rel="noopener noreferrer">'+html(label)+' ↗</a>':'<span class="tag amber">Ссылка не задана</span>';
function initial(){return {version:2,activeWorkspace:"main",workspaces:[{id:"main",name:"Моё пространство",keywords:"информационная безопасность, межсетевой экран, аудит, мониторинг",minBudget:0,maxBudget:0}],lots:[],source:{name:SOURCE,portal:"https://www.goszakup.gov.kz/ru/search/lots",api:"https://ows.goszakup.gov.kz/v3/lots",status:"not_connected"}};}
function normalizeLot(l){return {id:String(l.id||uid()),workspace:String(l.workspace||"main"),number:String(l.number||"").slice(0,75),title:String(l.title||"").slice(0,250),customer:String(l.customer||"").slice(0,180),budget:Number(l.budget||0),deadline:String(l.deadline||""),source:SOURCE,lotUrl:String(l.lotUrl||l.lot_url||""),tzUrl:String(l.tzUrl||l.tz_url||""),tzFileName:String(l.tzFileName||""),status:STATUS[l.status]?l.status:"new",note:String(l.note||"").slice(0,1000),cost:Number(l.cost||0),checks:l.checks&&typeof l.checks==="object"?l.checks:{}};}
function migrate(v){
 const base=initial();
 if(!v||!Array.isArray(v.workspaces)||!Array.isArray(v.lots)||!v.workspaces.length)return base;
 base.workspaces=v.workspaces.map(w=>({id:String(w.id),name:String(w.name).slice(0,70),keywords:String(w.keywords||""),minBudget:Number(w.minBudget||0),maxBudget:Number(w.maxBudget||0)}));
 base.activeWorkspace=base.workspaces.some(w=>w.id===v.activeWorkspace)?v.activeWorkspace:base.workspaces[0].id;
 base.lots=v.lots.filter(l=>l&&!l.demo&&!/^DEMO-/i.test(String(l.number||""))).map(normalizeLot);
 return base;
}
function load(){
 try{const current=localStorage.getItem(STORE);if(current)return migrate(JSON.parse(current));const old=localStorage.getItem(OLD);if(old){const v=migrate(JSON.parse(old));localStorage.setItem(STORE,JSON.stringify(v));return v;}}
 catch(e){}
 return initial();
}
let state=load();
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){notify("Локальное хранилище переполнено — сохраните резервную копию.");}}
const workspace=()=>state.workspaces.find(w=>w.id===state.activeWorkspace)||state.workspaces[0];
const lots=()=>state.lots.filter(l=>l.workspace===workspace().id);
const getLot=id=>lots().find(l=>l.id===id);
const active=l=>["selected","preparing","submitted","won","lost"].includes(l.status);
function count(){const a=lots();return {total:a.length,active:a.filter(active).length,submitted:a.filter(l=>["submitted","won","lost"].includes(l.status)).length,amount:a.reduce((s,l)=>s+Number(l.budget||0),0)};}
function tag(status){const cls={new:"blue",selected:"green",rejected:"red",preparing:"amber",submitted:"blue",won:"green",lost:"red"}[status]||"";return '<span class="tag '+cls+'">'+html(STATUS[status]||status)+'</span>';}
function button(label,action,id="",cls="btn-secondary"){return '<button type="button" class="btn btn-sm '+cls+'" data-action="'+html(action)+'" data-id="'+html(id)+'">'+html(label)+'</button>';}
function section(title,desc,body){return '<section class="panel"><h2>'+title+'</h2><p class="panel-desc">'+desc+'</p>'+body+'</section>';}
function stats(){const c=count();return '<div class="grid stats">'+[["Лотов",c.total,"Из Госзакуп РК"],["В работе",c.active,"Отобранных лотов"],["Подано",c.submitted,"Статусы выставляются вручную"],["Общий бюджет",fmt(c.amount),"По загруженным лотам"]].map(([a,b,c])=>'<div class="stat"><div class="stat-label">'+a+'</div><div class="stat-value">'+b+'</div><div class="stat-foot">'+c+'</div></div>').join("")+'</div>';}
function shell(){
 const settings=ui.stage===-1;
 const nav=STEPS.map((s,i)=>'<button type="button" data-action="stage" data-stage="'+i+'" class="'+(ui.stage===i?"active":"")+'"><span class="nav-num">'+(i+1)+'</span>'+html(s)+'</button>').join("");
 const ws=state.workspaces.map(w=>'<option value="'+html(w.id)+'"'+(w.id===workspace().id?" selected":"")+'>'+html(w.name)+'</option>').join("");
 const headline=settings?"Подключение к источникам":STEPS[ui.stage],sub=settings?"Подключения, интеграция и доступ к данным": ["Текущий портфель без учебных и вымышленных лотов","Реестр закупок с обязательными ссылками на лот и ТЗ","Промпт и файл ТЗ для выбранного лота","Решения по участию в закупках","Подготовка заявки и расчёт экономики","Сроки и статусы закупок"][ui.stage];
 return '<div class="shell"><aside class="sidebar"><div class="brand">tender<span class="bolt">BOLT</span></div><div class="brand-note">Tender intelligence workspace</div><div class="sidebar-section">РАБОЧИЙ ПРОЦЕСС</div><nav class="nav" aria-label="Шесть этапов">'+nav+'</nav><div class="sidebar-section" style="margin-top:22px">ИНТЕГРАЦИИ</div><nav class="nav"><button type="button" data-action="connections" class="'+(settings?"active":"")+'">⚙ Подключение к источникам</button></nav><div class="sidebar-bottom">Госзакуп РК · ручной ввод<br>Хранилище: локальный браузер<br>'+button("Выйти","logout","","btn-ghost")+'</div></aside><div class="main"><header class="topbar"><div class="topbar-left"><span class="small muted">Пространство</span><select class="workspace-select" id="workspace" aria-label="Рабочее пространство">'+ws+'</select>'+button("+ Новое","new-workspace","","btn-ghost")+'</div><div class="topbar-actions"><span class="pill">● MVP · без API</span><span class="avatar">TB</span>'+button("Выйти","logout","","btn-ghost")+'</div></header><main class="content"><div class="page-heading"><div><div class="eyebrow">'+(settings?"СИСТЕМА":"ЭТАП "+(ui.stage+1)+" / 6")+'</div><h1>'+headline+'</h1><p>'+sub+'</p></div><div class="actions">'+button("Экспорт CSV","export-csv","","btn-ghost")+button("Бэкап JSON","export-json","","btn-ghost")+'</div></div><div class="notice"><strong>Внимание:</strong> онлайн-сбор через API и безопасная серверная авторизация ещё не подключены. Здесь нет синтетических лотов. Добавляйте только проверенные данные из Госзакуп РК. Локальные файлы ТЗ хранятся только в этом браузере; не загружайте сюда чувствительные материалы.</div>'+ (settings?connections():stats()+[overview,registry,analysis,selection,offers,control][ui.stage]()) +'<p class="footer">tenderBOLT v0.2 · <a href="./MANUAL.md" target="_blank" rel="noopener">Мануал</a> · <a href="https://ows.goszakup.gov.kz/help/" target="_blank" rel="noopener">Официальные API</a></p></main></div></div>';
}
function login(){
 return '<div class="login-shell"><section class="login-hero"><div class="brand">tender<span class="bolt">BOLT</span></div><div class="brand-note">Tender intelligence workspace</div><h1>Закупки. ТЗ. Решения.</h1><p>Шесть этапов управления реальными лотами с подтверждёнными ссылками на Госзакуп и техническую спецификацию. Анализ документов — через выбранную вами нейросеть.</p><div class="hero-steps">'+STEPS.map((s,i)=>'<span>'+String(i+1).padStart(2,"0")+' · '+s+'</span>').join("")+'</div></section><div class="login-side"><div class="login-card"><div class="eyebrow">ТЕСТОВЫЙ ВХОД</div><h2>Войти в tenderBOLT</h2><p class="muted small">Клиентская демопроверка, не серверная авторизация.</p><div class="hint">Логин: <code>'+USER+'</code><br>Пароль: <code>'+PASS+'</code><br>Демо-реквизиты публичны и не защищают файлы.</div><form data-form="login"><div><label class="label">Email</label><input class="field" name="email" type="email" autocomplete="username" value="'+USER+'" required></div><div><label class="label">Пароль</label><input class="field" name="password" type="password" autocomplete="current-password" required></div><div class="error">'+html(ui.error)+'</div><button class="btn btn-primary btn-block" type="submit">Открыть пространство</button></form></div></div></div>';
}
function overview(){
 const c=count(),last=lots().slice().sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline))).slice(0,5);
 return section("Госзакуп РК · рабочее пространство","Никаких тестовых закупок: база начинается пустой, если вы не добавляли собственных лотов.",'<div class="actions">'+button("+ Добавить лот","go-add","","btn-primary")+button("Импортировать CSV","go-import")+button("Настройки подключения","connections")+'</div>')+section("Ближайшие лоты","Сроки и ссылки для текущего пространства",last.length?'<div class="table-wrap"><table><thead><tr><th>Лот</th><th>Дедлайн</th><th>Документы</th></tr></thead><tbody>'+last.map(l=>'<tr><td><div class="lot-name">'+html(l.title)+'</div><div class="sub">'+html(l.number)+'</div></td><td>'+date(l.deadline)+'</td><td>'+link(l.lotUrl,"Лот")+' · '+link(l.tzUrl,"ТЗ")+'</td></tr>').join("")+'</tbody></table></div>':'<div class="empty"><strong>Лотов пока нет</strong>Добавьте проверенную закупку вручную или импортируйте CSV со ссылками на лот и ТЗ.</div>');
}
function connections(){
 return section("Единственный источник: Госзакуп РК", "Подключение вынесено из шести этапов. Здесь собраны справочные ссылки, API и ограничения интеграции.",'<div class="source-card"><div class="source-top"><span class="tag amber">API не подключён</span><span class="tag blue">Государственные закупки Казахстана</span></div><h3>Госзакуп РК</h3><p>Официальный портал и унифицированные сервисы открытых данных.</p><p>'+link("https://www.goszakup.gov.kz/ru/search/lots","Реестр лотов")+' · '+link("https://ows.goszakup.gov.kz/help/","Получение доступа к API")+' · '+link("https://procurement.gov.kz/ru/developer/ows_v3","Документация v3")+'</p></div>')+
 section("Как подключать источник","Для доступа к унифицированным сервисам нужен токен авторизации, выдаваемый уполномоченным органом согласно официальной документации.",'<div class="stack"><div class="item-card"><strong>1. Получить доступ к API</strong><p class="help">Изучите правила на ows.goszakup.gov.kz/help и запросите токен установленным способом.</p></div><div class="item-card"><strong>2. Развернуть серверный коннектор</strong><p class="help">Нужны backend, серверный секрет, планировщик, фильтры, очередь, обработка ошибок и база данных. API endpoint: <code>https://ows.goszakup.gov.kz/v3/lots</code>.</p></div><div class="item-card"><strong>3. Сопоставить лоты и документы</strong><p class="help">Сохранять проверенную ссылку на конкретный лот и отдельную ссылку на относящееся именно к нему ТЗ. API лотов сам по себе не гарантирует готовую прямую ссылку на файл ТЗ.</p></div></div>')+
 section("Текущий способ поступления данных","Ручное добавление или импорт подготовленного CSV. Токен API здесь не вводится: GitHub Pages — публичный статический хостинг.",'<div class="actions">'+button("Открыть реестр / импорт","goto-lots","","btn-primary")+'</div>');
}
function paths(l){return '<div class="lot-links">'+link(l.lotUrl,"Открыть лот")+'<span>·</span>'+link(l.tzUrl,"Открыть ТЗ")+'</div>';}
function actions(l){return '<div class="actions">'+button("Ссылки / правка","edit-lot",l.id,"btn-ghost")+button("ТЗ + AI","analyze-lot",l.id)+(l.status==="new"||l.status==="rejected"?button("Отобрать","select",l.id):button("Отклонить","reject",l.id,"btn-ghost"))+'</div>';}
function lotForm(l){
 const edit=!!l, title=edit?"Изменить лот и ссылки":"Новый лот Госзакуп РК";
 return '<section class="panel"><h2>'+title+'</h2><p class="panel-desc">Обе ссылки обязательны. URL лота должен вести на официальный домен Госзакуп / Единой платформы. Ссылка ТЗ должна относиться к этому же лоту. Сверьте вручную.</p><form class="form-grid" data-form="lot"'+(edit?' data-id="'+html(l.id)+'"':'')+'><div><label class="label">Номер лота *</label><input class="field" name="number" maxlength="75" required value="'+html(l?.number||"")+'"></div><div><label class="label">Заказчик *</label><input class="field" name="customer" maxlength="180" required value="'+html(l?.customer||"")+'"></div><div class="wide"><label class="label">Название закупки *</label><input class="field" name="title" maxlength="250" required value="'+html(l?.title||"")+'"></div><div><label class="label">Сумма, ₸ *</label><input class="field" type="number" name="budget" min="0" max="1000000000000" required value="'+html(l?.budget??"")+'"></div><div><label class="label">Конец приёма заявок *</label><input class="field" type="date" name="deadline" required value="'+html(l?.deadline||"")+'"></div><div class="wide"><label class="label">Ссылка на лот Госзакуп РК *</label><input class="field" name="lotUrl" type="url" maxlength="1800" required placeholder="https://www.goszakup.gov.kz/..." value="'+html(l?.lotUrl||"")+'"></div><div class="wide"><label class="label">Ссылка на техническую спецификацию этого лота *</label><input class="field" name="tzUrl" type="url" maxlength="1800" required placeholder="https://.../document" value="'+html(l?.tzUrl||"")+'"></div><div class="actions wide"><button type="submit" class="btn btn-primary">Сохранить лот</button>'+button("Отменить","close-form","","btn-ghost")+'</div></form></section>';
}
function registry(){
 const q=ui.query.trim().toLowerCase(),a=lots().filter(l=>(ui.status==="all"||l.status===ui.status)&&(!q||[l.number,l.title,l.customer].some(x=>String(x).toLowerCase().includes(q))));
 const options='<option value="all">Все статусы</option>'+Object.entries(STATUS).map(([k,v])=>'<option value="'+k+'"'+(ui.status===k?" selected":"")+'>'+v+'</option>').join("");
 let table=section("Реестр лотов","Каждая запись содержит отдельные ссылки на оригинальный лот и соответствующее ТЗ.",'<div class="actions" style="margin-bottom:16px">'+button("+ Лот","add-lot","","btn-primary")+button("Импорт CSV","toggle-import")+'</div><form class="toolbar" data-form="search"><div class="search"><label class="label">Поиск по лоту или заказчику</label><input class="field" name="query" value="'+html(ui.query)+'" placeholder="Номер, название, заказчик"></div><div><label class="label">Статус</label><select class="field" name="status">'+options+'</select></div><button class="btn btn-secondary" type="submit">Найти</button>'+button("Сброс","reset-search","","btn-ghost")+'</form><div class="table-wrap"><table><thead><tr><th>Номер / заказчик</th><th>Наименование</th><th>Бюджет</th><th>Срок</th><th>Лот и ТЗ</th><th>Действие</th></tr></thead><tbody>'+a.map(l=>'<tr><td><strong>'+html(l.number)+'</strong><div class="sub">'+html(l.customer)+'</div></td><td><div class="lot-name">'+html(l.title)+'</div>'+tag(l.status)+'</td><td class="nowrap">'+fmt(l.budget)+'</td><td>'+date(l.deadline)+'</td><td>'+paths(l)+'</td><td>'+actions(l)+'</td></tr>').join("")+'</tbody></table></div>'+(a.length?"":'<div class="empty"><strong>Нет лотов</strong>Добавьте закупку со ссылками на лот и ТЗ.</div>')+'<p class="help">Найдено: '+a.length+' из '+lots().length+'. Никакого фонового сбора не выполняется.</p>');
 if(ui.adding)table+=lotForm(ui.editing?getLot(ui.editing):null);
 if(ui.importing)table+=section("Импорт CSV","Обязательные заголовки: number;title;customer;budget;deadline;lot_url;tz_url. Только строки с корректными ссылками будут добавлены. Макс. 1000 записей.",'<textarea class="field" id="csv-text" rows="7" placeholder="number;title;customer;budget;deadline;lot_url;tz_url"></textarea><div class="actions" style="margin-top:12px">'+button("Импортировать CSV","import-csv","","btn-primary")+'</div>');
 return table;
}
function criteria(w){return String(w.keywords||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);}
function rate(l){const w=workspace(),str=(l.title+" "+l.customer).toLowerCase(),matches=criteria(w).filter(k=>str.includes(k)),budgetOk=l.budget>=Number(w.minBudget||0)&&(!Number(w.maxBudget)||l.budget<=Number(w.maxBudget)),left=remain(l.deadline);return {score:Math.min(100,matches.length*23+(budgetOk?20:0)+(left>=10?10:0)),matches,budgetOk,left};}
function promptFor(l){
 return [
 "Ты — аналитик тендерных закупок Республики Казахстан. Проанализируй приложенный файл технической спецификации (ТЗ) ИМЕННО указанного лота. Не начинай анализ, пока файл не загружен и не прочитан.",
 "Номер лота: "+l.number,
 "Предмет закупки: "+l.title,
 "Заказчик: "+l.customer,
 "Плановая сумма: "+fmt(l.budget),
 "Конец подачи заявок: "+l.deadline,
 "Ссылка на карточку лота: "+l.lotUrl,
 "Ссылка на техническую спецификацию: "+l.tzUrl,
 "Имя прикреплённого файла: "+(l.tzFileName||"Файл приложит пользователь"),
 "",
 "Правила: работай с фактическим содержанием файла, не придумывай отсутствующие требования. Если файл не доступен или ссылка требует авторизации — попроси меня загрузить файл. Сначала сверяй номер и предмет закупки, убедись, что анализируемое ТЗ относится к этому лоту; при расхождении остановись и сообщи о проблеме. Не заявляй о соответствии нашей компании без предоставленных доказательств.",
 "",
 "Сформируй ответ по разделам:",
 "1. Краткое назначение закупки и предмет поставки/работ/услуг.",
 "2. Таблица требований: точная формулировка, обязательность, количественные параметры, цитата/страница/раздел первоисточника, необходимые доказательства.",
 "3. Сроки, условия поставки, гарантийные обязательства, квалификация, лицензии/сертификаты и критерии приёмки.",
 "4. Неоднозначные, чрезмерные и противоречивые требования, потенциальные ограничения конкуренции; отдели установленный факт от гипотезы.",
 "5. Коммерческие и технические риски, факторы затрат и вопросы для уточнения у заказчика.",
 "6. Чек-лист документов и действий для участия.",
 "7. Итог: что известно, чего не хватает для решения об участии, что уточнить вручную.",
 "",
 "Не выдумывай цены, положения законодательства, документы, номера страниц и характеристики. Ссылайся на конкретные фрагменты приложенного ТЗ. Если какое-либо положение требует юридической проверки, явно укажи это."
 ].join("\n");
}
function analysis(){
 const a=lots().slice().sort((a,b)=>rate(b).score-rate(a).score),w=workspace();
 if(ui.selectedLot&&!a.some(l=>l.id===ui.selectedLot))ui.selectedLot=null;
 const selected=getLot(ui.selectedLot)||null;
 const criteriaForm=section("Скоринг по метаданным","Фразы, бюджет и дедлайн. Этот рейтинг не заменяет чтение ТЗ.",'<form class="form-grid" data-form="criteria"><div class="wide"><label class="label">Фразы через запятую</label><textarea class="field" name="keywords" rows="3">'+html(w.keywords)+'</textarea></div><div><label class="label">Мин. бюджет, ₸</label><input class="field" type="number" min="0" name="minBudget" value="'+Number(w.minBudget||0)+'"></div><div><label class="label">Макс. бюджет, ₸ (0 = без ограничения)</label><input class="field" type="number" min="0" name="maxBudget" value="'+Number(w.maxBudget||0)+'"></div><button class="btn btn-primary" type="submit">Сохранить критерии</button></form>');
 const roster=section("Выберите лот для анализа","Готовый запрос генерируется строго для выбранной закупки и связанного с ней ТЗ.",a.length?'<div class="analysis-list">'+a.map(l=>{const r=rate(l);return '<div class="analysis-row"><div><div class="lot-name">'+html(l.title)+'</div><div class="sub">'+html(l.number)+' · '+fmt(l.budget)+' · '+(l.tzFileName?"Файл: "+html(l.tzFileName):"Файл не приложен")+'</div>'+paths(l)+'<div class="progress"><i style="width:'+r.score+'%"></i></div></div><div class="score">'+r.score+'</div><div>'+button(ui.selectedLot===l.id?"Выбран":"Анализ ТЗ","choose-analysis",l.id,ui.selectedLot===l.id?"btn-primary":"btn-secondary")+'</div></div>';}).join("")+'</div>':'<div class="empty"><strong>Реестр пуст</strong>Создайте лот на этапе 2 с двумя действительными ссылками.</div>');
 let promptPanel="";
 if(selected){
 const prompt=promptFor(selected);
 promptPanel=section("ТЗ выбранного лота — "+html(selected.number),"Файл должен относиться к этой записи. Он хранится локально в браузере, а не на GitHub. При экспорте JSON файл не переносится.",'<div class="item-card"><h3>'+html(selected.title)+'</h3><p>'+html(selected.customer)+' · '+fmt(selected.budget)+'</p><div class="lot-links">'+paths(selected)+'</div><div class="form-grid"><div class="wide"><label class="label">Прикрепить файл ТЗ (PDF, DOC, DOCX, TXT, XLSX; до 15 МБ)</label><input class="field" type="file" data-attach="'+html(selected.id)+'" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.rtf,application/pdf"></div></div><div class="actions" style="margin-top:12px">'+(selected.tzFileName?'<span class="tag green">'+html(selected.tzFileName)+'</span>'+button("Скачать приложенное ТЗ","download-file",selected.id)+button("Удалить файл","remove-file",selected.id,"btn-danger"):'<span class="tag amber">Локальный файл не прикреплён</span>')+'</div></div>')+
 section("Готовый промпт для коммерческих нейросетей","Скопируйте текст и вручную прикрепите к чату файл ТЗ выбранного лота. Одна ссылка сама по себе не гарантирует доступ модели к документу.",'<textarea id="ai-prompt" class="field prompt-area" readonly rows="16">'+html(prompt)+'</textarea><div class="actions" style="margin-top:14px">'+button("Скопировать промпт","copy-prompt","","btn-primary")+'</div><p class="help">Промпт содержит только параметры выбранного лота. Файл автоматически в сторонние сервисы не передаётся.</p><div class="ai-grid">'+AI.map(p=>'<a href="'+html(p.url)+'" target="_blank" rel="noopener noreferrer" class="ai-link">'+html(p.name)+' ↗</a>').join("")+'</div><div class="hint"><strong>Как использовать:</strong> скачайте приложенное ТЗ (или по ссылке ТЗ), откройте нужную нейросеть, вставьте промпт и приложите файл к этому же чату. Перед передачей проверьте конфиденциальность документа и условия сервиса.</div>');
 }
 return criteriaForm+roster+promptPanel;
}
function selection(){
 const a=lots().filter(active),b=lots().filter(l=>l.status==="new"),c=lots().filter(l=>l.status==="rejected");
 const row=l=>'<div class="item-card"><div class="item-card-head"><div><h3>'+html(l.title)+'</h3><p>'+html(l.number)+' · '+fmt(l.budget)+'</p>'+paths(l)+'</div>'+tag(l.status)+'</div><div class="actions" style="margin-top:12px">'+button("Заметка","note",l.id)+button("ТЗ + AI","analyze-lot",l.id)+button(l.status==="new"?"В работу":"Вернуть","toggle-select",l.id,"btn-primary")+button("Отклонить","reject",l.id,"btn-ghost")+'</div>'+(l.note?'<p class="help">'+html(l.note)+'</p>':"")+'</div>';
 return '<div class="columns">'+section("В работе ("+a.length+")","Отобранные закупки",a.map(row).join("")||'<div class="empty">Пока нет отобранных лотов.</div>')+section("Ожидают решения ("+b.length+")","Новые закупки",b.map(row).join("")||'<div class="empty">Нет лотов в очереди.</div>')+'</div>'+section("Отклонено ("+c.length+")","Вернуть в реестр можно через кнопку ниже.",c.map(l=>'<div class="item-card">'+html(l.number)+' — '+html(l.title)+' '+button("Вернуть","reset",l.id)+'</div>').join("")||'<div class="empty">Отклонений нет.</div>');
}
function offers(){return section("Подготовка предложений","Предварительная себестоимость и три чек-бокса. Окончательную прибыль и юридические ограничения нужно считать отдельно.",lots().filter(active).map(l=>'<div class="quote"><div class="item-card-head"><div class="lot-name">'+html(l.title)+'</div>'+tag(l.status)+'</div>'+paths(l)+'<div class="sub">Бюджет: '+fmt(l.budget)+'</div><form data-form="quote" data-id="'+html(l.id)+'" class="form-grid" style="margin-top:14px"><div><label class="label">Себестоимость, ₸</label><input class="field" name="cost" type="number" min="0" value="'+html(l.cost||"")+'" required></div><div><label class="label">Разница</label><div class="kpi">'+(l.cost?fmt(l.budget-l.cost):"Введите себестоимость")+'</div></div><button class="btn btn-primary" type="submit">Пересчитать</button></form><div class="actions" style="margin-top:12px">'+[["tech","ТЗ изучено"],["docs","Документы собраны"],["finance","Экономика согласована"]].map(([k,t])=>'<label class="switch"><input type="checkbox" data-check="'+k+'" data-id="'+html(l.id)+'"'+(l.checks?.[k]?" checked":"")+'>'+t+'</label>').join("")+'</div></div>').join("")||'<div class="empty">Сначала отберите лот.</div>');}
function control(){
 const a=lots().filter(active).sort((a,b)=>a.deadline.localeCompare(b.deadline));
 return section("Сроки и статусы","Статусы меняются вручную; уведомления и подача заявок на портале не подключены.",'<div class="table-wrap"><table><thead><tr><th>Лот</th><th>Ссылки</th><th>Срок</th><th>Осталось</th><th>Статус</th></tr></thead><tbody>'+a.map(l=>'<tr><td><div class="lot-name">'+html(l.title)+'</div><div class="sub">'+html(l.number)+'</div></td><td>'+paths(l)+'</td><td>'+date(l.deadline)+'</td><td>'+remain(l.deadline)+' дн.</td><td><select class="status-select" data-status-for="'+html(l.id)+'">'+["selected","preparing","submitted","won","lost"].map(s=>'<option value="'+s+'"'+(s===l.status?" selected":"")+'>'+STATUS[s]+'</option>').join("")+'</select></td></tr>').join("")+'</tbody></table></div>'+(a.length?"":'<div class="empty">Отобранных лотов нет.</div>'))+section("Резервные копии","JSON содержит параметры и имена файлов, но не сами приложенные файлы ТЗ из IndexedDB. Для переноса ТЗ приложите заново.",'<div class="actions">'+button("Скачать JSON","export-json","","btn-primary")+'<label class="btn btn-secondary" for="restore-json" style="cursor:pointer">Восстановить JSON</label><input id="restore-json" type="file" accept=".json,application/json" class="visually-hidden"></div>');
}
function render(){root.innerHTML=sessionStorage.getItem(SESSION)==="yes"?shell():login();}
function notify(t){let el=document.querySelector(".toast");if(el)el.remove();el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),4500);}
function csvCell(v){let s=String(v??"");if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function download(name,body,mime){const blob=new Blob(["\uFEFF",body],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function exportCsv(){const keys=["number","title","customer","budget","deadline","lot_url","tz_url","status","cost","note"];const rows=lots().map(l=>[l.number,l.title,l.customer,l.budget,l.deadline,l.lotUrl,l.tzUrl,l.status,l.cost,l.note]);download("tenderBOLT-"+workspace().id+".csv",[keys.join(";")].concat(rows.map(r=>r.map(csvCell).join(";"))).join("\r\n"),"text/csv;charset=utf-8");}
function parseCSV(text){const rows=[];let row=[],value="",quote=false,delim=text.split(/\r?\n/)[0].includes(";")?";":",";text=text.replace(/^\uFEFF/,"");for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){value+='"';i++;}else quote=!quote;}else if(c===delim&&!quote){row.push(value.trim());value="";}else if((c==="\n"||c==="\r")&&!quote){if(c==="\r"&&text[i+1]==="\n")i++;row.push(value.trim());if(row.some(Boolean))rows.push(row);row=[];value="";}else value+=c;}if(quote)throw Error("Незакрытые кавычки");row.push(value.trim());if(row.some(Boolean))rows.push(row);return rows;}
function importCSV(){const box=document.getElementById("csv-text");if(!box||!box.value.trim())return notify("Вставьте CSV");try{const data=parseCSV(box.value);if(!data.length)throw Error("Пустой CSV");const fields=data.shift().map(x=>x.toLowerCase().trim()),required=["number","title","customer","budget","deadline","lot_url","tz_url"];if(!required.every(k=>fields.includes(k)))throw Error("Нет заголовков: "+required.join(";"));let imported=0,skipped=0;for(const row of data.slice(0,1000)){const o={};required.forEach(k=>o[k]=String(row[fields.indexOf(k)]||"").trim());const budget=Number(o.budget.replace(/\s/g,""));if(!o.number||!o.title||!o.customer||!Number.isFinite(budget)||budget<0||budget>1e12||!/^\d{4}-\d{2}-\d{2}$/.test(o.deadline)||!officialURL(o.lot_url)||!urlOK(o.tz_url)||lots().some(l=>l.number===o.number)){skipped++;continue;}state.lots.push(normalizeLot({id:uid(),workspace:workspace().id,number:o.number,title:o.title,customer:o.customer,budget,deadline:o.deadline,lotUrl:o.lot_url,tzUrl:o.tz_url}));imported++;}ui.importing=false;save();render();notify("Добавлено: "+imported+" · пропущено: "+skipped+(data.length>1000?" · лимит 1000":""));}catch(e){notify("Ошибка: "+e.message);}}
function openDB(){return new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(Error("IndexedDB не поддерживается"));const req=indexedDB.open("tenderbolt_tz_files",1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("files"))req.result.createObjectStore("files");};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function fileOp(mode,id,file){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("files",mode==="get"?"readonly":"readwrite"),st=tx.objectStore("files");const q=mode==="get"?st.get(id):mode==="delete"?st.delete(id):st.put(file,id);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);tx.oncomplete=()=>db.close();tx.onerror=()=>db.close();});}
function exportJSON(){download("tenderBOLT-backup.json",JSON.stringify(state,null,2),"application/json;charset=utf-8");notify("JSON сохранён (без файлов ТЗ).");}
root.addEventListener("click",async e=>{
 const el=e.target.closest("[data-action]");if(!el)return;const op=el.dataset.action,id=el.dataset.id,l=id?getLot(id):null;
 if(op==="logout"){sessionStorage.removeItem(SESSION);ui.error="";render();return;}
 if(op==="stage"){ui.stage=Number(el.dataset.stage);ui.adding=false;ui.importing=false;render();return;}
 if(op==="connections"){ui.stage=-1;render();return;}
 if(op==="new-workspace"){const raw=prompt("Имя нового пространства:");if(!raw||!raw.trim())return;const w={id:uid(),name:raw.trim().slice(0,70),keywords:"",minBudget:0,maxBudget:0};state.workspaces.push(w);state.activeWorkspace=w.id;save();ui.stage=0;render();return;}
 if(op==="goto-lots"||op==="go-add"||op==="go-import"){ui.stage=1;ui.adding=op==="go-add";ui.editing=null;ui.importing=op==="go-import";render();return;}
 if(op==="add-lot"){ui.adding=true;ui.editing=null;render();return;}
 if(op==="edit-lot"&&l){ui.adding=true;ui.editing=l.id;render();return;}
 if(op==="close-form"){ui.adding=false;ui.editing=null;render();return;}
 if(op==="toggle-import"){ui.importing=!ui.importing;render();return;}
 if(op==="import-csv"){importCSV();return;}
 if(op==="reset-search"){ui.query="";ui.status="all";render();return;}
 if(op==="export-csv"){exportCsv();return;}
 if(op==="export-json"){exportJSON();return;}
 if(op==="analyze-lot"&&l){ui.stage=2;ui.selectedLot=l.id;render();return;}
 if(op==="choose-analysis"&&l){ui.selectedLot=l.id;render();return;}
 if(op==="copy-prompt"){const t=document.getElementById("ai-prompt");if(!t)return;try{await navigator.clipboard.writeText(t.value);notify("Промпт скопирован.");}catch(err){t.focus();t.select();notify("Выделите текст и скопируйте Ctrl+C.");}return;}
 if(op==="download-file"&&l){try{const f=await fileOp("get",l.id);if(!f){notify("Файл не найден в этом браузере. Прикрепите ТЗ ещё раз.");return;}const u=URL.createObjectURL(f),a=document.createElement("a");a.href=u;a.download=l.tzFileName||"tz";a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);}catch(e){notify("Не удалось открыть локальный файл.");}return;}
 if(op==="remove-file"&&l){try{await fileOp("delete",l.id);l.tzFileName="";save();render();notify("Локальный файл удалён.");}catch(e){notify("Ошибка удаления.");}return;}
 if(!l)return;
 if(op==="select")l.status="selected";
 if(op==="reject")l.status="rejected";
 if(op==="reset")l.status="new";
 if(op==="toggle-select")l.status=l.status==="new"?"selected":"new";
 if(op==="note"){const t=prompt("Примечание к лоту:",l.note||"");if(t===null)return;l.note=t.slice(0,1000);}
 save();render();
});
root.addEventListener("submit",e=>{
 const f=e.target,op=f.dataset.form;if(!op)return;e.preventDefault();const d=new FormData(f);
 if(op==="login"){if(String(d.get("email")||"").toLowerCase().trim()===USER&&d.get("password")===PASS){sessionStorage.setItem(SESSION,"yes");ui.error="";render();}else{ui.error="Неверные демореквизиты";render();}return;}
 if(op==="search"){ui.query=String(d.get("query")||"");ui.status=String(d.get("status")||"all");render();return;}
 if(op==="criteria"){const w=workspace(),min=Number(d.get("minBudget")),max=Number(d.get("maxBudget"));if(min<0||max<0||(max&&max<min))return notify("Проверьте бюджет");w.keywords=String(d.get("keywords")||"").slice(0,800);w.minBudget=min;w.maxBudget=max;save();render();notify("Сохранено");return;}
 if(op==="lot"){
 const data={};for(const k of ["number","customer","title","deadline","lotUrl","tzUrl"])data[k]=String(d.get(k)||"").trim();
 data.budget=Number(d.get("budget"));
 if(!data.number||!data.customer||!data.title||!data.deadline||!Number.isFinite(data.budget)||data.budget<0||data.budget>1e12)return notify("Проверьте обязательные поля");
 if(!officialURL(data.lotUrl))return notify("Ссылка лота должна вести на официальную площадку Госзакуп РК.");
 if(!urlOK(data.tzUrl))return notify("Нужна корректная HTTPS/HTTP ссылка на ТЗ этого лота.");
 if(lots().some(l=>l.number===data.number&&l.id!==f.dataset.id))return notify("Номер лота уже существует в пространстве.");
 const prev=f.dataset.id?getLot(f.dataset.id):null;if(prev){Object.assign(prev,data);}else state.lots.push(normalizeLot({...data,id:uid(),workspace:workspace().id}));
 ui.adding=false;ui.editing=null;save();render();notify("Лот и ссылки сохранены.");return;
 }
 if(op==="quote"){const l=getLot(f.dataset.id),v=Number(d.get("cost"));if(!l||!Number.isFinite(v)||v<0||v>1e12)return notify("Проверьте сумму");l.cost=v;save();render();notify("Себестоимость сохранена.");}
});
root.addEventListener("change",async e=>{
 const el=e.target;
 if(el.id==="workspace"){state.activeWorkspace=el.value;save();ui.query="";ui.status="all";ui.selectedLot=null;render();return;}
 if(el.hasAttribute("data-status-for")){const l=getLot(el.dataset.statusFor);if(l&&["selected","preparing","submitted","won","lost"].includes(el.value)){l.status=el.value;save();render();}return;}
 if(el.hasAttribute("data-check")){const l=getLot(el.dataset.id);if(l){l.checks[el.dataset.check]=el.checked;save();}return;}
 if(el.hasAttribute("data-attach")){
 const l=getLot(el.dataset.attach),file=el.files?.[0];if(!l||!file)return;
 if(file.size>15*1024*1024)return notify("Файл не должен превышать 15 МБ.");
 if(!/\.(pdf|docx?|xlsx?|txt|rtf)$/i.test(file.name))return notify("Разрешены PDF, DOC, DOCX, XLS, XLSX, TXT, RTF.");
 try{await fileOp("put",l.id,file);l.tzFileName=file.name;save();render();notify("Файл ТЗ привязан к лоту "+l.number+".");}catch(err){notify("Не удалось сохранить файл в браузере.");}return;
 }
 if(el.id==="restore-json"&&el.files?.[0]){const file=el.files[0];if(file.size>3000000)return notify("JSON больше 3 МБ.");try{const raw=JSON.parse(await file.text());if(!raw||!Array.isArray(raw.workspaces)||!Array.isArray(raw.lots)||raw.lots.length>10000)throw Error("Неверный формат");if(!confirm("Заменить локальные данные? Файлы ТЗ при этом не импортируются."))return;state=migrate(raw);save();render();notify("Данные восстановлены. Приложите файлы ТЗ заново.");}catch(err){notify("Ошибка JSON: "+err.message);}return;}
});
render();
})();