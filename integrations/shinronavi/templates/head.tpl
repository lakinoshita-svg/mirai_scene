<?php // 共通レイアウトのhead末尾から読み込む。ミライシーン以外には影響しない。 ?>
<?php if ($this->controller_name === 'miraiscene'): ?>
  <link rel="icon" type="image/png" href="/mirai_scene/assets/brand/mirai-scene-favicon.png">
  <link rel="shortcut icon" type="image/png" href="/mirai_scene/assets/brand/mirai-scene-favicon.png">
  <link rel="apple-touch-icon" href="/mirai_scene/assets/brand/mirai-scene-favicon.png">
<?php endif; ?>
