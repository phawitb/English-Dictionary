import { CSSProperties, ReactNode, useState } from "react";
import { Check, ChevronRight, MessageCircle, Volume2 } from "lucide-react";
import { ttsService } from "../services/ttsService";

type Step = "start" | "vowels" | "verbs" | "negative" | "yesno" | "words" | "introduce" | "exercises" | "time" | "check";
const steps: { id: Step; label: string }[] = [
  { id: "start", label: "Start" }, { id: "vowels", label: "Articles" }, { id: "verbs", label: "Verbs" },
  { id: "negative", label: "Negative" }, { id: "yesno", label: "Yes / No" }, { id: "words", label: "Question words" },
  { id: "introduce", label: "Introduce" }, { id: "exercises", label: "Exercises" }, { id: "time", label: "Time" }, { id: "check", label: "Check" },
];
const conjugation = [
  ["I", "speak", "ask", "- (base)", "I speak"], ["you", "speak", "ask", "- (base)", "you speak"],
  ["he/she/it", "speaks", "asks", "-s", "he/she speaks"], ["we", "speak", "ask", "- (base)", "we speak"],
  ["you (plural)", "speak", "ask", "- (base)", "you speak"], ["they", "speak", "ask", "- (base)", "they speak"],
  ["You (formal)", "speak", "ask", "- (base)", "You speak"],
];
const negatives = [
  ["I", "do not", "I do not speak", "I don't speak"], ["you", "do not", "you do not speak", "you don't speak"],
  ["he/she/it", "does not", "he does not speak", "he doesn't speak"], ["we", "do not", "we do not speak", "we don't speak"],
  ["you (plural)", "do not", "you do not speak", "you don't speak"], ["they", "do not", "they do not speak", "they don't speak"],
];
const olla = [
  ["I", "am", "I am", "am not", "I am not"], ["you", "are", "you are", "are not", "you are not"],
  ["he/she/it", "is", "he is", "is not", "he is not"], ["we", "are", "we are", "are not", "we are not"],
  ["you (plural)", "are", "you are", "are not", "you are not"], ["they", "are", "they are", "are not", "they are not"],
];
const questionWords = [
  ["who", "ใคร", "Who are you?", "I am Olga."], ["what", "อะไร (สิ่งของ)", "What day is it?", "It is Monday."],
  ["what", "อะไร (กิจกรรม)", "What language do you speak?", "I speak Italian."], ["when", "เมื่อไหร่", "When is the course?", "It is on Monday."],
  ["what nationality", "สัญชาติอะไร", "What nationality is Pedro?", "He is Brazilian."], ["where", "อยู่ที่ไหน", "Where do you live?", "We live in Finland."],
  ["where from", "จากที่ไหน", "Where are you from?", "I am from Brazil."], ["where to", "ไปที่ไหน", "Where are you going?", "I am going home."],
  ["why", "ทำไม", "Why don't you buy ice cream?", "Because I am saving money."], ["how", "อย่างไร / เท่าไร", "How old are you?", "I am 23 years old."],
];
const countries = [
  ["Finland", "Finnish", "Finnish"], ["France", "French", "French"], ["Greece", "Greek", "Greek"],
  ["Iceland", "Icelandic", "Icelandic"], ["Egypt", "Egyptian", "Arabic"], ["Russia", "Russian", "Russian"],
  ["Pakistan", "Pakistani", "Urdu"], ["Thailand", "Thai", "Thai"],
];
const cityExercise = ["in Vaasa", "in Jyväskylä", "in Kotka", "in Kouvola", "in Mäntsälä", "in Pori", "in Ii", "in Mikkeli"];
const foodExercise = ["coffee", "milk", "ice cream", "cake", "sugar", "cookie", "bun", "juice"];
const matching = ["I → buy", "you → sing", "Jussi → cries", "we → live", "you → laugh", "Pedro and Alex → are", "I → search", "you → love", "you → speak", "they → dance", "we → watch", "I → am", "teacher → asks", "we → sit"];
const negativeExamples = ["She does not speak English.", "We do not travel to Stockholm.", "Today I do not go to the course.", "Why do you not buy ice cream?", "They do not live in Finland.", "Why do you not ask the teacher?", "I do not live in Finland.", "You do not speak Swedish.", "You do not sit in the park.", "They do not buy coffee.", "She does not watch television.", "I do not laugh much.", "We do not save money."];
const comprehensive = ["What is this?", "What do you study?", "What course is this?", "How much is this ice cream?", "Where do you live?", "Where are you from?", "Why are you in Finland?", "When does the course start?", "Are you in the course?", "Do you live in Finland?", "Does she speak Japanese?", "Are they looking for the bus stop?", "Do you not save money?", "I do. / I don't.", "We do. / We don't.", "They do. / They don't.", "It does. / It doesn't."];
const days = [["Monday", "on Monday", "วันจันทร์"], ["Tuesday", "on Tuesday", "วันอังคาร"], ["Wednesday", "on Wednesday", "วันพุธ"], ["Thursday", "on Thursday", "วันพฤหัสบดี"], ["Friday", "on Friday", "วันศุกร์"], ["Saturday", "on Saturday", "วันเสาร์"], ["Sunday", "on Sunday", "วันอาทิตย์"], ["weekend", "on the weekend", "สุดสัปดาห์"]];
const timeWords = [["the day before yesterday", "เมื่อวานซืน"], ["yesterday", "เมื่อวาน"], ["today", "วันนี้"], ["tomorrow", "พรุ่งนี้"], ["the day after tomorrow", "มะรืน"], ["last week", "สัปดาห์ที่แล้ว"], ["this week", "สัปดาห์นี้"], ["next week", "สัปดาห์หน้า"], ["weekday", "วันธรรมดา"], ["on weekdays", "ในวันธรรมดา"]];
const quiz = [
  [
    "คำใดใช้ 'an' นำหน้า?",
    [
      "apple",
      "book",
      "car"
    ],
    "apple",
    "ใช้ an นำหน้าคำนามที่ขึ้นต้นด้วยเสียงสระ (a, e, i, o, u)"
  ],
  [
    "กริยาใน Present Simple เมื่อประธานเป็น he/she/it ต้องเติมอะไร?",
    [
      "-s",
      "-ing",
      "-ed"
    ],
    "-s",
    "เมื่อประธานเป็นเอกพจน์บุรุษที่ 3 กริยาต้องเติม -s หรือ -es"
  ],
  [
    "ประโยคใดถูกต้องสำหรับ 'they'?",
    [
      "they speak",
      "they speaks",
      "they speaking"
    ],
    "they speak",
    "ประธานที่เป็นพหูพจน์ (I, you, we, they) ใช้กริยาช่องปกติไม่ต้องเติม -s"
  ],
  [
    "รูปปฏิเสธของ 'we speak' คือข้อใด?",
    [
      "we do not speak",
      "we does not speak",
      "we is not speak"
    ],
    "we do not speak",
    "ใช้ do not สำหรับประธาน I, you, we, they"
  ],
  [
    "รูปย่อของ 'I am' ในภาษาพูดคือข้อใด?",
    [
      "I'm",
      "I is",
      "I are"
    ],
    "I'm",
    "I'm เป็นรูปย่อที่นิยมใช้ในภาษาพูดทั่วไป"
  ],
  [
    "สร้างคำถามจากประโยค 'You are Thai' ได้อย่างไร?",
    [
      "Are you Thai?",
      "Do you Thai?",
      "Is you Thai?"
    ],
    "Are you Thai?",
    "การสร้างคำถามด้วย verb to be ให้ย้ายกริยามาไว้หน้าประโยค"
  ],
  [
    "คำถามที่ต้องการทราบว่า 'ใคร' คือคำใด?",
    [
      "who",
      "what",
      "where"
    ],
    "who",
    "who ใช้ถามถึงบุคคล"
  ],
  [
    "คำถามที่ต้องการทราบว่า 'มาจากที่ไหน' คือข้อใด?",
    [
      "where from",
      "where",
      "where to"
    ],
    "where from",
    "where from ใช้ถามถึงแหล่งกำเนิดหรือที่มา"
  ],
  [
    "คำตอบที่ถูกต้องสำหรับ 'Do you live in Bangkok?' คือข้อใด?",
    [
      "Yes, I do.",
      "Yes, I am.",
      "Yes, I live."
    ],
    "Yes, I do.",
    "ตอบรับด้วยกริยาช่วย (do) ที่ใช้ในคำถาม"
  ],
  [
    "คำว่า 'or' ใช้ในสถานการณ์ใด?",
    [
      "ใช้เสนอตัวเลือก",
      "ใช้บอกเหตุผล",
      "ใช้บอกเวลา"
    ],
    "ใช้เสนอตัวเลือก",
    "or ใช้เชื่อมคำหรือประโยคเพื่อเสนอทางเลือก"
  ],
  [
    "บุพบทที่ถูกต้องสำหรับชื่อเมืองคือข้อใด?",
    [
      "in Bangkok",
      "at Bangkok",
      "on Bangkok"
    ],
    "in Bangkok",
    "ใช้ in นำหน้าชื่อเมืองหรือประเทศ"
  ],
  [
    "'ฉันมาจากประเทศไทย' ภาษาอังกฤษคือข้อใด?",
    [
      "I am from Thailand.",
      "I live in Thailand.",
      "I go to Thailand."
    ],
    "I am from Thailand.",
    "โครงสร้าง be from ใช้บอกที่มาของบุคคล"
  ],
  [
    "คำใดเขียนถูกต้องตามหลักภาษาอังกฤษ?",
    [
      "English",
      "english",
      "the English"
    ],
    "English",
    "ชื่อภาษาต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่เสมอ"
  ],
  [
    "บุพบทที่ถูกต้องสำหรับวันคือข้อใด?",
    [
      "on Monday",
      "in Monday",
      "at Monday"
    ],
    "on Monday",
    "ชื่อวันในสัปดาห์ต้องใช้บุพบท on"
  ],
  [
    "คำถาม Yes/No ในภาษาอังกฤษมักลงท้ายด้วยเสียงอย่างไร?",
    [
      "เสียงสูง (rising)",
      "เสียงต่ำ (falling)",
      "เสียงราบเรียบ"
    ],
    "เสียงสูง (rising)",
    "คำถามที่ตอบด้วย Yes/No มักลงท้ายด้วยเสียงสูงเพื่อแสดงความสงสัยหรือถาม"
  ]
] as const;

function English({ text, children }: { text: string; children?: ReactNode }) { return <button type="button" className="finnish-speak" onClick={() => ttsService.speak(text)} aria-label={`Listen to ${text}`}>{children ?? text}<Volume2 size={13} /></button>; }
function Grid({ items }: { items: string[] }) { return <div className="lesson3-chip-grid">{items.map(item => <English key={item} text={item} />)}</div>; }
function Table({ headers, rows, audioColumns }: { headers: string[]; rows: string[][]; audioColumns: number[] }) { return <div className="lesson3-table" style={{ "--columns": headers.length } as CSSProperties}><div className="table-head">{headers.map(h => <b key={h}>{h}</b>)}</div>{rows.map((row, i) => <div key={`${row[0]}-${i}`}>{row.map((cell, j) => audioColumns.includes(j) ? <English key={j} text={cell} /> : <span key={j}>{cell}</span>)}</div>)}</div>; }

export function LessonThreePage() {
  const [step, setStep] = useState<Step>("start");
  const [completed, setCompleted] = useState<Step[]>(() => { try { return JSON.parse(localStorage.getItem("sisu-english:lesson3:v1") || "[]"); } catch { return []; } });
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState(""), [score, setScore] = useState(0), [finished, setFinished] = useState(false);
  const finish = (id: Step) => { const next = [...new Set([...completed, id])]; setCompleted(next); localStorage.setItem("sisu-english:lesson3:v1", JSON.stringify(next)); };
  const go = (id: Step) => { finish(step); setStep(id); window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); };
  const q = quiz[index], progress = Math.round(completed.length / steps.length * 100);
  const title = (kicker: string, heading: string, body: string) => <div className="lesson-title"><div><span className="kicker">{kicker}</span><h2>{heading}</h2><p>{body}</p></div><MessageCircle /></div>;
  return <section className="page lesson-page lesson-three">
    <div className="lesson-hero"><div><span className="kicker">LESSON 3 · CHAPTER 2 DEEP DIVE</span><h1>Build English</h1><p>สร้างประโยคภาษาอังกฤษให้ถูกต้อง ตั้งแต่คำนำหน้าจนถึงบทสนทนา</p></div><div className="lesson-progress"><b>{progress}%</b><span>complete</span><i><em style={{ width: `${progress}%` }} /></i></div></div>
    <div className="lesson-tabs" role="tablist">{steps.map((s, i) => <button role="tab" aria-selected={step === s.id} className={step === s.id ? "active" : completed.includes(s.id) ? "done" : ""} onClick={() => setStep(s.id)} key={s.id}><span>{completed.includes(s.id) ? <Check size={14} /> : i + 1}</span>{s.label}</button>)}</div>
    {step === "start" && <div className="lesson-panel intro-panel"><div className="lesson-number">03</div><span className="kicker">ENGLISH SENTENCE TOOLKIT</span><h2>จากคำศัพท์ สู่ประโยคที่ใช้ได้จริง</h2><p>คำนำหน้า · การผันกริยา · ประโยคคำถาม · การแนะนำตัว · วันและเวลา พร้อมเฉลยแบบฝึกหัดจากต้นฉบับทุกชุด</p><div className="objectives"><div><span>01</span><p><b>เลือกคำนำหน้า</b>เข้าใจการใช้ a/an/the ให้ถูกต้อง</p></div><div><span>02</span><p><b>สร้างประโยค</b>ผันกริยา Present Simple บอกเล่า ปฏิเสธ และคำถาม</p></div><div><span>03</span><p><b>ใช้จริง</b>แนะนำตัว ถามข้อมูล และตอบอย่างเป็นธรรมชาติ</p></div></div><button className="primary lesson-next" onClick={() => go("vowels")}>เริ่มจากคำนำหน้า <ChevronRight /></button></div>}
    {step === "vowels" && <div className="lesson-panel">{title("ARTICLES", "คำนำหน้าคำนาม", "ใช้ a/an นำหน้าคำนามนับได้เอกพจน์ และ the นำหน้าสิ่งที่เฉพาะเจาะจง")}<div className="vowel-groups"><article className="back"><b>a</b><span>ใช้หน้าเสียงพยัญชนะ</span><p>เช่น a book, a car, a university</p></article><article className="neutral"><b>an</b><span>ใช้หน้าเสียงสระ</span><p>เช่น an apple, an orange, an hour</p></article><article className="front"><b>the</b><span>ใช้กับสิ่งที่เฉพาะเจาะจง</span><p>ใช้ได้กับทั้งคำนามเอกพจน์และพหูพจน์</p></article></div><h3>กฎการใช้ที่สำคัญ</h3><div className="suffix-grid">{[["a", "หน้าพยัญชนะ"], ["an", "หน้าสระ"], ["the", "เฉพาะเจาะจง"], ["-s", "พหูพจน์"], ["-es", "พหูพจน์ (ลงท้าย s,sh,ch,x)"], ["in", "ใน (สถานที่)"], ["on", "บน/วัน"]].map(([a,b]) => <article key={a}><b>{a}</b><span>{b}</span></article>)}</div><h3>ตัวอย่างการใช้</h3><div className="example-flow"><article><English text="a book" /><span>เสียงพยัญชนะ b</span></article><article><English text="an apple" /><span>เสียงสระ a</span></article><article><English text="the sun" /><span>มีหนึ่งเดียว</span></article><article><English text="a university" /><span>เสียงพยัญชนะ y</span></article></div><div className="lesson-tip"><b>คำนามนับไม่ได้</b><p>คำอย่าง coffee, milk, sugar ไม่ต้องใช้ a/an นำหน้า</p></div><h3>ฝึกเลือก a หรือ an</h3><Grid items={["a dog", "an egg", "a cat", "an umbrella", "a house", "an idea", "a pen", "an artist", "a table", "an elephant"]} /><button className="primary lesson-next" onClick={() => go("verbs")}>ต่อไป: การผันกริยา <ChevronRight /></button></div>}
    {step === "verbs" && <div className="lesson-panel">{title("VERB CONJUGATION", "กริยาเปลี่ยนตามประธาน", "ใน Present Simple ประธานเอกพจน์บุรุษที่ 3 (he/she/it) ต้องเติม -s ที่กริยา")}<Table headers={["Subject", "speak", "ask", "Ending", "Spoken"]} rows={conjugation} audioColumns={[0,1,2,4]} /><h3>กริยาพิเศษ be (am/is/are)</h3><Table headers={["Subject", "Base", "Positive", "Negative", "Spoken Negative"]} rows={olla} audioColumns={[0,1,2,3,4]} /><div className="lesson-tip"><b>จุดสังเกต</b><p>I am, you are, he/she/it is, we are, they are. อย่าลืมเติม -s ที่กริยาเมื่อประธานเป็นเอกพจน์</p></div><button className="primary lesson-next" onClick={() => go("negative")}>ต่อไป: ประโยคปฏิเสธ <ChevronRight /></button></div>}
    {step === "negative" && <div className="lesson-panel">{title("NEGATIVE SENTENCE", "ประโยคปฏิเสธ", "ใช้ do not (don't) หรือ does not (doesn't) นำหน้ากริยาหลัก")}<div className="formula"><b>speak</b><span>→</span><b>do not speak</b><span>(he/she/it)</span><b>does not speak</b></div><Table headers={["Subject", "Auxiliary", "Formal", "Spoken"]} rows={negatives} audioColumns={[0,1,2,3]} /><h3>ตัวอย่างครบชุด</h3><Grid items={negativeExamples} /><div className="lesson-tip"><b>อย่าสับสน</b><p>เมื่อใช้ does/doesn't กริยาหลักไม่ต้องเติม -s แล้ว: He doesn't speak (ไม่ใช่ He doesn't speaks)</p></div><button className="primary lesson-next" onClick={() => go("yesno")}>ต่อไป: คำถาม Yes / No <ChevronRight /></button></div>}
    {step === "yesno" && <div className="lesson-panel">{title("YES / NO QUESTIONS", "คำถามใช่หรือไม่", "ย้าย Do/Does หรือ Verb to be มาหน้าประโยค")}<div className="transform-list"><article><span>You are Finnish.</span><b>→</b><English text="Are you Finnish?" /></article><article><span>She lives in Finland.</span><b>→</b><English text="Does she live in Finland?" /></article><article><span>You do not speak English.</span><b>→</b><English text="Do you not speak English?" /></article></div><h3>ภาษาพูด: ใช้รูปย่อ</h3><Grid items={["Are you Finnish?", "Does she live in Finland?", "Don't you speak English?"]} /><h3>ตอบด้วยกริยาช่วย</h3><div className="answer-pairs"><article><English text="Do you live in Helsinki?" /><p><b>Yes:</b> I do. · <b>No:</b> I don't.</p></article><article><English text="Do you speak English?" /><p><b>Yes:</b> We do. · <b>No:</b> We don't.</p></article></div><div className="lesson-tip"><b>Intonation</b><p>คำถาม Yes/No ในภาษาอังกฤษมักลงท้ายด้วยเสียงสูง (rising intonation)</p></div><button className="primary lesson-next" onClick={() => go("words")}>ต่อไป: คำแสดงคำถาม <ChevronRight /></button></div>}
    {step === "words" && <div className="lesson-panel">{title("QUESTION WORDS", "คำแสดงคำถาม", "โครงสร้าง: Question Word + Auxiliary + Subject + Verb")}<Table headers={["Word", "Meaning", "Example", "Answer"]} rows={questionWords} audioColumns={[0,2,3]} /><div className="lesson-tip"><b>What vs. Which</b><p>What ใช้ถามทั่วไป · Which ใช้ถามเมื่อมีตัวเลือกจำกัด</p></div><div className="formula"><b>Who</b><span>+</span><b>are</b><span>+</span><b>you?</b></div><button className="primary lesson-next" onClick={() => go("introduce")}>ต่อไป: แนะนำตัว <ChevronRight /></button></div>}
    {step === "introduce" && <div className="lesson-panel">{title("INTRODUCING YOURSELF", "แนะนำตัว ประเทศ สัญชาติ ภาษา", "ชื่อประเทศและสัญชาติในภาษาอังกฤษต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่เสมอ")}<div className="profile-example"><span>PH</span><div><English text="I am Phawit." /><English text="I am Thai." /><English text="I am from Bangkok, Thailand." /><English text="I speak Thai." /><English text="I speak Thai and English." /><English text="My native language is Thai." /></div></div><h3>สามคำถามหลัก</h3><div className="answer-pairs"><article><English text="Where are you from?" /><p>I am from + ประเทศ/เมือง</p></article><article><English text="What is your nationality?" /><p>I am + สัญชาติ</p></article><article><English text="What language do you speak?" /><p>I speak + ภาษา</p></article></div><Table headers={["Country", "Nationality", "Language"]} rows={countries} audioColumns={[0,1,2]} /><h3>ตัวอย่างการแนะนำตัว</h3><div className="intro-people"><article><b>Pedro</b><English text="I am Pedro. I am Brazilian. I am from São Paulo, Brazil. I speak Portuguese." /></article><article><b>Olga</b><English text="My name is Olga. I am Russian. I am from St. Petersburg, Russia. I speak Russian. I do not speak English." /></article><article><b>Alex</b><English text="I am Alex. I am South African. I am from Johannesburg, South Africa. My native language is English. I also speak a little Spanish." /></article></div><button className="primary lesson-next" onClick={() => go("exercises")}>ต่อไป: เฉลยแบบฝึกหัด <ChevronRight /></button></div>}
    {step === "exercises" && <div className="lesson-panel">{title("EXERCISES", "แบบฝึกหัดพร้อมเฉลย", "ทบทวนกฎคำนำหน้า การผันกริยา ปฏิเสธ และคำถามครบทุกชุด")}<h3>Exercise 6A · เติม in ให้ชื่อเมือง</h3><Grid items={cityExercise} /><h3>Exercise 6B · เติม a/an ให้คำอาหาร</h3><Grid items={foodExercise} /><h3>Exercise 16 · จับคู่ประธานกับกริยา</h3><Grid items={matching} /><h3>Exercise 20–21 · ประโยคปฏิเสธ</h3><Grid items={negativeExamples} /><h3>Exercise 23–27 · คำถามและคำตอบ</h3><Grid items={comprehensive} /><div className="lesson-tip"><b>ลำดับคิด</b><p>หา subject → ผันกริยา (เติม -s ถ้าเป็น he/she/it) → เลือก auxiliary (do/does) → ถ้าเป็นคำถามย้าย auxiliary ไว้หน้า</p></div><button className="primary lesson-next" onClick={() => go("time")}>ต่อไป: วันและเวลา <ChevronRight /></button></div>}
    {step === "time" && <div className="lesson-panel">{title("DAYS · TIME", "วันในสัปดาห์และเวลา", "เมื่อหมายถึง “ในวัน…” ใช้บุพบท on")}<div className="day-grid">{days.map(([base, form, en]) => <article key={base}><English text={base} /><English text={form} /><p>{en}</p></article>)}</div><Grid items={["What day is it today?", "When is the course?", "Have a nice weekend"]} /><h3>อดีต · ปัจจุบัน · อนาคต</h3><div className="useful-grid">{timeWords.map(([fi, en]) => <article key={fi}><English text={fi} /><span>{en}</span></article>)}</div><div className="lesson-tip"><b>จำคำว่า week</b><p>last week = สัปดาห์ที่แล้ว · this week = สัปดาห์นี้ · next week = สัปดาห์หน้า</p></div><button className="primary lesson-next" onClick={() => go("check")}>ทำแบบทดสอบ 15 ข้อ <ChevronRight /></button></div>}
    {step === "check" && <div className="lesson-panel quiz-panel"><span className="kicker">KNOWLEDGE CHECK</span><h2>ทบทวน Lesson 3</h2>{finished ? <div className="lesson-result"><span>✓</span><div><p>จบบทเรียนแล้ว</p><b>{score} / {quiz.length}</b><p>{score >= 12 ? "Great job! พร้อมนำไปใช้จริง" : "Good try! กลับไปทบทวนจุดที่ยังสับสนได้"}</p></div></div> : <><p>คำถาม {index + 1} จาก {quiz.length}</p><h3>{q[0]}</h3><div className="lesson-answers">{q[1].map(choice => <button key={choice} disabled={!!answer} className={answer ? choice === q[2] ? "correct" : choice === answer ? "wrong" : "" : ""} onClick={() => { setAnswer(choice); if (choice === q[2]) setScore(s => s + 1); }}>{choice}</button>)}</div>{answer && <><div className="lesson-tip"><b>{answer === q[2] ? "Correct! ถูกต้อง" : "Incorrect"}</b><p>{q[3]}</p></div><button className="primary lesson-next" onClick={() => { if (index === quiz.length - 1) { setFinished(true); finish("check"); } else { setIndex(i => i + 1); setAnswer(""); window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); } }}>คำถามถัดไป <ChevronRight /></button></>}</>}</div>}
  </section>;
}