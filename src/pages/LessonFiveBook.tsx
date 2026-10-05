import { type ReactNode, useState } from 'react';
import {
  adjectivePairs, bookWeather, exercise9A, exercise9B, exercise9Bank,
  exercise12, exercise12Bank, exercise23, kptVerbs, weatherDialogues, weekdays,
} from '../data/lessonFiveBook';

type Speech = (text: string) => ReactNode;
type Draft = (id: string, label: string) => ReactNode;

export function BookSource({ page, open = false }: { page: number; open?: boolean }) {
  return <details className="lesson5-book-source" open={open}>
    <summary>View page {page} · Printed page number</summary>
    <img className="lesson5-source-image" src={`/lesson5/book/page-${page}.jpg`} alt={`English–Thai adapted learning materials — page ${page} as printed in the book`} loading="lazy" />
    <a href={`/lesson5/book/page-${page}.jpg`} target="_blank" rel="noreferrer">Open full-size page {page}</a>
  </details>;
}

export function BookVocabulary({ section, speak }: { section: 'Seasons' | 'Weather' | 'Adjectives'; speak: Speech }) {
  if (section === 'Adjectives') return <section className="lesson5-book-section">
    <h3>Page 60 · What is it like? — Adjective pairs</h3>
    <p>Complete list of 10 pairs from the book (e.g., "big" and "large" have similar meanings). "Much" / "a little" are quantifiers.</p>
    <div className="lesson5-vocabulary">{adjectivePairs.map(([left, thLeft, right, thRight]) => <article key={left}>{speak(left)}<p>{thLeft}</p><span aria-hidden="true">↕</span>{speak(right)}<p>{thRight}</p></article>)}</div>
    <BookSource page={60} />
  </section>;
  if (section === 'Weather') return <section className="lesson5-book-section">
    <h3>Page 61 · Full page sentences</h3>
    <p>The table below contains sentences from page 61, including temperature examples and additional vocabulary.</p>
    <div className="lesson5-vocabulary">{bookWeather.map(([fi, th]) => <article key={fi}>{speak(fi)}<p>{th}</p></article>)}</div>
    <h4>Dialogues below images</h4>
    {weatherDialogues.map((dialogue, i) => <article className="lesson5-exercise" key={i}>{dialogue.map(([fi, th]) => <div key={fi}>{speak(fi)}<p>{th}</p></div>)}</article>)}
    <p><b>Helpful notes:</b> terrible = แย่มาก, lovely = ดีมาก, really = จริง ๆ; ใช้ How + adjective เช่น How lovely! เพื่ออุทาน</p>
    <BookSource page={61} />
  </section>;
  return <section className="lesson5-book-section">
    <h3>Page 62 · Additional tables</h3>
    <p>The 4 seasons, 12 months, and 7 time periods are listed above. The book also includes days of the week and a birthday dialogue.</p>
    <h4>Days of the week</h4>
    <div className="lesson5-vocabulary">{weekdays.map(([day, when, th]) => <article key={day}>{speak(day)}<p>{th}</p>{speak(when)}<p>on {th}</p></article>)}</div>
    <div className="lesson-tip"><b>Use the correct preposition for time</b><p>Seasons and periods use "in" (e.g., in summer); months use "in" (e.g., in June); days of the week use "on" (e.g., on Monday).</p></div>
    <h4>When is your birthday?</h4>
    {speak('When is your birthday?')}<p>วันเกิดของคุณเมื่อไร?</p>
    {speak('My birthday is in May.')}<p>วันเกิดของฉันอยู่ในเดือนพฤษภาคม</p>
    <p>birthday = วันเกิด; ใช้ in กับเดือน ลองเปลี่ยน May เป็นเดือนเกิดของคุณ</p>
    <BookSource page={62} />
  </section>;
}

export function BookExercises({ speak, draft }: { speak: Speech; draft: Draft }) {
  const [exercise, setExercise] = useState<9 | 12 | 23>(9);
  return <section>
    <span className="kicker">ENGLISH–THAI ADAPTED LEARNING MATERIALS · LESSON 5</span>
    <h2>Book Exercises</h2>
    <p>เลขหน้าเป็นหมายเลขอ้างอิงของเอกสารฝึกอังกฤษ–ไทย Exercises from pages 73, 75, 81; answer key on page 331. Thai translations and explanations are supplementary.</p>
    <nav className="lesson5-options" aria-label="Select book exercise">
      {([[9, 73], [12, 75], [23, 81]] as const).map(([id, page]) => <button type="button" key={id} aria-pressed={exercise === id} className={exercise === id ? 'active' : ''} onClick={() => setExercise(id)}>{id} · Page {page}</button>)}
    </nav>

    {exercise === 9 && <section aria-label="Exercise 9">
      <h3>Exercise 9 · page 73</h3>
      <p><b>What is it like?</b></p>
      <BookSource page={73} />
      <h4>A. Find the opposites.</h4>
      <p>Words in the box: {exercise9Bank.join(' · ')}</p>
      <p>Example: <b lang="en">ugly ↔ beautiful</b>. Match the remaining 8 pairs. Left/right order is interchangeable.</p>
      {exercise9A.map(([left, right, th], i) => <article className="lesson5-exercise" key={left}>
        <h4>9A · Pair {i + 1}</h4>
        {i === 0 ? <p lang="en">ugly ↔ beautiful (example)</p> : <><p lang="en">{left} ↔ ___</p>{draft(`book-9a-${i}`, `Answer 9A pair ${i + 1}`)}</>}
        <details><summary>Answer key · Pair {i + 1}</summary>{speak(`${left} — ${right}`)}<p>{th}</p></details>
      </article>)}
      <h4>B. Write the adjectives.</h4>
      <p>8 items. Item 1 is an example. Some items have multiple correct answers per the key.</p>
      {exercise9B.map(({ prompt, th, answer, note }, i) => <article className="lesson5-exercise" key={prompt}>
        <h4>9B · Item {i + 1}</h4>{speak(prompt)}<p>{th}</p>
        {i === 0 ? <p>Example: <b lang="en">hot</b></p> : draft(`book-9b-${i}`, `Answer 9B item ${i + 1}`)}
        <details><summary>Answer key · 9B item {i + 1}</summary>{speak(answer)}<p>{note}</p></details>
      </article>)}
    </section>}

    {exercise === 12 && <section aria-label="Exercise 12">
      <h3>Exercise 12 · page 75</h3>
      <p><b>Match the pictures and sentences.</b> Each picture uses 3 sentences (12 total).</p>
      <BookSource page={75} open />
      <div className="lesson-tip"><b>Sentences in the box</b><div className="lesson3-chip-grid">{exercise12Bank.map(sentence => <span key={sentence}>{speak(sentence)}</span>)}</div></div>
      {exercise12.map(({ picture, answer, th, note }, i) => <article className="lesson5-exercise" key={picture}>
        <h4>Picture {i + 1} · {picture}</h4>
        {draft(`book-12-${i}`, `Answer 12 picture ${i + 1}`)}
        <details><summary>Answer key · Picture {i + 1}</summary>{speak(answer)}<p>{th}</p><p>{note}</p></details>
      </article>)}
    </section>}

    {exercise === 23 && <section aria-label="Exercise 23">
      <h3>Exercise 23 · page 81</h3>
      <p><b>Irregular verbs and spelling. Look at the picture and write what they do and do not do.</b></p>
      <BookSource page={81} open />
      <article className="lesson5-exercise"><h4>Example</h4>
        {speak('What are you doing on holiday?')}<p>พวกคุณทำอะไรในวันหยุด? Verbs: ski / stay at a hotel</p>
        {speak('On holiday, we do not ski.')}<p>ในวันหยุดพวกเราไม่เล่นสกี</p>
        {speak('On holiday, we stay at a hotel.')}<p>ในวันหยุดพวกเราพักค้างคืนที่โรงแรม</p>
      </article>
      {exercise23.map(({ question, th, verbs, picture, answers, meaning, note }, i) => <article className="lesson5-exercise" key={question}>
        <h4>Item {i + 1} · {question}</h4><p>{th}</p><p>Picture: {picture}</p><p lang="en">{verbs}</p>
        {draft(`book-23-${i}`, `Answer 23 item ${i + 1}`)}
        <details><summary>Answer key · Item {i + 1}</summary>{answers.map(answer => <p key={answer}>{speak(answer)}</p>)}<p>{meaning}</p><p>{note}</p></details>
      </article>)}
      <div className="lesson-tip"><b>Subject-Verb Agreement</b><p>Question "you" → Answer "I" or "we". Use "do not" / "does not" for negative sentences. Remember the third-person singular "-s" (e.g., he reads, she sleeps).</p></div>
      <h4>Verbs used in this exercise</h4>
      <div className="lesson5-vocabulary">{kptVerbs.map(([base, first, example, note]) => <article key={base}>{speak(base)}<p lang="en">{first}</p>{speak(example)}<p>{note}</p></article>)}</div>
      <h4>Note: "to do"</h4>
      {speak('I do, you do, he/she does, we do, you do, they do')}<p>Question forms: What do you do? / What does Paula do? / What do the children do?</p>
    </section>}
    <div className="lesson-tip"><b>Check with answer key on page 331.</b><p>Exercise 9B items 2–3 have multiple answers. Do not rely solely on character matching for open-ended questions.</p></div>
    <BookSource page={331} />
  </section>;
}