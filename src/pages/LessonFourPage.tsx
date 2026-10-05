import { CSSProperties, ReactNode, useState } from "react";
import { Check, ChevronRight, MessageCircle, Volume2 } from "lucide-react";
import { ttsService } from "../services/ttsService";

type Step = "start" | "spoken" | "harjoitus" | "negative" | "conjugation" | "dialogues" | "translation" | "homework" | "check";
const steps: { id: Step; label: string }[] = [
  { id: "start", label: "Start" }, { id: "spoken", label: "Spoken" }, { id: "harjoitus", label: "Exercises" },
  { id: "negative", label: "Negative" }, { id: "conjugation", label: "Conjugation" }, { id: "dialogues", label: "Dialogues" },
  { id: "translation", label: "Translation" }, { id: "homework", label: "Homework" }, { id: "check", label: "Check" },
];

const spokenNumbers = [
  ["one", "one", "1"], ["two", "two", "2"], ["three", "three", "3"], ["four", "four", "4"],
  ["five", "five", "5"], ["six", "six", "6"], ["seven", "seven", "7"], ["eight", "eight", "8"],
  ["nine", "nine", "9"], ["ten", "ten", "10"], ["eleven", "eleven", "11"], ["twelve", "twelve", "12"],
  ["twenty", "twenty", "20"], ["twenty-one", "twenty-one", "21"], ["one hundred", "hundred", "100"], ["one thousand", "thousand", "1000"],
];
const writtenDialogue = [
  ["Seller", "Hello."], ["Pedro", "Hello. How much is the ice cream?"],
  ["Seller", "One scoop costs 3 euros and two scoops cost 5 euros."], ["Pedro", "Okay. I will take two scoops of chocolate then."],
  ["Seller", "Okay. And for you?"], ["Alex", "I will also take two scoops: vanilla and strawberry."],
  ["Seller", "Alright. Anything else?"], ["Pedro", "No thanks."],
  ["Seller", "Here you go. 10 euros total. Is this together?"], ["Alex", "Yes, it is. I will pay for these. By card, please."],
  ["Seller", "Thank you. Do you need a receipt?"], ["Alex", "No thanks."],
];
const spokenDialogue = [
  ["Seller", "Hi."], ["Pedro", "Hi. How much is the ice cream?"],
  ["Seller", "One scoop's 3 euros and two scoops are 5 euros."], ["Pedro", "Okay. I'll take two scoops of chocolate then."],
  ["Seller", "Okay. And for you?"], ["Alex", "I'll take two scoops too: vanilla and strawberry."],
  ["Seller", "Alright. Anything else?"], ["Pedro", "No thanks."],
  ["Seller", "Here. 10 euros total. Is this together?"], ["Alex", "Yeah, it is. I'll pay. By card, please."],
  ["Seller", "Thanks. Need a receipt?"], ["Alex", "No thanks."],
];
const spokenDiffs = [
  ["ice cream", "ice cream"], ["One", "One"], ["euros", "euros"], ["scoops", "scoops"], ["I", "I'll"], ["then", "then"],
  ["for you", "for you"], ["I also", "I'll... too"], ["Is it", "Is it"], ["these", "these"], ["Yes", "Yeah"], ["Do you need", "Need"], ["thank you", "thanks"],
];

const harjoitus12 = [
  ["He ___ from Germany", "to be", "is"], ["They do not ___ English", "to speak", "speak"],
  ["___ in Turku?", "to live", "Do you live"], ["When does the course ___", "to begin", "begin"],
  ["___ the sauna?", "to love", "Do you love"], ["In the evening we often ___ TV", "to watch", "watch"],
  ["What ___ your surname?", "to be", "is"], ["They ___ a lot of food on the weekend", "to buy", "buy"],
  ["Why ___ you not ___?", "to dance", "do / dance"], ["He does not ___ often", "to travel", "travel"],
];
const harjoitus14 = [
  ["I live in Helsinki.", "I do not live in Helsinki."], ["We go to the bus stop.", "We do not go to the bus stop."],
  ["Elina speaks Spanish.", "Elina does not speak Spanish."], ["You are Russian.", "You are not Russian."],
  ["Giuseppe and Manuela buy ice cream.", "Giuseppe and Manuela do not buy ice cream."],
  ["You sit in the park.", "You do not sit in the park."], ["The ice cream costs 3 euros.", "The ice cream does not cost 3 euros."],
];

const negativeRule = [
  ["I", "do not", "I do not speak"], ["you", "do not", "you do not speak"], ["he/she", "does not", "he/she does not speak"],
  ["we", "do not", "we do not speak"], ["you", "do not", "you do not speak"], ["they", "do not", "they do not speak"],
];

const newVerbs = [
  ["live", "to live / อาศัยอยู่", "live, lives"],
  ["laugh", "to laugh / หัวเราะ", "laugh, laughs"],
  ["save", "to save / เก็บออม", "save, saves"],
  ["buy", "to buy / ซื้อ", "buy, buys"],
  ["watch", "to watch / ดู", "watch, watches"],
  ["sit", "to sit / นั่ง", "sit, sits"],
  ["love", "to love / รัก", "love, loves"],
  ["dance", "to dance / เต้นรำ", "dance, dances"],
  ["travel", "to travel / เดินทาง", "travel, travels"],
  ["begin", "to begin / เริ่มต้น", "begin, begins"],
  ["seek", "to seek / ค้นหา", "seek, seeks"],
  ["sing", "to sing / ร้องเพลง", "sing, sings"],
  ["stand", "to stand / ยืน", "stand, stands"],
  ["pay", "to pay / จ่าย", "pay, pays"],
];
const conjugation30 = [
  ["I am at the course.", "to be"], ["He lives in Finland.", "to live"], ["We do not speak Swedish.", "to speak"],
  ["You laugh a lot.", "to laugh"], ["You save money.", "to save"], ["You do not buy much food.", "to buy"],
  ["I do not watch TV.", "to watch"], ["He sits over there.", "to sit"], ["You love English.", "to love"],
  ["You ask something.", "to ask"], ["He does not speak French.", "to speak"], ["We buy coffee.", "to buy"],
  ["You are at work.", "to be"], ["We do not save money.", "to save"], ["I look for a friend.", "to seek"],
  ["Today is Thursday.", "to be"], ["I do not dance tango.", "to dance"], ["They pay for coffee.", "to pay"],
  ["Tomorrow is Friday.", "to be"], ["They sit at home.", "to sit"], ["You do not live in Germany.", "to live"],
  ["He does not speak Italian.", "to speak"], ["You love the sauna.", "to love"], ["We do not sing.", "to sing"],
  ["You watch a lot of TV.", "to watch"], ["The teacher stands there.", "to stand"], ["We do not dance salsa.", "to dance"],
  ["He asks a lot at the course.", "to ask"], ["They do not live in Hungary.", "to live"], ["I do not love karaoke.", "to love"],
];

const pizzaDialogue = [
  ["Seller", "Good day."], ["Customer", "Good day. How much is the salami pizza?"],
  ["Seller", "It costs 7 euros."], ["Customer", "Aha. And how much is the ham pizza?"],
  ["Seller", "The ham pizza costs 8 euros."], ["Customer", "Alright. I would like 2 salami pizzas, please."],
  ["Seller", "Okay. Anything else?"], ["Customer", "No thanks."],
  ["Seller", "That is 14 euros, please."], ["Customer", "Here you go."],
  ["Seller", "Thank you."], ["Customer", "Thank you. Goodbye."], ["Seller", "Goodbye."],
];
const iceCreamDialogue = [
  ["Seller", "Hi!"], ["Customer", "Hi! How much is the ice cream?"],
  ["Seller", "One scoop is 3.50 and two scoops are 6 euros."], ["Customer", "Okay. One scoop of vanilla and one scoop of licorice."],
  ["Seller", "Alright. Anything else?"], ["Customer", "Yes, one coffee, please."],
  ["Seller", "8.50 total. By cash or card?"], ["Customer", "By card."],
  ["Seller", "Okay. Here you go."], ["Customer", "Thanks."],
  ["Seller", "Okay. Do you need a receipt?"], ["Customer", "No thanks."],
  ["Seller", "Thanks. Bye!"], ["Customer", "Thank you, bye bye."],
];
const dialogueVocab = [
  ["salami pizza", "ซาลามิพิซซ่า"], ["ham pizza", "พิซซ่าแฮม"], ["I would like", "อยากได้ / I would like"],
  ["Anything else?", "รับอย่างอื่นอีกไหม"], ["licorice", "ชะเอมเทศ (licorice)"], ["coffee", "กาแฟ (coffee)"],
  ["by cash", "ด้วยเงินสด (with cash)"], ["by cash or card?", "เงินสดหรือบัตร?"],
];

const translationEn = `สวัสดี! ฉันชื่อแอนนา ฉันเป็นนักเรียน อายุ 18 ปี ฉันเป็นคนฟินแลนด์ ฉันมาจากฟินแลนด์ ฉันพูดภาษาฟินแลนด์ สวีเดน และอังกฤษ นี่คือสัปดาห์ของฉัน:
วันจันทร์ฉันทำงาน
วันอังคารฉันดูโทรทัศน์
วันพุธฉันเรียนเต้นรำ
วันพฤหัสบดีฉันมักนั่งในสวนสาธารณะ ฉันรักฤดูร้อน
วันศุกร์ฉันซื้ออาหาร ฉันซื้อไม่มาก ฉันเก็บออมเงิน
วันเสาร์ฉันร้องคาราโอเกะและหัวเราะมาก
วันอาทิตย์ฉันอยู่บ้าน บางครั้งฉันเดินทางในวันหยุดสุดสัปดาห์`;
const translationFi = [
  "Hello! My name is Anna. I am a student. I am 18 years old. I am a Finn, I am from Finland. I speak Finnish, Swedish and English. This is my week:",
  "1. I am at work on Monday.", "2. I watch TV on Tuesday.", "3. I am in a dance class on Wednesday.",
  "4. I often sit in the park on Thursday. I love summer a lot.", "5. On Friday I buy food. I do not buy much food. I save money.",
  "6. I sing karaoke and laugh a lot on Saturday.", "7. I am at home on Sunday. I sometimes travel on the weekend.",
];
const translationVocab = [
  ["at work", "at work / ที่ทำงาน"], ["TV", "TV / โทรทัศน์"], ["dance class", "dance class / คอร์สเต้นรำ"],
  ["often", "often / บ่อยๆ"], ["summer", "summer / ฤดูร้อน"], ["food", "food / อาหาร"],
  ["a lot", "a lot / มาก"], ["karaoke", "karaoke"], ["at home", "at home / ที่บ้าน"], ["sometimes", "sometimes / บางครั้ง"],
];

const homeworkItems = [
  ["1", "Learn spoken numbers (page 34)", "เรียนรู้ตัวเลขภาษาพูด (หน้า 34)", ""],
  ["2", "Compare written vs spoken kiosk text (page 33)", "เปรียบเทียบภาษาเขียนกับภาษาพูดจากข้อความร้านไอศกรีม", ""],
  ["3", "Arrange dialogues (from materials)", "จัดเรียงบทสนทนา", ""],
  ["4", "Grammar exercises (from materials)", "แบบฝึกหัดไวยากรณ์", ""],
  ["5", "Review the English lesson slides", "ทบทวนสไลด์บทเรียนอังกฤษ", "/lesson1/lesson-1-2026.pptx"],
  ["6", "English vocabulary", "ฝึกคำศัพท์อังกฤษ–ไทย", "/lesson1/suomen-mestari-1-kappale-1.pdf"],
  ["7", "Translate text to English (from materials)", "แปลข้อความเป็นภาษาอังกฤษ", ""],
];

const quiz = [
  [
    "What is the third-person singular of 'to live'?",
    [
      "lives",
      "live",
      "living"
    ],
    "lives",
    "สำหรับประธาน he, she, it กริยาต้องเติม -s หรือ -es"
  ],
  [
    "Which is the correct negative form for 'I'?",
    [
      "I do not",
      "I does not",
      "I am not"
    ],
    "I do not",
    "ใช้ do not กับประธาน I, you, we, they"
  ],
  [
    "Which sentence is correct?",
    [
      "He does not speak.",
      "He do not speak.",
      "He not speak."
    ],
    "He does not speak.",
    "ใช้ does not กับประธาน he, she, it"
  ],
  [
    "'I am at work' in Thai means?",
    [
      "ฉันอยู่ที่ทำงาน",
      "ฉันทำงาน",
      "ฉันไปทำงาน"
    ],
    "ฉันอยู่ที่ทำงาน",
    "at work หมายถึงอยู่ที่สถานที่ทำงาน"
  ],
  [
    "'I would like' is used for?",
    [
      "Polite requests",
      "Commands",
      "Questions"
    ],
    "Polite requests",
    "ใช้ would like เพื่อแสดงความสุภาพในการสั่งอาหารหรือขอสิ่งของ"
  ],
  [
    "'Anything else?' means?",
    [
      "รับอย่างอื่นอีกไหม",
      "ขอบคุณ",
      "เท่าไหร่"
    ],
    "รับอย่างอื่นอีกไหม",
    "เป็นประโยคที่พนักงานถามเพื่อดูว่าลูกค้าต้องการสั่งอะไรเพิ่มหรือไม่"
  ],
  [
    "'I save money' means?",
    [
      "ฉันเก็บเงิน",
      "ฉันใช้เงิน",
      "ฉันหาเงิน"
    ],
    "ฉันเก็บเงิน",
    "save ในบริบทนี้หมายถึงการเก็บออมเงิน"
  ],
  [
    "'I watch TV' in the negative form is?",
    [
      "I do not watch TV.",
      "I not watch TV.",
      "I does not watch TV."
    ],
    "I do not watch TV.",
    "ปฏิเสธของ I ใช้ do not ตามด้วยกริยาช่องปกติ"
  ],
  [
    "'They travel' in the negative form is?",
    [
      "They do not travel.",
      "They does not travel.",
      "They not travel."
    ],
    "They do not travel.",
    "ใช้ do not สำหรับประธานพหูพจน์อย่าง they"
  ],
  [
    "Which sentence correctly uses the preposition 'in'?",
    [
      "I sit in the park.",
      "I sit on the park.",
      "I sit at the park."
    ],
    "I sit in the park.",
    "ใช้ in กับสถานที่ที่เป็นพื้นที่ปิดหรือบริเวณกว้าง เช่น park"
  ],
["เติม: She ___ coffee every morning.", ["drinks", "drink", "drinking"], "drinks", "she เป็นเอกพจน์บุรุษที่ 3 กริยาเติม -s"],
["เติม: He ___ TV at night.", ["watches", "watch", "watchs"], "watches", "watch ลงท้าย ch จึงเติม -es"],
["เติม: She ___ English.", ["studies", "studys", "study"], "studies", "study ลงท้ายพยัญชนะ + y เปลี่ยน y เป็น ies"],
["เติม: He ___ football.", ["plays", "plaies", "play"], "plays", "play ลงท้ายสระ + y เติม s ได้เลย"],
["เติม: They ___ in London.", ["live", "lives", "living"], "live", "they ใช้กริยารูปพื้นฐาน"],
["เติม: ___ she work here?", ["Does", "Do", "Is"], "Does", "ใช้ Does กับ she และกริยาหลัก work รูปพื้นฐาน"],
["เติม: ___ they speak Thai?", ["Do", "Does", "Are"], "Do", "ใช้ Do กับ they เพื่อถาม Present Simple"],
["เติม: He does not ___ meat.", ["eat", "eats", "eating"], "eat", "หลัง does not ใช้กริยารูปพื้นฐาน"],
["รูปย่อของ does not คืออะไร?", ["doesn't", "don't", "isn't"], "doesn't", "does not ย่อเป็น doesn't"],
["รูปย่อของ I will คืออะไร?", ["I'll", "I'm", "I'd"], "I'll", "I will ย่อเป็น I'll"],
["รูปย่อของ we are คืออะไร?", ["we're", "we've", "we'll"], "we're", "we are ย่อเป็น we're"],
["คำว่า receipt หมายถึงอะไร?", ["ใบเสร็จ", "เมนู", "ช้อน"], "ใบเสร็จ", "receipt คือใบเสร็จรับเงิน"],
["คำว่า How much ถามเรื่องใดในร้านค้า?", ["ราคา", "สถานที่", "เวลา"], "ราคา", "How much is it? ถามว่าสิ่งนี้ราคาเท่าไร"],
["ฉันจ่ายด้วยบัตร ภาษาอังกฤษคืออะไร?", ["I pay by card.", "I pay at card.", "I pay from card."], "I pay by card.", "ใช้ by card สำหรับการชำระด้วยบัตร"],
["เติม: I work ___ Monday.", ["on", "in", "at"], "on", "ใช้ on กับชื่อวัน"],
["เติม: The class starts ___ nine.", ["at", "on", "in"], "at", "ใช้ at กับเวลาที่ระบุแน่นอน"],
["เติม: We travel ___ summer.", ["in", "on", "at"], "in", "ใช้ in กับฤดูกาล"],
["รูปอดีตของ go คืออะไร?", ["went", "goed", "goes"], "went", "go เป็นกริยาไม่ปกติ รูปอดีตคือ went"],
["รูปอดีตของ see คืออะไร?", ["saw", "seed", "sees"], "saw", "see เป็นกริยาไม่ปกติ รูปอดีตคือ saw"],
["twenty-one เท่ากับจำนวนใด?", ["21", "12", "20"], "21", "twenty-one คือ 20 + 1"],
["คำตอบรับ Are you ready? คืออะไร?", ["Yes, I am.", "Yes, I do.", "Yes, I have."], "Yes, I am.", "ตอบด้วย be ตามคำถาม โดยเปลี่ยน you เป็น I"]
] as const;

function English({ text, children }: { text: string; children?: ReactNode }) { return <button type="button" className="finnish-speak" onClick={() => ttsService.speak(text)} aria-label={`Listen to ${text}`}>{children ?? text}<Volume2 size={13} /></button>; }
function Grid({ items }: { items: string[] }) { return <div className="lesson3-chip-grid">{items.map(item => <English key={item} text={item} />)}</div>; }
function Table({ headers, rows, audioColumns }: { headers: string[]; rows: string[][]; audioColumns: number[] }) { return <div className="lesson3-table" style={{ "--columns": headers.length } as CSSProperties}><div className="table-head">{headers.map(h => <b key={h}>{h}</b>)}</div>{rows.map((row, i) => <div key={`${row[0]}-${i}`}>{row.map((cell, j) => audioColumns.includes(j) ? <English key={j} text={cell} /> : <span key={j}>{cell}</span>)}</div>)}</div>; }
function Reveal({ label, children }: { label: string; children: ReactNode }) { const [open, setOpen] = useState(false); return <div className="lesson-tip"><b style={{ cursor: "pointer" }} onClick={() => setOpen(!open)}>{open ? "▼" : "▶"} {label}</b>{open && <div style={{ marginTop: 8 }}>{children}</div>}</div>; }

export function LessonFourPage() {
  const [step, setStep] = useState<Step>("start");
  const [completed, setCompleted] = useState<Step[]>(() => { try { return JSON.parse(localStorage.getItem("sisu-english:lesson4:v1") || "[]"); } catch { return []; } });
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState(""), [score, setScore] = useState(0), [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const finish = (id: Step) => { const next = [...new Set([...completed, id])]; setCompleted(next); localStorage.setItem("sisu-english:lesson4:v1", JSON.stringify(next)); };
  const go = (id: Step) => { finish(step); setStep(id); setRevealed({}); window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); };
  const q = quiz[index], progress = Math.round(completed.length / steps.length * 100);
  const title = (kicker: string, heading: string, body: string) => <div className="lesson-title"><div><span className="kicker">{kicker}</span><h2>{heading}</h2><p>{body}</p></div><MessageCircle /></div>;
  const reveal = (i: number) => setRevealed(r => ({ ...r, [i]: !r[i] }));
  return <section className="page lesson-page lesson-three">
    <div className="lesson-hero"><div><span className="kicker">LESSON 4 · ENGLISH GRAMMAR</span><h1>Spoken English & Practice</h1><p>Spoken English, Numbers, Negatives, Verb Conjugation, and Dialogues</p></div><div className="lesson-progress"><b>{progress}%</b><span>complete</span><i><em style={{ width: `${progress}%` }} /></i></div></div>
    <div className="lesson-tabs" role="tablist">{steps.map((s, i) => <button role="tab" aria-selected={step === s.id} className={step === s.id ? "active" : completed.includes(s.id) ? "done" : ""} onClick={() => setStep(s.id)} key={s.id}><span>{completed.includes(s.id) ? <Check size={14} /> : i + 1}</span>{s.label}</button>)}</div>

    {step === "start" && <div className="lesson-panel intro-panel"><div className="lesson-number">04</div><span className="kicker">ENGLISH–THAI ADAPTED LEARNING</span><h2>ภาษาอังกฤษและแบบฝึกหัด</h2><p>ตัวเลขภาษาพูด · ประโยคปฏิเสธ · การผันกริยา · บทสนทนาซื้อของ · แปลอังกฤษ-ไทย</p><div className="objectives"><div><span>01</span><p><b>Spoken English</b>เรียนรู้การย่อคำในภาษาพูด</p></div><div><span>02</span><p><b>Verb Conjugation</b>ฝึกผันกริยา Present Simple</p></div><div><span>03</span><p><b>Dialogues</b>ฝึกบทสนทนาในชีวิตประจำวัน</p></div></div><div className="lesson-tip"><b>Test 1 — Tuesday 29.09</b><p>เตรียมสอบ Test 1 ทบทวนเนื้อหาจาก Lesson 1-4</p></div><button className="primary lesson-next" onClick={() => go("spoken")}>เริ่มเรียน <ChevronRight /></button></div>}

    {step === "spoken" && <div className="lesson-panel">{title("SPOKEN ENGLISH", "ตัวเลขภาษาพูด", "ตัวเลขในภาษาพูดมักย่อให้สั้นลง")}
      <Table headers={["Written", "Spoken", "Number"]} rows={spokenNumbers} audioColumns={[0, 1]} />
      <div className="lesson-tip"><b>หลักการย่อ</b><p>ภาษาพูดมักมีการตัดเสียงหรือใช้คำย่อเพื่อให้สื่อสารได้เร็วขึ้น</p></div>

      <h3>Kiosk Dialogue — เปรียบเทียบภาษาเขียนกับภาษาพูด</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><h4>Written</h4>{writtenDialogue.map(([who, line], i) => <div key={`w${i}`} style={{ marginBottom: 4 }}><b>{who}:</b> <English text={line} /></div>)}</div>
        <div><h4>Spoken</h4>{spokenDialogue.map(([who, line], i) => <div key={`s${i}`} style={{ marginBottom: 4 }}><b>{who}:</b> <English text={line} /></div>)}</div>
      </div>
      <button className="primary lesson-next" onClick={() => go("harjoitus")}>ต่อไป: แบบฝึกหัด <ChevronRight /></button></div>}

    {step === "harjoitus" && <div className="lesson-panel">{title("EXERCISES", "แบบฝึกหัด", "ฝึกเติมกริยาและประโยคปฏิเสธ")}
      <h3>Exercise 1 — เติมกริยาที่ถูกต้อง</h3>
      {harjoitus12.map(([sentence, hint, ans], i) => <div key={`h12-${i}`} style={{ marginBottom: 8 }}>
        <p><b>{i + 1}.</b> {sentence} <span style={{ color: "#888" }}>({hint})</span></p>
        <button type="button" className={`finnish-speak ${revealed[i] ? "" : ""}`} onClick={() => reveal(i)} style={{ cursor: "pointer" }}>{revealed[i] ? <><b style={{ color: "var(--color-success)" }}>{ans}</b></> : "แสดงคำตอบ"}</button>
      </div>)}
      <button className="primary lesson-next" onClick={() => go("negative")}>ต่อไป: ประโยคปฏิเสธ <ChevronRight /></button></div>}

    {step === "negative" && <div className="lesson-panel">{title("NEGATIVE SENTENCES", "ประโยคปฏิเสธ", "Subject + do/does not + verb")}
      <div className="formula"><b>Subject</b><span>+</span><b>do not / does not</b><span>+</span><b>verb</b></div>
      <Table headers={["Subject", "Negative", "Example"]} rows={negativeRule} audioColumns={[0, 2]} />
      <div className="lesson-tip"><b>กฎสำคัญ</b><p>ใช้ <strong>does not</strong> กับ he, she, it และ <strong>do not</strong> กับ I, you, we, they</p></div>
      <button className="primary lesson-next" onClick={() => go("conjugation")}>ต่อไป: การผันกริยา <ChevronRight /></button></div>}

    {step === "conjugation" && <div className="lesson-panel">{title("VERB CONJUGATION", "การผันกริยา", "ฝึกผันกริยา Present Simple")}
      <div className="lesson3-table" style={{ "--columns": 3 } as CSSProperties}><div className="table-head"><b>Verb</b><b>Meaning</b><b>Conjugation</b></div>{newVerbs.map(([verb, meaning, forms], i) => <div key={i}><English text={verb} /><span>{meaning}</span><span style={{ fontSize: "0.85em" }}>{forms}</span></div>)}</div>
      <button className="primary lesson-next" onClick={() => go("dialogues")}>ต่อไป: บทสนทนา <ChevronRight /></button></div>}

    {step === "dialogues" && <div className="lesson-panel">{title("DIALOGUES", "บทสนทนา", "ฝึกบทสนทนาจริง")}
      <h3>Pizza Ordering</h3>
      <div className="intro-people">{pizzaDialogue.map(([who, line], i) => <div key={`p-${i}`} style={{ marginBottom: 4 }}><b>{who}:</b> <English text={line} /></div>)}</div>
      <button className="primary lesson-next" onClick={() => go("translation")}>ต่อไป: แปลภาษา <ChevronRight /></button></div>}

    {step === "translation" && <div className="lesson-panel">{title("TRANSLATION", "แปลภาษา", "แปลจากอังกฤษเป็นไทย")}
      <div style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12, whiteSpace: "pre-line", marginBottom: 16 }}>{translationEn}</div>
      <Reveal label="เปิดดูคำแปล">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{translationFi.map((line, i) => <English key={i} text={line} />)}</div>
      </Reveal>
      <button className="primary lesson-next" onClick={() => go("homework")}>ต่อไป: การบ้าน <ChevronRight /></button></div>}

    {step === "homework" && <div className="lesson-panel">{title("HOMEWORK", "การบ้าน", "ทบทวนเนื้อหาบทที่ 4")}
      {homeworkItems.map(([id, task, th, link]) => <div key={id} style={{ marginBottom: 16, padding: 16, background: "var(--color-surface)", borderRadius: 12 }}>
        <p><b>{id}.</b> {task}</p><p style={{ color: "#888" }}>{th}</p>
        {link && <a href={link} target="_blank" rel="noopener noreferrer">Resource</a>}
      </div>)}
      <button className="primary lesson-next" onClick={() => go("check")}>ทำแบบทดสอบ <ChevronRight /></button></div>}

    {step === "check" && <div className="lesson-panel quiz-panel"><h2>ทบทวนบทที่ 4</h2>{finished ? <div className="lesson-result"><b>{score} / {quiz.length}</b></div> : <><p>คำถาม {index + 1}</p><h3>{q[0]}</h3><div className="lesson-answers">{q[1].map(choice => <button key={choice} onClick={() => { setAnswer(choice); if (choice === q[2]) setScore(s => s + 1); }}>{choice}</button>)}</div>{answer && <button className="primary" onClick={() => { if (index === quiz.length - 1) setFinished(true); else { setIndex(i => i + 1); setAnswer(""); } }}>ถัดไป</button>}</>}</div>}
  </section>;
}