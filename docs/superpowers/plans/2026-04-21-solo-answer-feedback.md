# Solo Answer Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ひとりで練習モードで回答後に正解・不正解フィードバックパネルを表示し、結果画面に問題別復習リストを追加する。jpのself-pacedモードにも「あなたの回答」を追加する。

**Architecture:** `solo/page.tsx`の`answers`型を拡張して選択肢インデックスを保存し、クイズ画面に`selected !== null`をトリガーとするフィードバックパネルを追加、結果画面に問題別一覧を追加する。jpは`GuestGameClient.tsx`の`sp_answered`ブロックに不正解時の「あなたの回答」表示を追加するだけ。

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS

---

## ファイルマップ

| ファイル | 変更種別 | 内容 |
|----------|----------|------|
| `Y:/webwork/PartyRant-fam/src/app/solo/page.tsx` | Modify | answers型拡張・handleAnswer修正・フィードバックパネル追加・結果画面復習リスト追加 |
| `Y:/webwork/PartyRant-jp/src/app/join/[code]/GuestGameClient.tsx` | Modify | sp_answered内に不正解時「あなたの回答」追加 |

---

## Task 1: fam — `answers`型の拡張と`handleAnswer`修正

**Files:**
- Modify: `Y:/webwork/PartyRant-fam/src/app/solo/page.tsx:27,58-74`

現在の`answers`は`{ correct: boolean }[]`のみ。結果画面の復習リストで「あなたの回答」を表示するために`choiceIndex`を追加する。また`setTimeout`自動進行を削除して`handleNext`関数に分離する。

- [ ] **Step 1: `answers`の型定義・state・`handleAnswer`・`handleNext`を修正する**

`solo/page.tsx`の27行目と58-74行目を以下に置き換える：

```tsx
// 27行目: answersのstate型を変更
const [answers, setAnswers] = useState<{ correct: boolean; choiceIndex: number }[]>([]);
```

```tsx
// 58-74行目: handleAnswerとhandleNextに分離
const handleAnswer = useCallback((choiceIndex: number) => {
  if (selected !== null) return;
  const q = questions[currentIndex];
  setSelected(choiceIndex);
  const correct = q.correctIndex === choiceIndex;
  setAnswers(prev => [...prev, { correct, choiceIndex }]);
}, [selected, questions, currentIndex]);

const handleNext = useCallback(() => {
  if (currentIndex + 1 >= questions.length) {
    setPhase('result');
  } else {
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setStartedAt(Date.now());
  }
}, [currentIndex, questions.length]);
```

- [ ] **Step 2: タイマー切れ時の`handleAnswer(-1)`呼び出しを確認する**

`solo/page.tsx`の153行目付近：
```tsx
onExpired={() => { if (selected === null) handleAnswer(-1); }}
```
この行はそのまま維持する（`-1`は`correctIndex`と一致しないため自動的に不正解になる）。変更不要。

- [ ] **Step 3: コミット**

```bash
cd /y/webwork/PartyRant-fam
git add src/app/solo/page.tsx
git commit -m "refactor: extend answers state with choiceIndex, split handleNext"
```

---

## Task 2: fam — クイズ画面にフィードバックパネルを追加

**Files:**
- Modify: `Y:/webwork/PartyRant-fam/src/app/solo/page.tsx:142-187`

回答後（`selected !== null`のとき）、選択肢の下にフィードバックパネルを表示する。

- [ ] **Step 1: クイズ画面のJSXブロック（142-187行目）を修正する**

`</div>` `</main>`の直前（`</div>`の閉じタグと`</main>`の間）に以下のフィードバックパネルを追加する。

現在の構造（184-186行目付近）：
```tsx
          </div>
        </div>
      </main>
```

これを以下に置き換える：
```tsx
          </div>

          {selected !== null && (() => {
            const isCorrect = q.correctIndex !== undefined && selected === q.correctIndex;
            const correctText = q.correctIndex !== undefined ? q.options[q.correctIndex] : null;
            const isLast = currentIndex + 1 >= questions.length;
            return (
              <div className={[
                'rounded-[12px] border-[3px] px-4 py-4 flex flex-col gap-3',
                isCorrect
                  ? 'bg-green-50 border-pf-green'
                  : 'bg-red-50 border-red-500',
              ].join(' ')}>
                <p className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-dm)' }}>
                  {isCorrect ? '⭕️ 正解！' : '❌ 不正解'}
                </p>
                {correctText && (
                  <p className="text-sm font-bold text-pf-dark">
                    正解は「{correctText}」でした
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 bg-pf-green text-white font-bold text-base rounded-[10px] border-[3px] border-pf-dark shadow-[4px_4px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[1px] active:translate-y-[1px] transition-[transform,box-shadow] duration-75 touch-manipulation"
                  style={{ fontFamily: 'var(--font-dm)' }}
                >
                  {isLast ? '結果を見る' : '次の問題 →'}
                </button>
              </div>
            );
          })()}
        </div>
      </main>
```

- [ ] **Step 2: 動作確認**

```bash
cd /y/webwork/PartyRant-fam
pnpm dev
```

ブラウザで `http://localhost:3000/solo` を開き：
1. 設定画面で学年・教科を選んでスタート
2. 選択肢をタップ → ボタンが緑/赤に色変わり
3. フィードバックパネルが表示される（⭕️/❌ + 正解テキスト + 「次の問題→」ボタン）
4. 「次の問題」ボタンをタップ → 次の問題に進む
5. 最後の問題で「結果を見る」ボタンが表示される
6. タイマー切れ → 不正解パネルが表示される

- [ ] **Step 3: コミット**

```bash
git add src/app/solo/page.tsx
git commit -m "feat: add answer feedback panel to solo quiz mode"
```

---

## Task 3: fam — 結果画面に問題別復習リストを追加

**Files:**
- Modify: `Y:/webwork/PartyRant-fam/src/app/solo/page.tsx:189-229`

結果画面の既存コンテンツ（絵文字・スコア・パーセント・ボタン）を維持しつつ、ボタンの上に問題別復習リストを追加する。

- [ ] **Step 1: 結果画面のJSX（202-225行目付近）を修正する**

現在の結果画面のボタン群の前（`<div className="w-full flex flex-col gap-3 mt-6">`の前）に以下の復習リストを挿入する：

```tsx
        {/* 問題別復習リスト */}
        <div className="w-full flex flex-col border-[3px] border-pf-dark rounded-[12px] overflow-hidden shadow-[4px_4px_0_#1A1A2E]">
          {questions.map((q, i) => {
            const a = answers[i];
            if (!a) return null;
            const correctText = q.correctIndex !== undefined ? q.options[q.correctIndex] : null;
            const myText = a.choiceIndex >= 0 ? q.options[a.choiceIndex] : null;
            return (
              <div key={q.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">{a.correct ? '⭕️' : '❌'}</span>
                  <p className="text-sm font-bold text-pf-dark leading-snug">{q.text}</p>
                </div>
                {correctText && (
                  <p className="text-xs font-bold text-pf-green mt-1 pl-6">
                    正解: {correctText}
                  </p>
                )}
                {!a.correct && myText && (
                  <p className="text-xs text-red-500 mt-0.5 pl-6">
                    あなた: {myText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
```

この挿入位置は `<div className="w-full flex flex-col gap-3 mt-6">` の直前。

- [ ] **Step 2: 動作確認**

`http://localhost:3000/solo` で全問回答して結果画面を確認：
1. 絵文字・「N/M問正解」・パーセントが表示される
2. 復習リストが表示される：
   - ⭕️の問題：問題文 + 緑で「正解: 〇〇」
   - ❌の問題：問題文 + 緑で「正解: 〇〇」+ 赤で「あなた: △△」
3. タイマー切れ（`choiceIndex: -1`）の問題は「あなた」表示なし（`q.options[-1]`はundefinedのため）
4. ボタン「もう一度やる」「トップへ」が下に表示される

- [ ] **Step 3: コミット**

```bash
git add src/app/solo/page.tsx
git commit -m "feat: add per-question review list to solo result screen"
```

---

## Task 4: jp — `sp_answered`に不正解時「あなたの回答」を追加

**Files:**
- Modify: `Y:/webwork/PartyRant-jp/src/app/join/[code]/GuestGameClient.tsx:896-901`

現在の`sp_answered`ブロック（882-922行目）の正解テキスト表示部分の直後に、不正解時のみ「あなたの回答」を追加する。

- [ ] **Step 1: 正解テキストブロックを修正する**

現在（896-901行目）：
```tsx
              {correctOption && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('correctAnswer')}</p>
                  <p className="text-3xl text-pr-dark" style={{ fontFamily: 'var(--font-bebas)' }}>{correctOption}</p>
                </div>
              )}
```

これを以下に置き換える：
```tsx
              {correctOption && (
                <div className="flex flex-col gap-2 items-center">
                  {!isCorrect && revealInfo && revealInfo.myChoiceIndex >= 0 && q.options[revealInfo.myChoiceIndex] && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">あなたの回答</p>
                      <p className="text-2xl text-red-500" style={{ fontFamily: 'var(--font-bebas)' }}>{q.options[revealInfo.myChoiceIndex]}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('correctAnswer')}</p>
                    <p className="text-3xl text-pr-dark" style={{ fontFamily: 'var(--font-bebas)' }}>{correctOption}</p>
                  </div>
                </div>
              )}
```

- [ ] **Step 2: 動作確認**

```bash
cd /y/webwork/PartyRant-jp
pnpm dev
```

`http://localhost:3000/join` でself-pacedゲームに参加して：
1. 正解した問題：「あなたの回答」は表示されない、正解テキストのみ表示
2. 不正解の問題：「あなたの回答: △△（赤）」と「正解: 〇〇」が両方表示される
3. タイマー切れ（`myChoiceIndex: -1`）：`q.options[-1]`はundefinedのため「あなたの回答」は表示されない

- [ ] **Step 3: コミット**

```bash
cd /y/webwork/PartyRant-jp
git add src/app/join/[code]/GuestGameClient.tsx
git commit -m "feat: show user's answer on sp_answered screen when incorrect"
```

---

## 自己レビュー結果

**スペックカバレッジ:**
- ✅ fam: 自動進行→手動進行（Task 1でhandleNext分離、Task 2でNextボタン追加）
- ✅ fam: ⭕️/❌ + 正解テキスト（Task 2）
- ✅ fam: answersにchoiceIndex保存（Task 1）
- ✅ fam: 結果画面の復習リスト・正解テキスト常時・不正解時「あなた」表示（Task 3）
- ✅ jp: 不正解時「あなたの回答」追加（Task 4）
- ✅ タイマー切れ（choiceIndex: -1）のエッジケース対応（Task 2検証Step・Task 3検証Step・Task 4検証Step）

**プレースホルダー:** なし

**型整合性:**
- `answers`型: Task 1で`{ correct: boolean; choiceIndex: number }[]`に定義、Task 3で`a.choiceIndex`として参照 ✅
- `handleNext`: Task 1で定義、Task 2のonClickで参照 ✅
