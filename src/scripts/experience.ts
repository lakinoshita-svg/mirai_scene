const root = document.querySelector<HTMLElement>('[data-experience]');
if (root) {
  const scenes = [...root.querySelectorAll<HTMLElement>('[data-scene]')];
  const summary = root.querySelector<HTMLElement>('[data-summary]')!;
  let current = 0;
  const moveFocus = (element: HTMLElement) => {
    element.focus({preventScroll:true});
    element.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  };
  scenes.forEach((scene,index) => {
    const form = scene.querySelector<HTMLFormElement>('form')!;
    const fieldset = form.querySelector<HTMLFieldSetElement>('fieldset')!;
    const button = form.querySelector<HTMLButtonElement>('[data-explain]')!;
    const feedback = scene.querySelector<HTMLElement>('[data-feedback]')!;
    const radios = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    let revealed = false;
    fieldset.disabled = false;
    form.addEventListener('change', () => {button.disabled = !radios.some(r=>r.checked);});
    form.addEventListener('submit', event => {
      event.preventDefault();
      const selected = radios.findIndex(r=>r.checked);
      if (selected<0 || revealed || index!==current) return;
      revealed = true;
      fieldset.disabled = true;
      form.querySelector<HTMLElement>('[data-explain-actions]')!.hidden = true;
      scene.querySelector<HTMLElement>('[data-selected-caption]')!.textContent = `あなたが選んだのは ${String.fromCharCode(65+selected)}`;
      scene.querySelectorAll<HTMLElement>('[data-explanation]').forEach((el,i)=>el.hidden=i!==selected);
      scene.querySelectorAll<HTMLElement>('[data-other-choice]').forEach((el,i)=>el.hidden=i===selected);
      const label = radios[selected].labels?.[0].querySelector('span:last-child')?.textContent || '';
      summary.querySelector<HTMLElement>(`[data-answer="${index}"]`)!.textContent = `あなたの選択：${label}`;
      feedback.hidden=false;
      moveFocus(feedback);
    });
    scene.querySelector<HTMLButtonElement>('[data-next]')!.addEventListener('click',()=>{
      if(!revealed || index!==current)return;
      scene.hidden=true;
      current++;
      const next = scenes[current] ?? summary;
      next.hidden=false;
      if(next===summary)document.title='体験のあとに見つけた気持ち | ミライシーン';
      moveFocus(next);
    });
  });
  const reflections = [...summary.querySelectorAll<HTMLButtonElement>('[data-reflection]')];
  reflections.forEach(button=>button.addEventListener('click',()=>{
    reflections.forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});
    summary.querySelector<HTMLElement>('#reflection-response')!.textContent=button.dataset.response || '';
  }));
}
