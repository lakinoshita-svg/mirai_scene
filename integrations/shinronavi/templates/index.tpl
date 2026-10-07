<?php // htmlはビルド生成物のみ。PHPとして実行せず、そのまま出力する。 ?>
<section id="mirai-scene" aria-label="ミライシーン">
  <nav class="mirai-local-nav" aria-label="ミライシーン内の案内">
    <a href="/mirai_scene/" aria-label="ミライシーン ホーム"><span class="miraiLogo">ミライシーン</span></a>
    <a href="/mirai_scene/about/">ミライシーンについて</a>
  </nav>
  <?= $this->mirai_page['html'] ?>
</section>
<?php foreach ($this->mirai_page['scripts'] as $script): ?>
  <script type="module" src="<?= h($script) ?>"></script>
<?php endforeach; ?>
