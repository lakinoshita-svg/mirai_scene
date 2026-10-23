<?php // htmlはビルド生成物のみ。PHPとして実行せず、そのまま出力する。 ?>
<section id="mirai-scene" aria-label="ミライシーン">
  <?= $this->mirai_page['html'] ?>
</section>
<?php foreach ($this->mirai_page['scripts'] as $script): ?>
  <script type="module" src="<?= h($script) ?>"></script>
<?php endforeach; ?>
