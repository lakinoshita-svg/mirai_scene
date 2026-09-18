(() => {
 'use strict';
 const app=document.getElementById('app');
 let activeInterest='all', activeCategory='すべて', reflection=null, selected=null, revealed=false, currentCareer=null, step=0, answers=[];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function focusHeading(){const h=app.querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}window.scrollTo({top:0,behavior:'instant'});}

 function card(c){
  return `<a class="career" href="#career/${c.id}" style="--card-bg:${c.color};--card-ink:${c.ink}">
   <div class="career-art">${c.image?`<img src="${c.image}" alt="${esc(c.imageAlt)}" loading="lazy">`:`<span class="word-art" aria-hidden="true">${c.word}</span>`}<span class="art-label">${c.category}</span></div>
   <div class="card-body"><span class="career-role">${c.name}のひと場面</span><h3>${c.entryTitle}</h3><p>${c.description}</p><div class="card-bottom"><span>約3分 · 3つのシーン</span><span class="card-arrow" aria-hidden="true">↗</span></div></div>
  </a>`;
 }
 function home(){
  currentCareer=null;
  document.title='ミライシーン | “好き”から始まる進路選び';
  const visible=CAREERS.filter(c=>(activeInterest==='all'||c.interests.includes(activeInterest))&&(activeCategory==='すべて'||c.category===activeCategory));
  app.innerHTML=`<div class="home">
   <nav class="breadcrumbs" aria-label="現在地"><a href="https://shinronavi.com/" target="_blank" rel="noopener">進路ナビ ↗</a><span aria-hidden="true">/</span><span>ミライシーン</span></nav>
   <section class="intro"><span class="eyebrow">“好き”から始まる進路選び</span>
    <h1>なんとなく、<span class="interest-word">好きかも。</span><br>その気持ちから、ちょっと体験。</h1>
    <p>やりたいことが、まだ分からなくても大丈夫。<br>画像を見たり、選んだり。仕事のひと場面で「気になる」を探してみよう。</p>
    <div class="intro-stamp" aria-hidden="true"><span>いま決めなくても</span><strong>大丈夫。</strong><span>まずは、約3分の体験</span></div>
   </section>
   <section aria-labelledby="catalog-title">
    <div class="catalog-title"><h2 id="catalog-title">どんなことが、ちょっと気になる？</h2></div>
    <div class="filters interest-filters" role="group" aria-label="興味から体験を探す">
     <button class="filter ${activeInterest==='all'?'active':''}" data-interest="all" aria-pressed="${activeInterest==='all'}">まだ分からない・いろいろ見る</button>
     ${INTERESTS.map(t=>`<button class="filter ${t.id===activeInterest?'active':''}" data-interest="${t.id}" aria-pressed="${t.id===activeInterest}">${t.label}</button>`).join('')}
    </div>
    <details class="field-picker" ${activeCategory!=='すべて'?'open':''}><summary>職業の分野からも探せます</summary><div class="filters" role="group" aria-label="分野で絞り込む">${['すべて',...new Set(CAREERS.map(c=>c.category))].map(c=>`<button class="filter ${c===activeCategory?'active':''}" data-category="${c}" aria-pressed="${c===activeCategory}">${c}</button>`).join('')}</div></details>
    <p class="catalog-count" aria-live="polite">${activeCategory!=='すべて'?activeCategory:activeInterest==='all'?'いろいろな仕事のひと場面':INTERESTS.find(t=>t.id===activeInterest).label+'につながるひと場面'} <span>${visible.length}件</span></p>
    <div class="grid" id="career-grid">${visible.map(card).join('')}</div>
   </section>
   <section class="about-note"><div><h2>体験してから、気持ちを見つめてみよう。</h2><p>「おもしろそう」も「ちょっと違うかも」も、大切な気づき。仕事を決める必要はありません。少し気になったら、その先の学びをのぞいてみてください。</p></div><a class="text-link" href="#about">ミライシーンについて ↗</a></section>
  </div>`;
  app.querySelectorAll('[data-interest]').forEach(b=>b.onclick=()=>{activeInterest=b.dataset.interest;activeCategory='すべて';home();app.querySelector(`[data-interest="${activeInterest}"]`).focus({preventScroll:true});});
  app.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.category;activeInterest='all';home();app.querySelector('.field-picker').open=true;app.querySelector(`[data-category="${activeCategory}"]`).focus({preventScroll:true});});
 }
 function showScene(){const c=currentCareer,s=c.scenes[step];document.title=`${c.name}の仕事体験 | ミライシーン`;app.innerHTML=`<div class="experience"><a class="back" href="#">← 体験一覧に戻る</a><div class="experience-top"><span>${c.category} / ${c.name}</span><span>SCENE ${String(step+1).padStart(2,'0')} / 03</span></div><div class="progress" aria-label="全3シーン中${step+1}シーン目">${c.scenes.map((_,i)=>`<span class="${i<=step?'done':''}"></span>`).join('')}</div><article class="scene-card">${c.brief&&step===0?`<div class="brief"><strong>今回のミッション</strong><p>${c.mission}</p><dl><dt>役割</dt><dd>${c.brief.role}</dd><dt>相手</dt><dd>${c.brief.audience}</dd><dt>目的</dt><dd>${c.brief.goal}</dd><dt>条件</dt><dd>${c.brief.constraint}</dd></dl></div>`:''}<span class="scene-kicker">あなたなら、どうする？</span><h1>${s.title}</h1><p>${s.situation}</p>${s.image?`<img class="scene-image" src="${s.image}" alt="${esc(c.imageAlt)}">`:''}${s.comparison?'<div class="comparison"><figure><a href="assets/poster-a.png" target="_blank" rel="noopener" aria-label="A案を別タブで拡大"><img src="assets/poster-a.png" alt="A案。青い背景に大きな見出しと、イベントの日時を配置したポスター"></a><figcaption>A案 · 情報をはっきり伝える</figcaption></figure><figure><a href="assets/poster-b.png" target="_blank" rel="noopener" aria-label="B案を別タブで拡大"><img src="assets/poster-b.png" alt="B案。オレンジとピンクの表現を主役に、見出しを小さく配置したポスター"></a><figcaption>B案 · 雰囲気で興味を引く</figcaption></figure></div><p class="fine-print">画像を押すと、別タブで大きく見られます。</p>':''}<h2 class="question" id="question">${s.question}</h2><div class="options" role="group" aria-labelledby="question">${s.options.map((o,i)=>`<button class="option ${selected===i?'selected':''}" data-option="${i}" aria-pressed="${selected===i}" ${revealed?'disabled':''}><span class="option-letter">${'ABC'[i]}</span><span>${o[0]}</span></button>`).join('')}</div>${revealed?`<section class="feedback" tabindex="-1"><span class="selected-caption">あなたが選んだのは ${'ABC'[selected]}</span><h2>この選択にある、仕事の視点。</h2><p>${s.options[selected][1]}</p>${s.effects?`<div class="effects"><div><strong>この方法のよさ</strong><p>${s.effects[selected][0]}</p></div><div><strong>気をつけたいこと</strong><p>${s.effects[selected][1]}</p></div></div>`:''}<details class="other-choices"><summary>ほかの選択の視点も見る</summary>${s.options.map((o,i)=>i===selected?'':`<section><h3>${'ABC'[i]} · ${o[0]}</h3><p>${o[1]}</p></section>`).join('')}</details><div class="perspective"><strong>この仕事で大切にしたいこと</strong><p>${s.perspective}</p></div><p class="fine-print">状況や相手によって、必要な対応は変わります。</p><div class="actions"><button class="primary" id="next">${step===2?'体験を振り返る':'次のシーンへ'} <span>→</span></button></div></section>`:`<div class="actions"><button class="primary" id="explain" ${selected===null?'disabled':''}>この選択の視点を見る <span>→</span></button></div>`}</article></div>`;app.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.option);app.querySelectorAll('[data-option]').forEach(v=>{v.classList.toggle('selected',v===b);v.setAttribute('aria-pressed',String(v===b));});document.getElementById('explain').disabled=false;});const explain=document.getElementById('explain');if(explain)explain.onclick=()=>{if(selected===null)return;answers[step]=selected;revealed=true;showScene();const f=app.querySelector('.feedback');f.focus({preventScroll:true});f.scrollIntoView({behavior:'smooth',block:'start'});};const next=document.getElementById('next');if(next)next.onclick=()=>{if(step===2){finish();}else{step++;selected=null;revealed=false;showScene();}focusHeading();};}

 function finish(){
  const c=currentCareer;
  document.title=`体験のあとに見つけた気持ち | ミライシーン`;
  const tags=c.scenes.map((s,i)=>({id:i,label:s.insight})).concat([{id:'unsure',label:'まだ、よく分からない'},{id:'different',label:'少し違うかも'}]);
  const response=reflection===null?'気持ちに近いものがあれば、選んでみてください。選ばずに先へ進んでも大丈夫です。':reflection==='unsure'?'すぐに分からなくても大丈夫。ほかの仕事を体験してから、考えてみてもかまいません。':reflection==='different'?'「少し違うかも」も、体験したからこその気づき。別のひと場面も、のぞいてみませんか。':`「${c.scenes[reflection].insight}」が気になったんですね。この体験につながる学びも、下で紹介しています。`;
  app.innerHTML=`<div class="experience"><a class="back" href="#">← ほかの体験を探す</a><article class="scene-card">
   <div class="finish-intro"><div class="finish-icon" aria-hidden="true">✦</div><span class="scene-kicker">${c.name}の3つのシーンを体験しました</span><h1>「好きかも」は、<br>見つかった？</h1><p>はっきりした答えは、まだなくても大丈夫。<br>今の気持ちを、少しだけ振り返ってみよう。</p></div>
   <section class="reflection" aria-labelledby="reflection-title"><h2 class="question" id="reflection-title">どの部分が、ちょっと気になった？</h2><div class="reflection-options" role="group" aria-labelledby="reflection-title">${tags.map(t=>`<button class="filter ${reflection===t.id?'active':''}" data-reflection="${t.id}" aria-pressed="${reflection===t.id}">${t.label}</button>`).join('')}</div><p id="reflection-response" class="reflection-response" aria-live="polite">${response}</p></section>
   <details class="experience-recap"><summary>選んだことと、仕事の視点を振り返る</summary><ul class="insights">${c.scenes.map((s,i)=>`<li><b>0${i+1}</b><div><strong>${s.insight}</strong>${answers[i]!==undefined?`<p class="answer-record">あなたの選択：${s.options[answers[i]][0]}</p>`:''}<p>${s.perspective}</p></div></li>`).join('')}</ul></details>
   <section class="learning-next"><span class="scene-kicker">気になったら、もう少し。</span><h2 class="question">この体験は、こんな学びにつながっています。</h2><div class="study-links">${c.studies.map(s=>`<span>${s}</span>`).join('')}</div><p>${c.learning}</p><p class="fine-print">学校によって学べる内容や課程は異なります。今の選択から適性を判定したおすすめではありません。</p><a class="primary learning-action" href="https://shinronavi.com/" target="_blank" rel="noopener">進路ナビで学校を調べる ↗</a><p class="fine-print">進路ナビのトップページが別タブで開きます。気になった学びの名前を手がかりに探せます。</p><div class="small-step"><strong>資料請求は、決めるためだけのものではありません。</strong><p>授業や学生生活を知るためにパンフレットを読む。雰囲気を確かめにオープンキャンパスへ行く。情報を集める一歩から始められます。</p></div></section>
   <h2 class="question">別の「気になる」も、探してみよう。</h2><div class="next-careers">${CAREERS.filter(v=>v.id!==c.id).sort((a,b)=>b.interests.filter(t=>c.interests.includes(t)).length-a.interests.filter(t=>c.interests.includes(t)).length).slice(0,2).map(v=>`<a href="#career/${v.id}"><span class="career-role">${v.name}</span>${v.entryTitle} ↗</a>`).join('')}</div><div class="actions"><a class="text-link" href="#">いろいろな体験を見てみる →</a></div>
  </article></div>`;
  app.querySelectorAll('[data-reflection]').forEach(b=>b.onclick=()=>{const v=b.dataset.reflection;reflection=/^[0-2]$/.test(v)?Number(v):v;const y=window.scrollY;finish();app.querySelector(`[data-reflection="${v}"]`).focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});});
 }
 function about(){
  document.title='ミライシーンについて | 進路ナビ';
  app.innerHTML=`<div class="experience about-page"><a class="back" href="#">← 体験を探す</a><article class="scene-card"><span class="scene-kicker">進路ナビの体験コンテンツ</span><h1>“好き”から始まる、<br>進路選び。</h1><p>「なんとなく好き」「少し気になる」。ミライシーンは、そんな小さな気持ちを、仕事のひと場面を通して探す体験です。やりたいことや将来の目標が、まだ決まっていなくても始められます。</p><h2>見て、選んで、気づく。</h2><p>画像や場面を見て「自分ならどうする？」を選びます。解説では、その仕事で大切にされる考え方に触れられます。約3分の体験のあとに、どこがおもしろかったか、どこが違うと感じたかを振り返ってみてください。</p><h2>気持ちに、正解はありません。</h2><p>選択で点数をつけたり、適性や向いている仕事を決めたりはしません。好きなことが見つからなくても、選ばずに別の体験へ進んでも大丈夫です。仕事のすべてや、専門的な判断を再現するものではありません。</p><h2>知るための、一歩へ。</h2><p>少し気になったら、つながる学びや学校について見てみる。パンフレットや、実際に学ぶ人の声に触れてみる。オープンキャンパスで雰囲気を知る。進路を決める前に、情報を集めるところから始められます。</p><h2>この試作版について</h2><p>進路ナビ内への導入を検討するための試作です。現時点では進路ナビ本体とは接続していません。掲載シーンや画像は架空の設定で、AIを活用して制作した編集用原稿です。専門家による監修は未実施で、正式公開に向けて確認・改善していきます。</p><div class="actions"><a href="#" class="primary">気になる体験を探す →</a></div></article></div>`;
 }
 function route(){const h=location.hash.slice(1);if(h==='about'){about();}else if(h.startsWith('career/')){const c=CAREERS.find(v=>v.id===h.split('/')[1]);if(c){currentCareer=c;step=0;answers=[];reflection=null;selected=null;revealed=false;showScene();}else{home();}}else{home();}focusHeading();}
 window.addEventListener('hashchange',route);route();
 // Small explicit tools for browser agents; same actions and content as the visible interface.
 const context=document.modelContext || navigator.modelContext;
 if(context?.registerTool){
  const lifecycle=new AbortController();
  const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
  register({name:'list_careers',description:'List available career experiences.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:async()=>CAREERS.map(({id,name,category})=>({id,name,category}))});
  register({name:'open_career',description:'Start a career experience and reset its current answers.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(!input||typeof input.id!=='string'||!CAREERS.some(c=>c.id===input.id))return {error:'Unknown career ID'};history.replaceState(null,'','#career/'+input.id);route();return {opened:input.id};}});
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 }
})();
