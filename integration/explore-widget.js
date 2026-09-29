(() => {
    const script = document.currentScript;
    if (!script) return;
    const slug = script.dataset.lesson || new URLSearchParams(location.search).get('slug');
    const entries = {"art_design":[{"label":"デザイン","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/design/"}],"voc_art_design":[{"label":"デザイン","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/design/"}],"engineering_info":[{"label":"情報・IT","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/it/"},{"label":"ゲーム","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/games/"}],"it_information_processing":[{"label":"情報・IT","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/it/"}],"engineering_civil_architecture":[{"label":"建築","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/architecture/"}],"architecture_architecture":[{"label":"建築","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/architecture/"}],"education_education":[{"label":"保育・幼児教育","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/childcare/"}],"childcare_childcare":[{"label":"保育・幼児教育","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/childcare/"}],"socialscience_tourism":[{"label":"観光","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/tourism/"}],"tourism_tourism":[{"label":"観光","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/tourism/"}],"beauty_beauty":[{"label":"美容","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/beauty/"}],"cooking_cooking":[{"label":"調理","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/cooking/"}],"cooking_bakery":[{"label":"製菓・製パン","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/pastry/"}],"science_biology":[{"label":"動物","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/animals/"}],"animal_trainer":[{"label":"動物","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/animals/"}],"agriculture_agriculture":[{"label":"農業","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/agriculture/"}],"voc_agriculture_agriculture":[{"label":"農業","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/agriculture/"}],"socialscience_management":[{"label":"経営・商学","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/business/"}],"socialscience_commerce":[{"label":"経営・商学","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/business/"}],"music_business":[{"label":"イベント","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/events/"}],"media_sound_light":[{"label":"イベント","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/events/"}],"socialscience_media":[{"label":"出版・メディア","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/media/"}],"media_broadcast":[{"label":"出版・メディア","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/media/"}],"art_video":[{"label":"映像","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/video/"}],"media_video":[{"label":"映像","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/video/"}],"gamecg_game":[{"label":"ゲーム","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/games/"}],"humanities_literature":[{"label":"文学・文化・歴史","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/culture/"}],"humanities_culture":[{"label":"文学・文化・歴史","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/culture/"}],"humanities_history":[{"label":"文学・文化・歴史","url":"https://lakinoshita-svg.github.io/mirai_scene/explore/culture/"}]}[slug];
    if (!entries) return;
    const section = document.createElement('section');
    section.className = 'mirai-scene-links';
    const heading = document.createElement('h2');
    heading.textContent = 'この学びにつながる仕事を体験しよう';
    section.append(heading);
    const list = document.createElement('ul');
    entries.forEach(entry => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry.url;
      link.textContent = entry.label + 'のミライシーンへ';
      item.append(link); list.append(item);
    });
    section.append(list);
    script.after(section);
  })();