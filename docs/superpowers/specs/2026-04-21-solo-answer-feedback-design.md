# ソロ学習モード：回答後フィードバック表示

**Date:** 2026-04-21  
**Status:** Approved

---

## 概要

ひとりで練習（solo）モードで回答した後、正解・不正解の明示と正解テキストを表示する。現状はボタンが緑/赤に色変わりするだけで、テキストによるフィードバックがない。

---

## スコープ

| ファイル | 変更内容 |
|----------|----------|
| `PartyRant-fam/src/app/solo/page.tsx` | フィードバックパネル追加、自動進行→手動進行、結果画面に問題別復習リスト追加 |
| `PartyRant-jp/src/app/join/[code]/GuestGameClient.tsx` | `sp_answered`状態に「あなたの回答」追加 |

---

## 要件

### fam: `solo/page.tsx`

**現状:**
- 回答後、選択肢ボタンが色変わり（緑=正解、赤=誤答）
- 1200ms後に自動で次の問題へ進む
- 正解・不正解を示すテキストなし

**変更後:**
1. `setTimeout`による自動進行を削除
2. 回答後、選択肢の下にフィードバックパネルをアニメーションなしで表示
3. フィードバックパネルの内容：
   - 正解時: 「⭕️ 正解！」（緑背景）
   - 不正解時: 「❌ 不正解」（赤背景）
   - 常時: 「正解は「{q.options[q.correctIndex]}」でした」
   - ボタン: 最終問題でない場合「次の問題 →」、最終問題の場合「結果を見る」
4. ボタン押下で従来の`setCurrentIndex` / `setPhase('result')`を実行

**判定ロジック（追加stateなし）:**
- `selected !== null` → フィードバックパネル表示
- `selected === q.correctIndex` → 正解
- `q.correctIndex === undefined` → 正解不明（パネルは「回答しました」表示のみ）

**stateの変更:**
- `answers`の型を `{ correct: boolean }[]` → `{ correct: boolean; choiceIndex: number }[]` に拡張
- `handleAnswer`で`choiceIndex`も保存するよう修正

---

### jp: `GuestGameClient.tsx`

**現状の`sp_answered`状態:**
- 絵文字（🎉/😅）
- 正解テキスト「正解は〇〇」
- 獲得ポイント・累計ポイント
- 「次の問題」ボタン

**追加:**
- 不正解時のみ「あなたの回答：「{q.options[revealInfo.myChoiceIndex]}」」を正解テキストの上に表示
- 正解時は不要（自明なため）
- `revealInfo.myChoiceIndex`は既にstateに保存済み、`questions[localQuestionIndex]`から選択肢テキストを取得

---

## UIレイアウト（fam solo）

```
┌─────────────────────────────┐
│ 問題文                       │
│                             │
│ [選択肢A ← 緑/赤/グレー]    │
│ [選択肢B]                   │
│ [選択肢C]                   │
│ [選択肢D]                   │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⭕️ 正解！               │ │  ← 緑背景 or
│ │ ❌ 不正解               │ │  ← 赤背景
│ │                         │ │
│ │ 正解は「〇〇」でした    │ │
│ │                         │ │
│ │    [次の問題 →]         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## スタイリング方針

既存のデザインシステムに従う（`pf-green`, `pf-dark`, border-[3px], shadow-[4px_4px_0]）。

- 正解パネル: `bg-green-50 border-pf-green`
- 不正解パネル: `bg-red-50 border-red-500`
- 正解テキスト: `text-sm font-bold text-pf-dark`
- 次へボタン: 既存の`bg-pf-green`スタイルを流用

---

## 結果画面：問題別復習リスト（fam solo）

既存の「8 / 10問正解 / 80%」の下に問題別一覧を追加する。

**表示内容（全問題）:**
- 問N ⭕️ or ❌
- 問題文（truncate可）
- 正解テキスト（常時）：`正解: {q.options[q.correctIndex]}`
- 不正解時のみ追加：`あなた: {q.options[answers[i].choiceIndex]}`

**UIレイアウト（結果画面追加部分）:**
```
結果
🎉
8 / 10問正解
80%

┌──────────────────────────────┐
│ 問1 ⭕️ 日本の首都は？        │
│      正解: 東京都             │
├──────────────────────────────┤
│ 問2 ❌ 四国の県の数は？       │
│      正解: 4県                │
│      あなた: 3県              │
├──────────────────────────────┤
│ 問3 ⭕️ ...                   │
│      正解: ...                │
└──────────────────────────────┘

[もう一度やる]  [トップへ]
```

**スタイリング:**
- 各行: `border-b border-gray-100 py-3`
- ⭕️行: 問題文 `text-pf-dark font-bold`
- ❌行: 問題文 `text-pf-dark font-bold`
- 正解テキスト: `text-pf-green text-sm font-bold`
- 自分の回答テキスト（不正解時）: `text-red-500 text-sm`

---

## 変更しないこと

- タイマーロジック（時間切れ時は`handleAnswer(-1)`で不正解扱い、そのままフィードバックパネルへ）
- `sp_answered`の既存ポイント表示部分（jpのみ）
- 自動進行のタイミング以外のstateマネジメント
