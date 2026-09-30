<?php
// TOPはwide、探究記事はcompact。指定がなければwide。外部入力をURLへ渡さない。
$mirai_banner_compact = isset($mirai_banner_variant) && $mirai_banner_variant === 'compact';
?>
<link rel="stylesheet" href="/new/_app/_webroot/css/page/miraiscene/banner.css">
<a class="ms-entry-banner<?= $mirai_banner_compact ? ' ms-entry-banner--compact' : '' ?>" href="/mirai_scene/" data-mirai-entry="<?= $mirai_banner_compact ? 'inquiry' : 'top' ?>">
  <div class="ms-entry-banner__copy">
    <div class="ms-entry-banner__topline">
      <img class="ms-entry-banner__logo" src="/mirai_scene/assets/brand/mirai-scene-logo.png" alt="ミライシーン" width="2172" height="724" loading="lazy">
      <span class="ms-entry-banner__badge">約3分・登録不要</span>
    </div>
    <p class="ms-entry-banner__eyebrow"><?= $mirai_banner_compact ? '学びの先にある仕事を、のぞいてみよう。' : 'やりたいことが、まだ決まっていなくても。' ?></p>
    <p class="ms-entry-banner__title">気になる仕事で、<br><span>「あなたなら？」を体験。</span></p>
    <p class="ms-entry-banner__description">3つのシーンで、選んで、考える。<br>自分の「好き」のヒントを見つけよう。</p>
    <span class="ms-entry-banner__cta">仕事を体験してみる<span aria-hidden="true">→</span></span>
  </div>
  <div class="ms-entry-banner__visual" aria-hidden="true">
    <span class="ms-entry-banner__spark">✦</span>
    <div class="ms-entry-banner__scene">
      <span class="ms-entry-banner__scene-label">MIRAI SCENE</span>
      <img src="/mirai_scene/assets/brand/mirai-scene-favicon.png" alt="" width="1280" height="1280" loading="lazy">
      <span class="ms-entry-banner__question">もし、あなたなら？</span>
      <span class="ms-entry-banner__choice"><b>A</b>まず、相手に聞く</span>
      <span class="ms-entry-banner__choice"><b>B</b>試して、確かめる</span>
      <span class="ms-entry-banner__choice"><b>C</b>情報を整理する</span>
    </div>
    <span class="ms-entry-banner__note">小さな「気になる」から、<br>未来は広がっていく。</span>
  </div>
</a>
<?php unset($mirai_banner_compact, $mirai_banner_variant); ?>
