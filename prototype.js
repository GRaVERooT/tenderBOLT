/* tenderBOLT public interactive UX prototype v0.7.
   All organizations, people, lots, financials and actions are fictional.
   Nothing is sent to a server. Never enter production credentials here. */
(()=>{"use strict";
const STORE="tenderbolt_public_prototype_v07";
const STAGES=["Отбор","Анализ","Решение","Предложение","Подача","Итог"];
const STATUS=["Сбор","На анализе","На согласовании","Готовим КП","Подано","Завершён"];
const CLASSES={relevant:["Релевантен","green"],review:["Уточнить","amber"],hold:["Отложен","grey"],declined:["Не подходит","red"]};
const PRIORITIES={low:["Низкий","grey"],normal:["Обычный","blue"],high:["Высокий","amber"],critical:["Критический","red"]};
const ROLES={manager:"Руководитель",operator:"Оператор"};
const WIDGETS={
manager:[["approvals","Согласования","Запросы, требующие решения"],["finance","Плановая экономика","Бюджеты, себестоимость и разница"],["pipeline","Воронка проектов","Лоты по этапам"],["deadlines","Риски по срокам","Какие дедлайны близко"],["team","Команда и задачи","Загрузка и просрочки"],["quality","Полнота данных","Сведения, которые нужно дополнить"]],
operator:[["tasks","Мои задачи","Список действий на сегодня"],["projects","Мои проекты","Ответственность и следующий шаг"],["deadlines","Ближайшие сроки","Контроль дедлайнов"],["pipeline","Этапы проектов","Прогресс работы"],["quality","Неполные карточки","Что требуется добавить"]]
};
const root=document.getElementById("app");
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=v=>Number(v||0).toLocaleString("ru-RU",{maximumFractionDigits:0})+" ₸";
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const localDay=d=>{const x=new Date();x.setDate(x.getDate()+d);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-");};
const today=()=>localDay(0);
const days=s=>{if(!s)return null;const now=new Date(today()+"T00:00:00"),target=new Date(s+"T00:00:00");return Math.round((target-now)/86400000);};
const niceDate=s=>s?new Date(s+"T12:00:00").toLocaleDateString("ru-RU"):"Не указан";
const short=s=>String(s||"").slice(0,120);
const tip=t=>'<span class="help" tabindex="0" title="'+esc(t)+'" aria-label="Справка: '+esc(t)+'">?</span>';
const pill=(s,kind)=>'<span class="tag '+esc(kind||"grey")+'">'+esc(s)+'</span>';
const button=(name,action,id,kind)=>'<button class="btn '+esc(kind||"")+'" type="button" data-action="'+esc(action)+'"'+(id!=null?' data-id="'+esc(id)+'"':"")+'>'+name+"</button>";
const link=(name,route,kind)=>'<a class="btn '+esc(kind||"")+'" href="#'+esc(route)+'">'+name+"</a>";
const section=(title,sub,inner,extra)=>'<section class="card '+(extra||"")+'"><div class="card-title"><div><h2>'+title+'</h2>'+(sub?'<p class="subtitle">'+sub+"</p>":"")+'</div></div>'+inner+"</section>";
const inputs=(name,label,value,help,type)=>'<label>'+esc(label)+" "+tip(help||label)+'<input class="field" name="'+esc(name)+'" type="'+esc(type||"text")+'" value="'+esc(value==null?"":value)+'"></label>';
const textfield=(name,label,value,help)=>'<label>'+esc(label)+" "+tip(help||label)+'<textarea class="field textarea" name="'+esc(name)+'" rows="3">'+esc(value||"")+"</textarea></label>";
const select=(name,label,current,options,help)=>'<label>'+esc(label)+" "+tip(help||label)+'<select class="field" name="'+esc(name)+'">'+options.map(x=>'<option value="'+esc(x[0])+'" '+(String(x[0])===String(current)?"selected":"")+'>'+esc(x[1])+"</option>").join("")+"</select></label>";
const projectHref=id=>"#project:"+encodeURIComponent(id);
const projectLink=p=>'<a href="'+projectHref(p.id)+'">'+esc(p.title)+"</a>";
const empty=s=>'<div class="empty">'+esc(s)+"</div>";
const demoNames=["Айжан","Руслан","Дана"];
function seed(){
 const samples=[
 {id:"TB-000124",number:"DEMO-2026-0124",title:"Поставка межсетевых экранов NGFW",customer:"Учебная организация «Север»",budget:34500000,cost:27900000,deadline:localDay(4),owner:"Айжан",stage:2,classification:"relevant",priority:"critical",tags:["ngfw","fortinet","сети"],supplier:"Учебный поставщик A",technology:"NGFW",summary:"Проект поставки сетевого оборудования для распределённой инфраструктуры.",requirements:"Кластер высокой доступности, техническая поддержка, управление политиками.",risks:"Не подтверждён срок доставки по одной из моделей.",nextAction:"Получить подтверждение срока поставки",tasks:[{id:"task-1",title:"Проверить сроки поставки",due:localDay(1),done:false,assignee:"Айжан"},{id:"task-2",title:"Получить КП от поставщика",due:localDay(2),done:false,assignee:"Айжан"},{id:"task-3",title:"Завершить анализ ТЗ",due:localDay(0),done:true,assignee:"Айжан"}],links:["TB-000131"],outcome:null},
 {id:"TB-000131",number:"DEMO-2026-0131",title:"Лицензирование средств защиты конечных точек",customer:"Учебная организация «Север»",budget:12700000,cost:9550000,deadline:localDay(11),owner:"Руслан",stage:3,classification:"relevant",priority:"normal",tags:["edr","лицензии","иб"],supplier:"Учебный поставщик Б",technology:"EDR",summary:"Обновление и расширение лицензий для учебного филиала.",requirements:"Централизованное управление, отчётность, обновления.",risks:"Требуется проверить количество активных устройств.",nextAction:"Подготовить спецификацию предложения",tasks:[{id:"task-4",title:"Подготовить коммерческое предложение",due:localDay(7),done:false,assignee:"Руслан"}],links:["TB-000124"],outcome:null},
 {id:"TB-000137",number:"DEMO-2026-0137",title:"Поставка комплекса резервного копирования",customer:"Муниципальное предприятие «Восток»",budget:64500000,cost:57200000,deadline:localDay(7),owner:"Айжан",stage:1,classification:"review",priority:"high",tags:["backup","хранение"],supplier:"Учебный поставщик A",technology:"Backup",summary:"Проработка резервного копирования виртуальной инфраструктуры.",requirements:"RPO/RTO, хранение резервных копий, восстановление.",risks:"Неясны объёмы исходных данных.",nextAction:"Уточнить объёмы защищаемых систем",tasks:[{id:"task-5",title:"Сформировать вопросы по ТЗ",due:localDay(2),done:false,assignee:"Айжан"}],links:[],outcome:null},
 {id:"TB-000142",number:"DEMO-2026-0142",title:"Поставка средств защиты веб-приложений",customer:"Академический центр «Горизонт»",budget:18900000,cost:null,deadline:localDay(2),owner:"Дана",stage:1,classification:"review",priority:"critical",tags:["waf","веб"],supplier:"",technology:"WAF",summary:"Предварительный технический анализ WAF.",requirements:"",risks:"Неизвестна архитектура размещения.",nextAction:"Получить архитектурную схему",tasks:[{id:"task-6",title:"Выяснить условия размещения",due:localDay(-1),done:false,assignee:"Дана"}],links:[],outcome:null},
 {id:"TB-000151",number:"DEMO-2026-0151",title:"Аудит защищённости информационной системы",customer:"Коммунальное предприятие «Рассвет»",budget:8400000,cost:5200000,deadline:localDay(-6),owner:"Айжан",stage:5,classification:"relevant",priority:"low",tags:["аудит","иб"],supplier:"",technology:"Audit",summary:"Завершённый учебный проект аудита.",requirements:"Отчёт по рискам и дорожная карта.",risks:"",nextAction:"Архивировать результаты",tasks:[],links:[],outcome:"won"},
 {id:"TB-000160",number:"DEMO-2026-0160",title:"Мониторинг событий информационной безопасности",customer:"Академический центр «Горизонт»",budget:23800000,cost:19600000,deadline:localDay(18),owner:"Руслан",stage:4,classification:"relevant",priority:"high",tags:["soc","siem","иб"],supplier:"Учебный поставщик Б",technology:"SIEM",summary:"Поданный учебный тендер на систему мониторинга.",requirements:"Централизованный сбор логов и корреляция.",risks:"",nextAction:"Контролировать публикацию результатов",tasks:[{id:"task-7",title:"Проверить итоги закупки",due:localDay(17),done:false,assignee:"Руслан"}],links:[],outcome:null},
 {id:"TB-000167",number:"DEMO-2026-0167",title:"Обновление сетевой инфраструктуры филиалов",customer:"Учебная организация «Юг»",budget:42000000,cost:36100000,deadline:localDay(28),owner:"Дана",stage:0,classification:"hold",priority:"low",tags:["сети","ngfw"],supplier:"",technology:"Switching",summary:"Новый учебный проект на первичном отборе.",requirements:"",risks:"",nextAction:"Оценить релевантность",tasks:[],links:[],outcome:null}
 ];
 return {version:7,role:"manager",settings:{manager:WIDGETS.manager.map(w=>w[0]),operator:WIDGETS.operator.map(w=>w[0])},
 projects:samples,events:[
 {id:"ev-seed-1",at:new Date().toISOString(),actor:"Руководитель",role:"manager",category:"business",action:"decision.approved",outcome:"success",object:"TB-000131",detail:"Заявка одобрена; финансовые расчёты не входят в экспорт"},
 {id:"ev-seed-2",at:new Date().toISOString(),actor:"Айжан",role:"operator",category:"mutation",action:"project.updated",outcome:"success",object:"TB-000124",detail:"Обновлено поле: риски"},
 {id:"ev-seed-3",at:new Date().toISOString(),actor:"Система",role:"system",category:"integration",action:"goszakup.connection_check",outcome:"failure",object:"goszakup",detail:"DEMO · API-токен не задан"}
 ],connected:false};
}
let state;
try{const raw=localStorage.getItem(STORE);let parsed=raw?JSON.parse(raw):null;state=parsed&&parsed.version===7&&Array.isArray(parsed.projects)?parsed:seed();}catch(e){state=seed();}
const ui={view:"dashboard",project:null,projectTab:"overview",search:"",status:"all",graphSearch:"",graphMode:"knowledge",graphSelected:null,graphZoom:1,
  auditType:"all",auditOutcome:"all",settingsOpen:false,showNew:false,sortRole:"",showToast:""};
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){notify("Память браузера заполнена. Данные прототипа не сохранены.");}};
const actor=()=>state.role==="manager"?"Руководитель":"Айжан";
function record(action,obj,detail,category,outcome){
 state.events.unshift({id:"ev-"+uid(),at:new Date().toISOString(),actor:actor(),role:state.role,category:category||"business",action,object:obj||"",detail:short(detail||""),outcome:outcome||"success"});
 if(state.events.length>350)state.events.length=350;
 save();
}
function notify(msg){ui.showToast=msg;const old=document.querySelector(".toast");if(old)old.remove();const div=document.createElement("div");div.className="toast";div.textContent=msg;root.appendChild(div);setTimeout(()=>{if(div.isConnected)div.remove();},3300);}
function get(id){return state.projects.find(p=>p.id===id);}
function dataset(){return state.projects;}
function stageLabel(p){return p.outcome==="won"?"Победа":p.outcome==="lost"?"Не выигран":STATUS[p.stage]||"Новый";}
function stageTag(p){if(p.outcome)return pill(stageLabel(p),p.outcome==="won"?"green":"red");return pill(stageLabel(p),["grey","blue","purple","teal","blue","green"][p.stage]);}
function quality(p){return Math.round([p.deadline,p.customer,p.summary,p.requirements,p.risks,p.nextAction,p.technology,p.supplier].filter(Boolean).length/8*100);}
function cardNum(label,num,desc){return '<div class="metric"><small>'+label+'</small><strong>'+num+'</strong><em>'+esc(desc||"")+'</em></div>';}
function heading(title,subtitle,action,eyebrow){return '<div class="heading"><div><div class="eyebrow">'+esc(eyebrow||"ПРОТОТИП · UX 0.7")+'</div><h1>'+title+'</h1><p class="subtitle">'+subtitle+'</p></div><div class="heading-actions">'+(action||"")+"</div></div>";}
function line(p,right,sub){return '<div class="listrow"><div><strong>'+projectLink(p)+'</strong><small>'+esc(sub||p.number+" · "+p.customer)+'</small></div><div class="right">'+(right||"")+"</div></div>";}
function projectCount(idx){return state.projects.filter(p=>p.stage===idx).length;}
function pipeline(){const total=state.projects.length||1;return '<div class="pipeline">'+STAGES.map((s,i)=>'<div class="phase"><strong>'+projectCount(i)+'</strong><small>'+esc(s)+'</small><div class="track"><i style="width:'+Math.round(projectCount(i)/total*100)+'%"></i></div></div>').join("")+"</div>";}
function nearProjects(){return state.projects.filter(p=>p.stage<5&&p.deadline).sort((a,b)=>a.deadline.localeCompare(b.deadline));}
function tasksMine(){return state.projects.flatMap(p=>p.tasks.filter(t=>t.assignee==="Айжан"&&!t.done).map(t=>({p,t}))).sort((a,b)=>a.t.due.localeCompare(b.t.due));}
function myProjects(){return state.projects.filter(p=>p.owner==="Айжан"&&p.stage!==5);}
function criteria(){return ["Релевантность","Техническая выполнимость","Сроки","Поставщик","Экономика"];}
function roleWidgets(){return state.settings[state.role]||WIDGETS[state.role].map(w=>w[0]);}
function widgetTitles(){return Object.fromEntries(WIDGETS[state.role].map(w=>[w[0],w]));}
function renderWidget(key){
 let body="",name=widgetTitles()[key]?.[1]||key,desc=widgetTitles()[key]?.[2]||"",wide=["approvals","finance","pipeline","projects","team"].includes(key);
 if(key==="approvals"){const items=dataset().filter(p=>p.stage===2);body=items.map(p=>line(p,button("Решить →","open-project",p.id,"small primary"),"На согласовании · "+p.owner)).join("")||empty("Все решения приняты — очередь пуста.");}
 if(key==="finance"){const arr=dataset().filter(p=>p.stage>=2);const budgets=arr.reduce((s,p)=>s+p.budget,0),costed=arr.filter(p=>p.cost!=null);body='<div class="metrics" style="margin:0;grid-template-columns:repeat(3,minmax(0,1fr))">'+cardNum("Общий бюджет",money(budgets),"Не фактическая выручка")+cardNum("Плановая разница",money(costed.reduce((s,p)=>s+p.budget-p.cost,0)),"Только лоты с себестоимостью")+cardNum("Оценены по затратам",costed.length+" / "+arr.length,"План, без налогов")+"</div>";}
 if(key==="pipeline")body=pipeline()+'<p class="fine" style="margin-bottom:0;margin-top:14px">Этапы отображают состояние работы, а не вероятность победы.</p>';
 if(key==="deadlines")body=nearProjects().slice(0,6).map(p=>line(p,pill(days(p.deadline)<0?"Просрочено":days(p.deadline)+" дн.",days(p.deadline)<=3?"red":days(p.deadline)<=7?"amber":"blue"),"Дедлайн "+niceDate(p.deadline))).join("")||empty("Нет ближайших сроков.");
 if(key==="team"){const users=demoNames;body='<div class="tablewrap"><table><thead><tr><th>Ответственный</th><th>Проектов</th><th>Активных задач</th><th>Просрочено</th></tr></thead><tbody>'+users.map(u=>{const ps=dataset().filter(p=>p.owner===u);const ts=ps.flatMap(p=>p.tasks.filter(t=>t.assignee===u&&!t.done));return "<tr><td>"+esc(u)+"</td><td>"+ps.length+"</td><td>"+ts.length+"</td><td>"+ts.filter(t=>days(t.due)<0).length+"</td></tr>";}).join("")+"</tbody></table></div>";}
 if(key==="quality")body=dataset().filter(p=>p.stage<5).sort((a,b)=>quality(a)-quality(b)).slice(0,6).map(p=>line(p,pill(quality(p)+"%",quality(p)<65?"amber":"blue"),"Обогащение карточки · "+p.owner)).join("");
 if(key==="tasks")body=tasksMine().slice(0,8).map(x=>'<div class="listrow"><div><strong>'+esc(x.t.title)+'</strong><small>'+esc(x.p.number)+' · '+niceDate(x.t.due)+'</small></div><div class="right">'+button("Открыть →","open-project",x.p.id,"small")+"</div></div>").join("")||empty("У вас нет открытых задач.");
 if(key==="projects")body=myProjects().slice(0,7).map(p=>line(p,pill(PRIORITIES[p.priority][0],PRIORITIES[p.priority][1]),p.nextAction||"Следующий шаг не задан")).join("")||empty("У вас нет назначенных проектов.");
 return section(esc(name),esc(desc),body,wide?"wide":"");
}
function dashboard(){
 const manager=state.role==="manager",widgets=roleWidgets();
 const metrics=manager?[
   ["Ждут моего решения",dataset().filter(p=>p.stage===2).length,"Требуется согласование"],
   ["Проектов в работе",dataset().filter(p=>p.stage<5).length,"Портфель тенантa"],
   ["Просроченных задач",dataset().flatMap(p=>p.tasks).filter(t=>!t.done&&days(t.due)<0).length,"Проверьте блокировки"],
   ["Сумма активных лотов",money(dataset().filter(p=>p.stage<5).reduce((a,p)=>a+p.budget,0)),"Плановый объём"]
 ]:[
   ["Мои задачи",tasksMine().length,"На исполнении"],
   ["Мои проекты",myProjects().length,"Назначены вам"],
   ["Горящие сроки",myProjects().filter(p=>days(p.deadline)<=3).length,"3 дня или меньше"],
   ["Требуют обогащения",myProjects().filter(p=>quality(p)<75).length,"Полнота менее 75%"]
 ];
 const settings='<details class="card settings" '+(ui.settingsOpen?"open":"")+'><summary>⚙ Настроить мой дашборд '+tip("Выбор и порядок виджетов хранятся локально и раздельно для каждой роли")+'</summary><p class="fine">Перемещайте виджеты стрелками; отмечайте, что показывать. Настройки руководителя и оператора независимы.</p><div class="settings-grid">'+WIDGETS[state.role].map(w=>{
 const included=widgets.includes(w[0]);return '<div class="settingrow"><input type="checkbox" data-action="widget-toggle" data-id="'+w[0]+'" '+(included?"checked":"")+' aria-label="Показывать '+esc(w[1])+'"><label>'+esc(w[1])+'</label><div class="arrows">'+button("↑","widget-up",w[0],"small icononly")+button("↓","widget-down",w[0],"small icononly")+"</div></div>";
 }).join("")+"</div></details>";
 return heading(manager?"Пульс компании":"Мой рабочий день",manager?"Финансы, решения, риски и нагрузка команды. Сфокусировано на управлении.":"Задачи, дедлайны, лоты и следующий шаг. Только то, что влияет на вашу работу.",link("Все проекты →","projects","primary"))+
 '<div class="metrics">'+metrics.map(x=>cardNum(esc(x[0]),x[1],x[2])).join("")+"</div>"+settings+'<div class="dash-grid">'+widgets.map(renderWidget).join("")+'</div>'+
 section("Граф знаний и зависимостей","Исследуйте портфель по заказчикам, технологиям и поставщикам.",'<div class="form-actions">'+link("◉ Граф знаний →","graph","primary")+link("↳ Центр сроков →","tasks")+(manager?link("Аналитика руководителя →","insights"):"")+"</div>");
}
function projectFilter(p){const text=ui.search.toLowerCase();return (!text||[p.title,p.number,p.customer,p.owner,p.tags.join(" ")].some(x=>String(x).toLowerCase().includes(text)))&&(ui.status==="all"||String(p.stage)===ui.status);}
function projects(){
 const rows=dataset().filter(projectFilter);
 let form="";
 if(ui.showNew)form=section("Добавить учебный проект","Создаст новый объект только в локальных данных браузера.",'<form data-form="create"><div class="form-grid">'+inputs("title","Название лота","","Наименование закупки")+inputs("customer","Заказчик","Учебная организация","Учебное наименование")+inputs("number","Номер лота","DEMO-"+Date.now().toString().slice(-6),"Внешний идентификатор, для этого макета условный")+inputs("budget","Бюджет, ₸","0","Начальная сумма закупки","number")+inputs("deadline","Срок подачи",localDay(14),"Дата в демонстрации","date")+(state.role==="manager"?select("owner","Ответственный","Айжан",demoNames.map(n=>[n,n]),"Назначается руководителем"):"")+'</div><div class="form-actions"><button class="btn primary">Создать проект</button>'+button("Отмена","toggle-new",null,"")+"</div></form>");
 return heading("Тендерный портфель","Каждый принятый лот — управляемый проект с ответственными, этапами, обогащением и историей.",button("+ Новый проект","toggle-new",null,"primary"))+form+
 section("Реестр проектов",rows.length+" из "+dataset().length+" объектов",'<div class="toolbar"><input id="project-search" class="field" placeholder="Поиск: название, заказчик, тег, номер…" value="'+esc(ui.search)+'" aria-label="Поиск по проектам"><select class="field" id="status-filter"><option value="all">Все этапы</option>'+STAGES.map((v,i)=>'<option value="'+i+'" '+(ui.status===String(i)?"selected":"")+'>'+esc(v)+"</option>").join("")+"</select></div>"+
 '<div class="tablewrap"><table><thead><tr><th>Лот / проект</th><th>Заказчик</th><th>Ответственный</th><th>Этап</th><th>Срок</th><th>Приоритет</th><th></th></tr></thead><tbody>'+
 rows.map(p=>'<tr><td><a class="table-title" href="'+projectHref(p.id)+'">'+esc(p.title)+'</a><span class="table-sub">'+esc(p.number)+"</span></td><td>"+esc(p.customer)+"</td><td>"+esc(p.owner)+"</td><td>"+stageTag(p)+"</td><td>"+niceDate(p.deadline)+"</td><td>"+pill(PRIORITIES[p.priority][0],PRIORITIES[p.priority][1])+'</td><td>'+link("Открыть →","project:"+p.id,"small")+"</td></tr>").join("")+"</tbody></table></div>"+(!rows.length?empty("По вашему запросу ничего не найдено."):""));
}
function life(p){
 return '<div class="steps">'+STAGES.map((label,i)=>'<div class="step '+(i<p.stage?"done":i===p.stage?"current":"")+'"><strong>'+(i<p.stage?"✓":String(i+1))+'</strong><small>'+esc(label)+'</small></div>').join("")+"</div>";
}
function projectHeader(p){
 const until=days(p.deadline);
 return heading('<span style="font-size:12px;color:#7e90a9;font-weight:700">'+esc(p.id)+" · "+esc(p.number)+'</span><br>'+esc(p.title),
 esc(p.customer)+" · Ответственный: "+esc(p.owner),
 link("← Все проекты","projects")+link("◉ На графе","graph","primary"),"КАРТОЧКА ПРОЕКТА")+
 '<div class="metrics">'+
 cardNum("Бюджет проекта",money(p.budget),"Начальная стоимость")+
 cardNum("До подачи",until==null?"—":until<0?"Срок прошёл":until+" дн.","Дата: "+niceDate(p.deadline))+
 cardNum("Полнота",quality(p)+"%","Проверка обязательных полей")+
 cardNum("Приоритет",PRIORITIES[p.priority][0],CLASSES[p.classification][0])+'</div>'+
 section("Маршрут проекта", "Выполненные этапы — зелёные, текущий — синий. Красный используется для проблем, а не для стадии.",life(p)+
 '<div class="form-actions">'+stageTag(p)+(p.stage===2&&state.role==="operator"?pill("Ожидает решения руководителя","amber"):"")+
 ((p.stage<5&&!p.outcome&&!(p.stage===2&&state.role==="operator"))?button(p.stage===2?"✓ Согласовать":p.stage===4?"Зафиксировать итог →":"Перевести на следующий этап →","advance",p.id,p.stage===2?"primary":""): "")+
 (p.stage===5&&!p.outcome&&state.role==="manager"?button("Победа","mark-win",p.id,"primary")+button("Не выигран","mark-loss",p.id,"warn"):"")+
 "</div>");
}
function projectOverview(p){
 const conf=state.role==="manager";
 return '<div class="grid2"><div>'+section("Ручное обогащение", "Вносите проверенные факты и следующий шаг. Правки фиксируются в истории проекта.",'<form data-form="enrich" data-id="'+esc(p.id)+'"><div class="form-grid">'+
 select("classification","Классификация",p.classification,Object.entries(CLASSES).map(x=>[x[0],x[1][0]]),"Насколько лот соответствует профилю компании")+
 select("priority","Приоритет",p.priority,Object.entries(PRIORITIES).map(x=>[x[0],x[1][0]]),"Внутренний приоритет, не стадия закупки")+
 (conf?select("owner","Ответственный",p.owner,demoNames.map(n=>[n,n]),"Назначить исполнителя"):"")+
 textfield("summary","Резюме",p.summary,"Что требуется заказчику и зачем участвовать")+
 textfield("requirements","Ключевые требования",p.requirements,"Факты из технической спецификации")+
 textfield("risks","Риски и вопросы",p.risks,"Неясные требования, сроки, соответствие")+
 inputs("nextAction","Следующий шаг",p.nextAction,"Конкретное действие со сроком")+
 inputs("technology","Технология",p.technology,"Например: NGFW / EDR / WAF")+
 inputs("supplier","Поставщик",p.supplier,"В графе совпадающие поставщики объединяются")+
 (conf?inputs("cost","Плановая себестоимость",p.cost==null?"":p.cost,"Только руководитель. Не является чистой прибылью.","number"):"")+
 '</div><div class="form-actions"><button class="btn primary" type="submit">Сохранить обогащение</button></div></form>')+"</div><div>"+
 section("Ближайшие действия", "Состояние задач проекта.",p.tasks.slice(0,5).map(t=>taskLine(p,t)).join("")||empty("Нет задач. Создайте первую на вкладке «Задачи»."))+
 section("Документы лота", "Источники документов всегда проверяются на официальном портале.",'<div class="listrow"><span><strong>Карточка лота</strong><small>DEMO-номер, без реальной ссылки</small></span>'+pill("Учебные данные","grey")+'</div><div class="listrow"><span><strong>Техническая спецификация</strong><small>Ссылка или файл настоящего ТЗ в демонстрации отсутствует</small></span>'+pill("Нет файла","amber")+'</div>')+
 section("Теги и связи", "Структурированные связи формируют граф знаний.",'<div class="tags">'+p.tags.map(t=>'<span class="chip">#'+esc(t)+button("×","remove-tag",p.id+":"+t,"small ghost")+"</span>").join("")+'</div><form data-form="tag" data-id="'+esc(p.id)+'" class="toolbar"><input class="field" name="tag" maxlength="30" placeholder="Добавить тег, например: NGFW" required><button class="btn">+ Добавить</button></form><p class="fine">Общие теги, заказчики и поставщики становятся узлами графа.</p>'+
 '<div class="form-actions">'+link("Открыть граф →","graph","small")+"</div>")+"</div></div>";
}
function taskLine(p,t){
 return '<div class="taskline">'+button(t.done?"✓":"○","toggle-task",p.id+":"+t.id,"small icononly taskcheck "+(t.done?"done":""))+
 '<div><strong class="'+(t.done?"done-text":"")+'">'+esc(t.title)+'</strong><small>'+esc(t.assignee)+' · '+niceDate(t.due)+"</small></div>"+
 pill(t.done?"Готово":days(t.due)<0?"Просрочено":days(t.due)<=3?"Скоро срок":"В работе",t.done?"green":days(t.due)<0?"red":days(t.due)<=3?"amber":"blue")+"</div>";
}
function projectTasks(p){
 return '<div class="grid2"><div>'+section("Задачи проекта","Дедлайны, исполнители и факт выполнения.",p.tasks.map(t=>taskLine(p,t)).join("")||empty("Задачи отсутствуют.")+
 '<form class="form-grid" data-form="task" data-id="'+esc(p.id)+'" style="margin-top:20px">'+inputs("title","Новая задача","","Измеримый результат")+inputs("due","Срок",localDay(2),"Дата выполнения","date")+
 (state.role==="manager"?select("assignee","Исполнитель",p.owner,demoNames.map(n=>[n,n]),"Ответственный за задачу"):"")+
 '<div class="form-actions"><button class="btn primary">+ Добавить задачу</button></div></form>')+"</div><div>"+
 section("Процесс и качество","Задачи видны на личном дашборде оператора.",'<div class="hint">Проверяйте причины задержек. Количество и скорость задач не являются полноценной оценкой работы сотрудника.</div>'+
 '<p class="small">Открыто: '+p.tasks.filter(t=>!t.done).length+" · завершено: "+p.tasks.filter(t=>t.done).length+'</p>'+link("Перейти в центр сроков →","tasks"))+"</div></div>";
}
function projectLinks(p){
 const choices=dataset().filter(x=>x.id!==p.id);
 return '<div class="grid2"><div>'+section("Связи между лотами","Устанавливаются вручную и визуализируются в графе.",p.links.map(id=>{const other=get(id);return other?line(other,button("×","unlink",p.id+":"+id,"small"),"Связан вручную"):"";}).join("")||empty("Явные связи пока не установлены.")+
 '<form data-form="link" data-id="'+esc(p.id)+'" style="margin-top:18px"><label class="small strong">Связать с проектом '+tip("Укажите взаимосвязанный лот. Действие логируется и отображается на графе")+'</label><select class="field" name="target" required><option value="">Выберите проект</option>'+
 choices.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.number+" · "+x.title)+"</option>").join("")+'</select><div class="form-actions"><button class="btn primary">Добавить связь</button></div></form>')+"</div><div>"+
 section("Граф знаний","Общие заказчики, технологии, поставщики и теги.",'<div class="hint">Совпадение реквизитов — повод проверить контекст, но не доказательство аффилированности.</div><div class="listrow"><strong>Заказчик</strong><span class="small">'+esc(p.customer)+'</span></div><div class="listrow"><strong>Технология</strong><span class="small">'+esc(p.technology||"Не указана")+'</span></div><div class="listrow"><strong>Поставщик</strong><span class="small">'+esc(p.supplier||"Не указан")+'</span></div>'+link("◉ Исследовать граф →","graph","primary"))+"</div></div>";
}
function projectAudit(p){
 const events=state.events.filter(e=>e.object===p.id);
 return section("История изменений проекта","Кто изменял данные, этапы и задачи. История в этом макете сохраняется только в браузере.",events.map(e=>'<div class="auditline"><strong>'+esc(e.action)+'</strong><small>'+new Date(e.at).toLocaleString("ru-RU")+' · '+esc(e.actor)+'</small><p class="small">'+esc(e.detail)+'</p><div class="auditmeta">'+pill(e.outcome,e.outcome==="success"?"green":"red")+'<code>'+esc(e.id)+'</code></div></div>').join("")||empty("История этого проекта пока пуста."));
}
function project(){
 const p=get(ui.project);if(!p)return heading("Проект не найден","Нужного проекта нет в демонстрационной базе.",link("К списку","projects"));
 const tabs=[["overview","Обзор и обогащение"],["tasks","Задачи"],["links","Связи"],["history","История"]];
 return projectHeader(p)+'<div class="tabs">'+tabs.map(x=>'<button type="button" class="tab '+(ui.projectTab===x[0]?"active":"")+'" data-action="project-tab" data-id="'+x[0]+'">'+x[1]+"</button>").join("")+"</div>"+
 (ui.projectTab==="tasks"?projectTasks(p):ui.projectTab==="links"?projectLinks(p):ui.projectTab==="history"?projectAudit(p):projectOverview(p));
}
function deadlines(){
 const rows=dataset().flatMap(p=>p.tasks.map(t=>({p,t}))).filter(x=>state.role==="manager"||x.t.assignee==="Айжан").sort((a,b)=>(a.t.done?1:0)-(b.t.done?1:0)||a.t.due.localeCompare(b.t.due));
 return heading("Сроки и задачи","Очередь исполнения по дедлайнам. Сотруднику — только его задачи, руководителю — вся команда.",link("Все проекты →","projects"))+
 '<div class="metrics">'+cardNum("Всего задач",rows.length,"В демоверсии")+cardNum("Открыто",rows.filter(x=>!x.t.done).length,"На исполнении")+cardNum("Просрочено",rows.filter(x=>!x.t.done&&days(x.t.due)<0).length,"Нужны действия")+cardNum("Закрыто",rows.filter(x=>x.t.done).length,"Выполнено")+"</div>"+
 section("Очередь сроков","Откройте проект, чтобы уточнить план и назначить новые действия.",'<div class="tablewrap"><table><thead><tr><th>Задача</th><th>Проект</th><th>Исполнитель</th><th>Дедлайн</th><th>Состояние</th></tr></thead><tbody>'+
 rows.map(x=>'<tr><td>'+esc(x.t.title)+'</td><td>'+projectLink(x.p)+'</td><td>'+esc(x.t.assignee)+'</td><td>'+niceDate(x.t.due)+'</td><td>'+pill(x.t.done?"Готово":days(x.t.due)<0?"Просрочено":"В работе",x.t.done?"green":days(x.t.due)<0?"red":"blue")+"</td></tr>").join("")+"</tbody></table></div>");
}
function insights(){
 if(state.role!=="manager")return heading("Недостаточно прав","Финансовая аналитика доступна руководителю.");
 const all=dataset(),decided=all.filter(p=>p.outcome),won=decided.filter(p=>p.outcome==="won").length,priced=all.filter(p=>p.cost!=null);
 return heading("Аналитика руководителя","Экономика, результаты и качество наполнения проектов. Показатели демонстрационные.",link("Мой дашборд →","dashboard"))+
 '<div class="metrics">'+cardNum("Лотов",all.length,"Учебный портфель")+cardNum("Известных исходов",decided.length,"Побед: "+won)+cardNum("Доля побед",decided.length?Math.round(won/decided.length*100)+"%":"—","Только известные исходы")+cardNum("Плановая разница",money(priced.reduce((sum,p)=>sum+p.budget-p.cost,0)),"Без прочих расходов")+'</div>'+
 '<div class="grid2">'+section("Нагрузка и контроль","Показатели нужны для помощи и балансировки работы.",'<div class="tablewrap"><table><thead><tr><th>Сотрудник</th><th>Проектов</th><th>Открыто задач</th><th>Полнота</th></tr></thead><tbody>'+
 demoNames.map(n=>{const arr=all.filter(p=>p.owner===n),q=arr.length?Math.round(arr.reduce((x,p)=>x+quality(p),0)/arr.length):0;return "<tr><td>"+esc(n)+"</td><td>"+arr.length+"</td><td>"+arr.reduce((x,p)=>x+p.tasks.filter(t=>!t.done).length,0)+"</td><td>"+(arr.length?q+"%":"—")+"</td></tr>";}).join("")+"</tbody></table></div>")+
 section("Финансовая дисциплина","Не выдаём неподтверждённые данные за доходность.",'<div class="listrow"><strong>Без себестоимости</strong>'+pill(all.filter(p=>p.cost==null).length+" лотов","amber")+'</div><div class="listrow"><strong>Ожидают решения</strong>'+pill(all.filter(p=>p.stage===2).length+" лотов","purple")+'</div><div class="listrow"><strong>Не заполнены на 75%</strong>'+pill(all.filter(p=>quality(p)<75).length+" лотов","amber")+'</div><div class="notice blue">Эта аналитика помогает найти незаполненные данные и проблемы процесса, а не автоматически выставить оценку сотрудникам.</div>')+"</div>";
}
function source(){
 return heading("Подключение к источникам","У каждой компании свой API-токен на приватном backend. Публичный макет не принимает настоящие токены.","","ИНТЕГРАЦИИ / ДЕМО")+
 '<div class="notice red"><strong>Не вводите здесь реальный API-токен.</strong> GitHub Pages — статический публичный сайт. Проверка ниже лишь моделирует поведение серверного коннектора.</div>'+
 '<div class="grid3">'+section("01 · Источник","Официальная интеграция на настоящем backend.",'<h3>Госзакуп Республики Казахстан</h3><p class="small">Источник закрепляется за tenant_id компании.</p>'+pill("Реальный API недоступен в демо","amber"))+
 section("02 · Проверка токена","Ответы и расшифровка ошибок.",'<p class="small">На backend: HTTPS GET /v3/lots с Bearer-токеном. Коды 401 / 403 / 429 и сетевые ошибки отображаются руководителю.</p>'+pill("В макете только симуляция","blue"))+
 section("03 · Доставка лотов","Каталог и последующее обогащение.",'<p class="small">Успешный импорт дополняет каталог компании; события пишутся в аудит, а клиентский токен не попадает в журналы.</p>'+pill("Очередь и роли — на backend","teal"))+'</div>'+
 section("Интерактивная проверка состояний","Демонстрирует UX руководителя без отправки каких-либо запросов.",'<div class="form-actions">'+(state.role==="manager"?button("Симулировать подключение OK","simulate-ok",null,"primary")+button("Симулировать ошибку 401","simulate-error",null,"warn"):pill("Только руководитель управляет источниками","amber"))+"</div><p class='small'>Текущий учебный результат: "+(state.connected?pill("OK · Подключён (макет)","green"):pill("Не подключён (макет)","amber"))+'</p><div class="hint">В рабочем продукте токен вводит только руководитель. Он проверяется backend, шифруется и остаётся отдельно у каждого тенанта. Ошибочный новый токен не заменяет действующий.</div>');
}
function graphData(){
 const nodes=[],edges=[],known=new Set();function add(id,label,kind,project){if(!known.has(id)){nodes.push({id,label,kind,project});known.add(id);}}
 dataset().forEach(p=>{
 add("p-"+p.id,p.title,"project",p.id);
 [["customer",p.customer],["technology",p.technology],["supplier",p.supplier]].filter(x=>x[1]).forEach(x=>{const key=x[0]+":"+x[1].toLowerCase().trim();add(key,x[1],x[0],null);edges.push({a:"p-"+p.id,b:key,kind:x[0]});});
 p.tags.forEach(t=>{const key="tag:"+t.toLowerCase();add(key,"#"+t,"tag",null);edges.push({a:"p-"+p.id,b:key,kind:"tag"});});
 p.links.forEach(id=>{if(get(id))edges.push({a:"p-"+p.id,b:"p-"+id,kind:"related"});});
 });
 return {nodes,edges};
}
function graphView(){
 const {nodes,edges}=graphData();const colors={project:"#416ee8",customer:"#0e958b",supplier:"#cb8a41",technology:"#7186ab",tag:"#865fbe"};
 const indexed=Object.fromEntries(nodes.map(n=>[n.id,n]));
 const n=nodes.length;
 nodes.forEach((node,i)=>{const angle=i*2.399963,ring=60+Math.sqrt(i)*33;node.x=Math.cos(angle)*Math.min(ring,430);node.y=Math.sin(angle)*Math.min(ring*.65,260);});
 const found=nodes.filter(x=>!ui.graphSearch||x.label.toLowerCase().includes(ui.graphSearch.toLowerCase())).map(x=>x.id);
 const visible=new Set(found);
 edges.forEach(e=>{if(visible.has(e.a)||visible.has(e.b)){visible.add(e.a);visible.add(e.b);}});
 const selected=indexed[ui.graphSelected];
 const neighbors=selected?edges.filter(e=>e.a===selected.id||e.b===selected.id).map(e=>({node:indexed[e.a===selected.id?e.b:e.a],type:e.kind})).filter(x=>x.node):[];
 const z=ui.graphZoom;const width=1000/z,height=630/z;
 const svg='<svg viewBox="'+(-width/2)+' '+(-height/2)+' '+width+' '+height+'" id="graph-svg" role="img" aria-label="Интерактивный граф лотов и общих данных">'+
 edges.filter(e=>visible.has(e.a)&&visible.has(e.b)).map(e=>{const a=indexed[e.a],b=indexed[e.b];return '<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="'+(e.kind==="related"?"#476fe0":"#b3c0d3")+'" stroke-width="'+(e.kind==="related"?2.7:1.6)+'" stroke-dasharray="'+(e.kind==="related"?"":"4 4")+'" opacity=".6"></line>';}).join("")+
 nodes.filter(x=>visible.has(x.id)).map(node=>'<g class="graphnode" data-action="graph-select" data-id="'+esc(node.id)+'" role="button" tabindex="0" transform="translate('+node.x+" "+node.y+')"><title>'+esc(node.label)+'</title><circle r="'+(node.kind==="project"?21:13)+'" fill="'+colors[node.kind]+'" stroke="'+(ui.graphSelected===node.id?"#20345b":"white")+'" stroke-width="'+(ui.graphSelected===node.id?4:2)+'"></circle><text y="'+(node.kind==="project"?35:27)+'" text-anchor="middle">'+esc(node.label.length>24?node.label.slice(0,23)+"…":node.label)+"</text></g>").join("")+'</svg>';
 const details=selected?'<h3>'+esc(selected.label)+'</h3>'+pill(selected.kind==="project"?"Проект":selected.kind==="tag"?"Тег":selected.kind==="customer"?"Заказчик":selected.kind==="supplier"?"Поставщик":"Технология","blue")+
 (selected.project?'<p>'+link("Открыть проект →","project:"+selected.project,"small primary")+"</p>":"")+
 '<p class="small">Связанные элементы: '+neighbors.length+"</p>"+
 neighbors.map(x=>'<button type="button" class="graphrel" data-action="graph-select" data-id="'+esc(x.node.id)+'">'+esc(x.node.label)+' <small class="muted"> · '+esc(x.type)+'</small></button>').join(""):'<h3>Исследование связей</h3><p class="subtitle">Выберите узел, чтобы посмотреть соседей. Цвет обозначает тип данных, линии — связи. Совпадения — не доказательства аффилированности.</p>';
 return heading("Граф знаний","Общая структура лотов, заказчиков, поставщиков, технологий и тегов. Только учебные данные.",link("← Все проекты","projects"))+
 '<div class="tabs"><button class="tab active" type="button">◉ Связи лотов</button><span class="fine">В приватной версии дополнительно доступен граф зависимостей задач.</span></div>'+
 '<div class="card graph-shell"><div class="graphbar"><input class="field" id="graph-search" value="'+esc(ui.graphSearch)+'" placeholder="Найти узел…" aria-label="Поиск по графу">'+button("−","zoom-out",null,"small")+button("+","zoom-in",null,"small")+button("Сбросить","zoom-reset",null,"small")+'</div><div class="graph-body"><div class="graphstage">'+svg+'</div><aside class="graphinfo">'+details+'</aside></div><div class="legend">'+Object.entries(colors).map(x=>'<span><i class="pill-dot" style="background:'+x[1]+'"></i>'+esc(({project:"Проект",customer:"Заказчик",technology:"Технология",supplier:"Поставщик",tag:"Тег"})[x[0]])+"</span>").join("")+"</div></div>";
}
function audit(){
 const arr=state.events.filter(e=>(ui.auditType==="all"||e.category===ui.auditType)&&(ui.auditOutcome==="all"||e.outcome===ui.auditOutcome)&&
 (state.role==="manager"||e.actor==="Айжан")).slice(0,150);
 return heading("Журнал событий","От входа до результатов и изменений. В публичной версии — только синтетические события из вашего браузера.",
 button("Экспорт JSONL","export-audit",null,"primary"))+
 '<div class="metrics">'+cardNum("Событий",arr.length,"Локальная история")+cardNum("Отказов / ошибок",arr.filter(e=>e.outcome!=="success").length,"В выбранной выборке")+cardNum("Последний запрос",arr.length?new Date(arr[0].at).toLocaleTimeString("ru-RU"):"—","Время браузера")+cardNum("Доставка наружу","Отключена","Только приватный backend")+'</div>'+
 section("Фильтры и контекст","События помечаются категорией, субъектом, действием и объектом.",'<div class="toolbar"><select class="field" id="audit-category"><option value="all">Все категории</option>'+["authentication","business","mutation","integration","request","security"].map(x=>'<option '+(ui.auditType===x?"selected":"")+' value="'+x+'">'+esc(x)+"</option>").join("")+'</select><select class="field" id="audit-outcome"><option value="all">Все результаты</option><option value="success" '+(ui.auditOutcome==="success"?"selected":"")+'>Успех</option><option value="failure" '+(ui.auditOutcome==="failure"?"selected":"")+'>Ошибка</option></select></div>'+
 '<div class="auditlist">'+arr.map(e=>'<details class="audit-entry"><summary><span>'+pill(e.outcome==="success"?"✓":"!",e.outcome==="success"?"green":"red")+' <strong>'+esc(e.action)+'</strong><small>'+esc(e.actor)+" · "+esc(e.object||"Общий контур")+'</small></span><small>'+new Date(e.at).toLocaleString("ru-RU")+'</small></summary><p class="small">'+esc(e.detail)+'</p><pre>'+esc(JSON.stringify({event_id:e.id,occurred_at:e.at,actor:e.actor,role:e.role,category:e.category,outcome:e.outcome,target:e.object||null},null,2))+"</pre></details>").join("")+'</div>')+
 section("Внешний антифрод и SIEM","Архитектура приватного приложения.",'<div class="notice blue">На backend используется audit_events → outbox → отдельный worker → подписанный HTTPS JSON. Публичное демо не отправляет и не собирает реальные события.</div>');
}
function nav(id,icon,name){return '<a href="#'+id+'" class="'+(ui.view===id||ui.view==="project"&&id==="projects"?"active":"")+'"><span class="nav-icon">'+icon+'</span><span class="nav-label">'+name+"</span></a>";}
function shell(body){
 return '<div class="app"><aside class="sidebar"><a class="logo" href="#dashboard">tender<span>BOLT</span></a><div class="brand-note">Tender intelligence workspace</div>'+
 '<div class="workspace-pill"><strong>ITIC · Учебная компания</strong><small>Изолированное демопространство</small></div>'+
 '<div class="nav-heading">ЛИЧНЫЙ КАБИНЕТ</div><nav class="nav">'+nav("dashboard","⌂","Мой дашборд")+nav("tasks","◷","Сроки и задачи")+"</nav>"+
 '<div class="nav-heading">ТЕНДЕРНЫЙ ПРОЦЕСС</div><nav class="nav">'+nav("projects","▤","Лоты и проекты")+nav("graph","◎","Граф знаний")+"</nav>"+
 '<div class="nav-heading">УПРАВЛЕНИЕ</div><nav class="nav">'+(state.role==="manager"?nav("insights","▥","Финансы и команда"):"")+nav("sources","↗","Источники")+nav("audit","◈",state.role==="manager"?"Аудит компании":"Мои действия")+"</nav>"+
 '<div class="sidebar-foot"><strong>'+esc(actor())+' · '+esc(ROLES[state.role])+'</strong><br>Прототип v0.7 · публичный<br><a href="./classic.html">Классическая версия v0.2 ↗</a></div></aside>'+
 '<div class="main"><header class="topbar"><div class="topbar-left"><span class="demo-label">ИНТЕРАКТИВНЫЙ МАКЕТ</span><span class="tiny">Не подключён к production</span></div><div class="top-actions">'+
 '<div class="role-switch"><label for="role-select">Роль:</label><select id="role-select"><option value="manager" '+(state.role==="manager"?"selected":"")+'>Руководитель</option><option value="operator" '+(state.role==="operator"?"selected":"")+'>Оператор</option></select></div>'+
 button("↺ Сбросить","reset",null,"small")+'<div class="circle">'+(state.role==="manager"?"Р":"А")+"</div></div></header>"+
 '<div class="banner-preview">● Это <strong>публичная визуальная демонстрация</strong>. Все лоты и финансовые показатели вымышлены, данные и история сохраняются только в вашем браузере. Реальный backend, токены и роли доступны исключительно в приватной VM.</div>'+
 '<main class="content">'+body+'<footer class="footer">tenderBOLT · UX Prototype v0.7 · GitHub Pages · Локальные демонстрационные данные</footer></main></div></div>';
}
function page(){
 return ui.view==="projects"?projects():ui.view==="project"?project():ui.view==="tasks"?deadlines():ui.view==="graph"?graphView():ui.view==="insights"?insights():ui.view==="sources"?source():ui.view==="audit"?audit():dashboard();
}
function render(){root.innerHTML=shell(page());}
function routing(){
 const h=decodeURIComponent(location.hash.slice(1)||"dashboard");
 if(h.startsWith("project:")){ui.view="project";ui.project=h.slice(8);ui.projectTab="overview";}
 else if(["dashboard","projects","tasks","graph","insights","sources","audit"].includes(h))ui.view=h;
 else ui.view="dashboard";
 if(ui.view==="insights"&&state.role!=="manager"){ui.view="dashboard";location.hash="#dashboard";return;}
 render();
}
function advance(p){
 if(p.stage===2&&state.role!=="manager")return notify("Согласование выполняет только руководитель.");
 if(p.stage>=5)return notify("Этот проект завершён.");
 const before=STAGES[p.stage];p.stage++;
 record("workflow.stage_changed",p.id,before+" → "+STAGES[p.stage]);
 save();render();notify("Этап проекта обновлён.");
}
function moveWidget(name,diff){const list=roleWidgets(),index=list.indexOf(name);if(index<0)return;const next=index+diff;if(next<0||next>=list.length)return;[list[index],list[next]]=[list[next],list[index]];save();ui.settingsOpen=true;render();}
function onAction(el){
 const action=el.dataset.action,id=el.dataset.id;
 if(action==="reset"){if(!confirm("Удалить локальные изменения публичного макета и загрузить учебные данные заново?"))return;state=seed();save();location.hash="#dashboard";routing();notify("Учебные данные восстановлены.");return;}
 if(action==="open-project"){location.hash=projectHref(id);return;}
 if(action==="project-tab"){ui.projectTab=id;render();return;}
 if(action==="toggle-new"){ui.showNew=!ui.showNew;render();return;}
 if(action==="widget-toggle"){const list=roleWidgets(),at=list.indexOf(id);if(el.checked&&at<0)list.push(id);if(!el.checked&&at>=0)list.splice(at,1);if(!list.length)list.push(id);ui.settingsOpen=true;save();render();return;}
 if(action==="widget-up"||action==="widget-down"){moveWidget(id,action==="widget-up"?-1:1);return;}
 if(action==="advance"){const p=get(id);if(p)advance(p);return;}
 if(action==="mark-win"||action==="mark-loss"){const p=get(id);if(p&&p.stage===5&&state.role==="manager"){p.outcome=action==="mark-win"?"won":"lost";record("workflow.outcome_recorded",p.id,p.outcome);save();render();}return;}
 if(action==="toggle-task"){const sep=id.lastIndexOf(":");const p=get(id.slice(0,sep)),t=p?.tasks.find(x=>x.id===id.slice(sep+1));if(!t)return;t.done=!t.done;record("task.status_changed",p.id,t.title+" → "+(t.done?"Выполнено":"Открыто"),"mutation");save();render();return;}
 if(action==="remove-tag"){const sep=id.indexOf(":");const p=get(id.slice(0,sep)),tag=id.slice(sep+1);if(!p)return;p.tags=p.tags.filter(t=>t!==tag);record("project.tag_removed",p.id,"Удалён тег #"+tag,"mutation");save();render();return;}
 if(action==="unlink"){const sep=id.indexOf(":");const p=get(id.slice(0,sep)),other=id.slice(sep+1);if(!p)return;p.links=p.links.filter(t=>t!==other);record("project.relation_removed",p.id,"Удалена связь с "+other,"mutation");save();render();return;}
 if(action==="zoom-in"||action==="zoom-out"||action==="zoom-reset"){ui.graphZoom=action==="zoom-reset"?1:Math.max(.55,Math.min(2.5,ui.graphZoom*(action==="zoom-in"?1.25:.8)));if(action==="zoom-reset"){ui.graphSearch="";ui.graphSelected=null;}render();return;}
 if(action==="graph-select"){ui.graphSelected=id;render();return;}
 if(action==="simulate-ok"||action==="simulate-error"){if(state.role!=="manager")return notify("Только руководитель может управлять подключением.");state.connected=action==="simulate-ok";record("goszakup.connect_simulated","goszakup",state.connected?"Ответ проверки: OK (демо)":"Симулированный HTTP 401: токен не подтверждён","integration",state.connected?"success":"failure");save();render();notify(state.connected?"Подключение OK (только демонстрация)":"Ошибка HTTP 401 (симуляция)");return;}
 if(action==="export-audit"){const events=state.events.filter(e=>state.role==="manager"||e.actor==="Айжан").map(e=>({schema:"tenderbolt.audit.demo.v1",event_id:e.id,occurred_at:e.at,actor:e.actor,role:e.role,category:e.category,event_type:e.action,outcome:e.outcome,target:e.object}));const blob=new Blob([events.map(e=>JSON.stringify(e)).join("\n")+"\n"],{type:"application/x-ndjson"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="tenderbolt-demo-audit.jsonl";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);record("audit.export","demo","Экспорт локальной истории","business");notify("JSONL создан в браузере.");return;}
}
function onForm(form){
 const d=new FormData(form),obj=Object.fromEntries(d.entries()),op=form.dataset.form,p=get(form.dataset.id);
 if(op==="create"){
  if(!obj.title.trim()||!obj.customer.trim()||!obj.number.trim()){notify("Заполните номер, название и заказчика.");return;}
  const newP={id:"TB-"+uid().toUpperCase(),title:obj.title.slice(0,180),number:obj.number.slice(0,80),customer:obj.customer.slice(0,100),
  budget:Math.max(0,Number(obj.budget)||0),cost:null,deadline:obj.deadline,owner:state.role==="manager"&&demoNames.includes(obj.owner)?obj.owner:"Айжан",stage:0,
  classification:"review",priority:"normal",tags:[],supplier:"",technology:"",summary:"",requirements:"",risks:"",nextAction:"Провести первичный отбор",tasks:[],links:[],outcome:null};
  state.projects.push(newP);record("project.created",newP.id,"Лот принят в работу","mutation");save();ui.showNew=false;location.hash=projectHref(newP.id);routing();notify("Учебный проект создан.");return;
 }
 if(!p)return;
 if(op==="enrich"){
  const old={...p};
  for(const key of ["summary","requirements","risks","nextAction","technology","supplier","classification","priority"]){if(obj[key]!==undefined)p[key]=String(obj[key]).slice(0,2000);}
  if(state.role==="manager"){if(obj.owner&&demoNames.includes(obj.owner))p.owner=obj.owner;if(obj.cost!==undefined)p.cost=obj.cost===""?null:Math.max(0,Number(obj.cost)||0);}
  const changes=Object.keys(old).filter(k=>JSON.stringify(old[k])!==JSON.stringify(p[k]));
  if(changes.length){record("project.enriched",p.id,"Изменены поля: "+changes.join(", "),"mutation");save();notify("Обогащение сохранено; изменение записано в аудит.");}else notify("Изменений нет.");
  render();return;
 }
 if(op==="tag"){const tag=String(obj.tag||"").trim().toLowerCase().slice(0,30);if(!tag||p.tags.includes(tag)){notify("Укажите новый тег.");return;}p.tags.push(tag);record("project.tag_added",p.id,"Добавлен тег #"+tag,"mutation");save();render();return;}
 if(op==="task"){const title=String(obj.title||"").trim();if(!title){notify("Введите название задачи.");return;}p.tasks.push({id:"task-"+uid(),title:title.slice(0,150),due:obj.due||localDay(3),assignee:state.role==="manager"?(obj.assignee||p.owner):"Айжан",done:false});record("task.created",p.id,"Добавлена задача "+title,"mutation");save();render();return;}
 if(op==="link"){const other=get(obj.target);if(!other||other.id===p.id||p.links.includes(other.id))return notify("Выберите другой ещё не связанный проект.");p.links.push(other.id);record("project.relation_added",p.id,"Связь с "+other.id,"mutation");save();render();return;}
}
root.addEventListener("click",e=>{const el=e.target.closest("[data-action]");if(el&&el.tagName!=="INPUT")onAction(el);});
root.addEventListener("submit",e=>{const form=e.target.closest("[data-form]");if(form){e.preventDefault();onForm(form);}});
root.addEventListener("change",e=>{
 const t=e.target;
 if(t.id==="role-select"){const role=t.value;if(role!==state.role&&ROLES[role]){state.role=role;record("demo.role_switched","demo","Переключение представления: "+ROLES[role],"authentication");save();if(ui.view==="insights"&&role!=="manager")location.hash="#dashboard";else render();}return;}
 if(t.id==="status-filter"){ui.status=t.value;render();return;}
 if(t.id==="project-search"){ui.search=t.value;render();return;}
 if(t.id==="graph-search"){ui.graphSearch=t.value;render();return;}
 if(t.id==="audit-category"){ui.auditType=t.value;render();return;}
 if(t.id==="audit-outcome"){ui.auditOutcome=t.value;render();return;}
 if(t.dataset.action==="widget-toggle"){onAction(t);return;}
});
root.addEventListener("keydown",e=>{const el=e.target.closest('[data-action="graph-select"]');if(el&&(e.key==="Enter"||e.key===" ")){e.preventDefault();onAction(el);}});
window.addEventListener("hashchange",routing);
routing();
})();
