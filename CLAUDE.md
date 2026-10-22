# ゆきころバトル — コードの地図

ビルド不要の静的サイト（GitHub Pages）。`index.html` を開けば動く。
大きいファイルを丸ごと読まず、下の表から必要なファイルだけ読むこと。

| ファイル | 中身 |
| --- | --- |
| `index.html` | 画面のHTML（ロビー・ルール説明）と script の読み込み順 |
| `style.css` | 全CSS |
| `js/constants.js` | 定数・`$` ヘルパー |
| `js/sim.js` | ゲームの進行（ホスト側のシミュレーション、ボットAI含む） |
| `js/state.js` | アプリの状態変数 |
| `js/music.js` | 曲データ（SONGS）とBGM再生、スマホで音を出す処理 |
| `js/effects.js` | 効果音・演出 |
| `js/draw.js` | ドット絵の描画（最大。描画を触るときだけ読む） |
| `js/view.js` | クライアント側の表示状態 |
| `js/loop.js` | メインループ |
| `js/ui.js` | UI・ルーム・通信（PeerJS） |
| `js/input.js` | キーボード・タッチ入力 |
| `js/boot.js` | 起動処理、`window.__yk`（デバッグ用） |

- JSはすべて通常の `<script>` で、順番に読み込まれて1つのスコープ（グローバルの `const`/`let`）を共有する。読み込み順は `index.html` の通り。ファイルを足すときも順序に注意。
- 調べるときは Grep で関数名を探してから、該当ファイルの該当行だけ Read する。
