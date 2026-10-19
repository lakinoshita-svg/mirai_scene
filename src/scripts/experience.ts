import { catalogReturn } from '../lib/catalogNavigation.mjs';
import { sitePath } from '../lib/paths';
import { track } from './analytics';
const root = document.querySelector<HTMLElement>('[data-experience]');
if (root) {
    const experienceId = root.dataset.experience!;
    let started = false, completed = false;
    const back = root.querySelector<HTMLAnchorElement>('[data-catalog-return]');
    const value = new URLSearchParams(location.search).get('returnTo');
    const returnUrl = value && catalogReturn(value, location.origin, sitePath());
    if (back && returnUrl) back.href = returnUrl;
    root.addEventListener('click', event => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-track]');
      if (link) track('linkClick', {experienceId,destination:link.dataset.track,destinationId:link.dataset.trackId});
    });
    const scenes = [...root.querySelectorAll<HTMLElement>('[data-scene]')];
    const summary = root.querySelector<HTMLElement>('[data-summary]')!;
    // 回答はDOM内のみで保持し、再読込時は最初から開始する（送信・永続保存はしない）。
    let current = 0;
    const experienceTitle = document.title;
    const moveFocus = (element: HTMLElement) => {
        element.focus({ preventScroll: true });
        element.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    };
    // 戻る操作は回答・解説を保持する。再回答や会員履歴の保存とは別の操作。
    root.querySelectorAll<HTMLButtonElement>('[data-previous]').forEach(button => {
        button.addEventListener('click', () => {
            if (current <= 0) return;
            (scenes[current] ?? summary).hidden = true;
            current--;
            scenes[current].hidden = false;
            document.title = experienceTitle;
            moveFocus(scenes[current]);
        });
    });
    scenes.forEach((scene, index) => {
        const form = scene.querySelector<HTMLFormElement>('form')!;
        const fieldset = form.querySelector<HTMLFieldSetElement>('fieldset')!;
        const button = form.querySelector<HTMLButtonElement>('[data-explain]')!;
        const feedback = scene.querySelector<HTMLElement>('[data-feedback]')!;
        const radios = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
        // 解説表示後の回答変更・二重送信を防ぐ。回答し直しを許可する場合は復習表示も再更新が必要。
        let revealed = false;
        fieldset.disabled = false;
        form.addEventListener('change', () => { button.disabled = !radios.some(r => r.checked); });
        form.addEventListener('submit', event => {
            event.preventDefault();
            const selected = radios.findIndex(r => r.checked);
            if (selected < 0 || revealed || index !== current)
                return;
            revealed = true;
            if (!started) { started = true; track('start',{experienceId}); }
            track('sceneComplete',{experienceId,sceneNumber:index+1});
            fieldset.disabled = true;
            form.querySelector<HTMLElement>('[data-explain-actions]')!.hidden = true;
            scene.querySelector<HTMLElement>('[data-selected-caption]')!.textContent = `あなたが選んだのは ${String.fromCharCode(65 + selected)}`;
            scene.querySelectorAll<HTMLElement>('[data-explanation]').forEach((el, i) => el.hidden = i !== selected);
            scene.querySelectorAll<HTMLElement>('[data-other-choice]').forEach((el, i) => el.hidden = i === selected);
            const label = radios[selected].labels?.[0].querySelector('span:last-child')?.textContent || '';
            summary.querySelector<HTMLElement>(`[data-answer="${index}"]`)!.textContent = `あなたの選択：${label}`;
            feedback.hidden = false;
            moveFocus(feedback);
        });
        scene.querySelector<HTMLButtonElement>('[data-next]')!.addEventListener('click', () => {
            if (!revealed || index !== current)
                return;
            scene.hidden = true;
            current++;
            const next = scenes[current] ?? summary;
            next.hidden = false;
            if (next === summary) {
                document.title = '体験のあとに見つけた気持ち | ミライシーン';
                if (!completed) { completed = true; track('complete',{experienceId}); }
            }
            moveFocus(next);
        });
    });
    // 以下のdata-*と#reflection-responseはexperienceReflection.astroの表示契約。
    // コンポーネント分割・名称変更時も、このセレクターと同時に修正する。
    const reflections = [...summary.querySelectorAll<HTMLButtonElement>('[data-reflection]')];
    reflections.forEach(button => button.addEventListener('click', () => {
        reflections.forEach(other => { other.classList.toggle('active', other === button); other.setAttribute('aria-pressed', String(other === button)); });
        summary.querySelector<HTMLElement>('#reflection-response')!.textContent = button.dataset.response || '';
    }));
}
