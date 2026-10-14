import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

class Element {
 constructor(){this.hidden=false;this.disabled=false;this.textContent='';this.dataset={};this.handlers={};this.classList={toggle(){}};}
 addEventListener(name, fn){this.handlers[name]=fn;}
 fire(name){this.handlers[name]?.({preventDefault(){}});}
 focus(){this.focused=true;}
 scrollIntoView(){}
 setAttribute(){}
}
const code=ts.transpile(fs.readFileSync('src/scripts/experience.ts','utf8'),{target:ts.ScriptTarget.ES2022});
test('scene review preserves answers, blocks skipping and returns to completion',()=>{
 const previous=[];const records=Array.from({length:3},()=>new Element());
 const summary=new Element();summary.hidden=true;
 summary.querySelector=s=>records[Number(s.match(/\d/)[0])];summary.querySelectorAll=()=>[];
 const scenes=Array.from({length:3},(_,i)=>{
  const scene=new Element();scene.hidden=i!==0;
  const form=new Element(), fieldset=new Element(), explain=new Element(), feedback=new Element(), next=new Element();
  const radio=new Element();radio.checked=false;radio.labels=[{querySelector:()=>({textContent:`answer${i}`})}];
  const other=new Element();
  form.querySelector=s=>s==='fieldset'?fieldset:explain;
  form.querySelectorAll=()=>[radio];
  scene.querySelector=s=>s==='form'?form:s==='[data-feedback]'?feedback:s==='[data-next]'?next:other;
  scene.querySelectorAll=()=>[other];
  if(i>0)previous.push(new Element());
  return Object.assign(scene,{form,fieldset,radio,next});
 });
 previous.push(new Element());
 const root={querySelectorAll:s=>s==='[data-scene]'?scenes:previous,querySelector:()=>summary};
 const document={title:'体験',querySelector:()=>root};
 vm.runInNewContext(code,{document,matchMedia:()=>({matches:true})});
 scenes[0].next.fire('click');assert.equal(scenes[0].hidden,false);
 for(const scene of scenes){scene.radio.checked=true;scene.form.fire('change');scene.form.fire('submit');scene.next.fire('click');}
 assert.equal(summary.hidden,false);assert.equal(document.title,'体験のあとに見つけた気持ち | ミライシーン');
 previous[2].fire('click');assert.equal(summary.hidden,true);assert.equal(scenes[2].hidden,false);assert.equal(document.title,'体験');
 previous[1].fire('click');assert.equal(scenes[1].hidden,false);
 assert.equal(records[1].textContent,'あなたの選択：answer1');assert.equal(scenes[1].fieldset.disabled,true);
 scenes[1].next.fire('click');scenes[2].next.fire('click');assert.equal(summary.hidden,false);
});
