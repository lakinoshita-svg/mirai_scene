// 方向は操作の意味で決める。外部ドメインかどうかでなく、別タブを開く場合だけexternal。
export const actionArrowPaths = {
  forward: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  external: 'M7 17 17 7M7 7h10v10',
  down: 'M12 4v16m-6-6 6 6 6-6',
};

/** @param {keyof typeof actionArrowPaths} [kind] */
export function renderActionArrow(kind = 'forward') {
  if (!Object.hasOwn(actionArrowPaths, kind)) throw new Error(`未定義の矢印です: ${kind}`);
  // 固定のSVGだけを返す。本文と分離し、読み上げ・キーボードフォーカスの対象にしない。
  // em/currentColorにより、学校検索CTAや単独バナーでも親の文字サイズ・色にそろう。
  return `<svg class="actionArrow" data-arrow-kind="${kind}" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="flex-shrink:0;vertical-align:middle"><path d="${actionArrowPaths[kind]}"></path></svg>`;
}
