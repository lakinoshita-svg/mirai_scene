/** 公開先のbaseを必ず付ける。/mirai_scene/は外部リンクにも使うため命名整理で変更しない。 */
export const sitePath = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
export const careerPath = (slug: string) => sitePath(`careers/${slug}/`);
