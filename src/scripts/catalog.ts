import { registerTools } from './webmcp';
import { sitePath } from '../lib/paths';
const root=document.querySelector<HTMLElement>('[data-catalog]');
if(root){
  const cards=[...root.querySelectorAll<HTMLAnchorElement>('[data-career]')];
  const interests=[...root.querySelectorAll<HTMLButtonElement>('[data-interest]')];
  const categories=[...root.querySelectorAll<HTMLButtonElement>('[data-category-filter]')];
  root.querySelector<HTMLElement>('.catalog-controls')!.hidden=false;
  function filter(interest:string,category:string,label:string){
    let count=0;
    cards.forEach(card=>{card.hidden=!((interest==='all'||card.dataset.interests?.split(' ').includes(interest))&&(category==='すべて'||card.dataset.category===category));if(!card.hidden)count++;});
    interests.forEach(b=>{const selected=b.dataset.interest===interest;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
    categories.forEach(b=>{const selected=b.dataset.categoryFilter===category;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
    root!.querySelector<HTMLElement>('[data-count-label]')!.textContent=label;
    root!.querySelector<HTMLElement>('[data-count]')!.textContent=`${count}件`;
  }
  interests.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.interest!,'すべて',b.dataset.interest==='all'?'いろいろな仕事のひと場面':`${b.textContent}につながるひと場面`)));
  categories.forEach(b=>b.addEventListener('click',()=>filter('all',b.dataset.categoryFilter!,b.dataset.categoryFilter==='すべて'?'いろいろな仕事のひと場面':b.dataset.categoryFilter!)));
  // Preserve links shared from the original hash-routed prototype.
  let legacy='';
  try { legacy=decodeURIComponent(location.hash.slice(1)); } catch { /* Ignore malformed legacy links. */ }
  if(legacy==='about')location.replace(sitePath('about/'));
  else if(legacy.startsWith('career/')){
    const card=cards.find(c=>c.dataset.career===legacy.slice(7));
    if(card)location.replace(card.href);
  }
  registerTools([
    {name:'list_careers',description:'List available career experiences.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>cards.map(c=>({id:c.dataset.career,name:c.dataset.name,category:c.dataset.category}))},
    {name:'open_career',description:'Navigate to a career experience.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
      const id=(input as {id?:unknown})?.id;
      const card=typeof id==='string'?cards.find(c=>c.dataset.career===id):undefined;
      if(!card)return {error:'Unknown career ID'};
      location.assign(card.href);return {navigatingTo:card.href};
    }},
  ]);
}
