import { useState, type ReactNode } from "react";
import { CalendarDays, Check, ChevronRight, Hash, MessageCircle, Volume2 } from "lucide-react";
import { ttsService } from "../services/ttsService";

type Step = "start" | "be" | "time" | "numbers" | "sentences" | "check";
const steps: { id: Step; label: string }[] = [
  { id: "start", label: "Start" }, { id: "be", label: "Be" },
  { id: "time", label: "Time" }, { id: "numbers", label: "Numbers" },
  { id: "sentences", label: "Sentences" }, { id: "check", label: "Check" },
];
const olla = [
  ["I", "am", "I'm", "ฉัน เป็น/อยู่/คือ"], ["You", "are", "you're", "คุณ เป็น/อยู่/คือ"],
  ["He / She / It", "is", "he's / she's / it's", "เขา/หล่อน / มัน"], ["We", "are", "we're", "พวกเรา เป็น/อยู่/คือ"],
  ["You", "are", "you're", "พวกคุณ เป็น/อยู่/คือ"], ["They", "are", "they're", "พวกเขา / พวกมัน"],
];
const days = [
  ["Monday", "on Monday", "วันจันทร์"], ["Tuesday", "on Tuesday", "วันอังคาร"],
  ["Wednesday", "on Wednesday", "วันพุธ"], ["Thursday", "on Thursday", "วันพฤหัสบดี"],
  ["Friday", "on Friday", "วันศุกร์"], ["Saturday", "on Saturday", "วันเสาร์"],
  ["Sunday", "on Sunday", "วันอาทิตย์"], ["weekend", "on the weekend", "ช่วงวันหยุดสุดสัปดาห์"],
];
const timeline = [["the day before yesterday", "เมื่อวานซืน"], ["yesterday", "เมื่อวาน"], ["today", "วันนี้"], ["tomorrow", "พรุ่งนี้"], ["the day after tomorrow", "มะรืนนี้"]];
const numberGroups = [
  { title: "0–10", rows: [["0", "zero"], ["1", "one"], ["2", "two"], ["3", "three"], ["4", "four"], ["5", "five"], ["6", "six"], ["7", "seven"], ["8", "eight"], ["9", "nine"], ["10", "ten"]] },
  { title: "11–19 · Add -teen", rows: [["11", "eleven"], ["12", "twelve"], ["13", "thirteen"], ["19", "nineteen"]] },
  { title: "Tens · Add -ty", rows: [["20", "twenty"], ["30", "thirty"], ["50", "fifty"], ["90", "ninety"]] },
  { title: "Large numbers", rows: [["100", "one hundred"], ["200", "two hundred"], ["1,000", "one thousand"], ["2,000", "two thousand"], ["1 million", "one million"], ["1 billion", "one billion"], ["1 trillion", "one trillion"]] },
];
const sentences = [
  ["Who are you?", "คุณคือใคร?"], ["Are you okay?", "คุณโอเคไหม?"], ["I have a red shirt.", "ฉันมีเสื้อสีแดง"], ["Where is the boy?", "เด็กผู้ชายอยู่ที่ไหน?"],
  ["To school by bus!", "ไปโรงเรียนด้วยรถบัส!"], ["What time is it?", "กี่โมงแล้ว?"], ["I buy two loaves of bread.", "ฉันซื้อขนมปังสองก้อน"], ["It rains on Monday.", "ในวันจันทร์ฝนตก"],
  ["This is my family.", "นี่คือครอบครัวของฉัน"], ["Come here!", "มานี่!"], ["Hi, how are you?", "สวัสดี สบายดีไหม?"], ["I was born in the spring.", "ฉันเกิดในฤดูใบไม้ผลิ"],
  ["My hand hurts.", "ฉันเจ็บมือ"], ["I am happy.", "ฉันมีความสุข / ฉันดีใจ"], ["Turn left.", "เลี้ยวซ้าย"], ["Next customer.", "ลูกค้าคิวถัดไป"],
  ["How much is this?", "สิ่งนี้ราคาเท่าไหร่?"], ["I like coffee.", "ฉันชอบกาแฟ"], ["I need toothpaste.", "ฉันต้องการยาสีฟัน"], ["Does this bus go to Oulu?", "รถบัสคันนี้ไปเมือง Oulu หรือเปล่า?"],
];
const basics = [["Hi / Hello!", "สวัสดี"], ["Welcome!", "ยินดีต้อนรับ"], ["Excuse me", "ขอโทษ / ขออนุญาต"], ["How are you?", "สบายดีไหม?"], ["Thanks, I am fine.", "ขอบคุณ ฉันสบายดี"], ["And you?", "แล้วคุณล่ะ?"], ["Nice to meet you!", "ยินดีที่ได้รู้จัก"], ["You too!", "ขอบคุณเช่นกัน"], ["How is it spelled?", "สะกดอย่างไร?"]];
const questions = [
  { prompt: "Complete the sentence: We ___ in Finland.", choices: ["are", "is", "am"], correct: "are", explain: "We are = พวกเราเป็น/อยู่" },
  { prompt: "What is the contraction for ‘I am’?", choices: ["I'm", "you're", "they're"], correct: "I'm", explain: "I + am = I'm" },
  { prompt: "How to say ‘on Wednesday’?", choices: ["Wednesday", "on Wednesday", "in Wednesday"], correct: "on Wednesday", explain: "Use 'on' for days of the week" },
  { prompt: "What does ‘the day after tomorrow’ mean?", choices: ["yesterday", "tomorrow", "the day after tomorrow"], correct: "the day after tomorrow", explain: "The day after tomorrow = มะรืนนี้" },
  { prompt: "How to write 20 in English?", choices: ["twelve", "twenty", "two hundred"], correct: "twenty", explain: "20 = twenty" },
  { prompt: "Which sentence is used to ask for price?", choices: ["What time is it?", "How much is this?", "Where is the boy?"], correct: "How much is this?", explain: "Means สิ่งนี้ราคาเท่าไหร่?" },
];
function English({ text, children }: { text: string; children?: ReactNode }) { return <button type="button" className="finnish-speak" onClick={() => ttsService.speak(text)} aria-label={`Listen to ${text}`}>{children ?? text}<Volume2 size={13} /></button>; }

export function LessonTwoPage() {
  const [step, setStep] = useState<Step>("start");
  const [completed, setCompleted] = useState<Step[]>(() => { try { return JSON.parse(localStorage.getItem("sisu-english:lesson2:v1") || "[]"); } catch { return []; } });
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState(""), [score, setScore] = useState(0), [finished, setFinished] = useState(false);
  const finish = (id: Step) => { const next = [...new Set([...completed, id])]; setCompleted(next); localStorage.setItem("sisu-english:lesson2:v1", JSON.stringify(next)); };
  const go = (id: Step) => { finish(step); setStep(id); window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); };
  const progress = Math.round((completed.length / steps.length) * 100), question = questions[index];
  return <section className="page lesson-page lesson-two">
    <div className="lesson-hero"><div><span className="kicker">LESSON 2 · CHAPTER 2</span><h1>Everyday English</h1><p>ภาษาอังกฤษที่ใช้ได้จริงในทุกวัน</p></div><div className="lesson-progress"><b>{progress}%</b><span>complete</span><i><em style={{ width: `${progress}%` }} /></i></div></div>
    <div className="lesson-tabs" role="tablist">{steps.map((s, i) => <button role="tab" aria-selected={step === s.id} className={step === s.id ? "active" : completed.includes(s.id) ? "done" : ""} onClick={() => setStep(s.id)} key={s.id}><span>{completed.includes(s.id) ? <Check size={14} /> : i + 1}</span>{s.label}</button>)}</div>
    {step === "start" && <div className="lesson-panel intro-panel"><div className="lesson-number">02</div><span className="kicker">EVERYDAY ENGLISH</span><h2>สร้างประโยคและพูดเรื่องชีวิตประจำวัน</h2><p>เรียนกริยา to be วัน เวลา ตัวเลข และประโยคสำเร็จรูปที่พบได้บ่อย พร้อมฟังเสียงภาษาอังกฤษได้ทุกตัวอย่าง</p><div className="objectives"><div><span>01</span><p><b>ผันกริยา to be</b>ใช้ทั้งรูปเต็มและรูปย่อ</p></div><div><span>02</span><p><b>บอกวันและเวลา</b>ใช้บุพบท on อย่างถูกต้อง</p></div><div><span>03</span><p><b>สื่อสารในชีวิตจริง</b>ฝึกตัวเลขและ 20 ประโยคสำคัญ</p></div></div><button className="primary lesson-next" onClick={() => go("be")}>เริ่มเรียนกริยา to be <ChevronRight /></button></div>}
    {step === "be" && <div className="lesson-panel"><div className="lesson-title"><div><span className="kicker">VERB · CONTRACTIONS</span><h2>To be — เป็น อยู่ คือ</h2><p>กริยาภาษาอังกฤษเปลี่ยนรูปตามประธาน และมักใช้รูปย่อในการพูด</p></div><MessageCircle /></div><div className="lesson-table lesson2-table"><div className="table-head"><b>ประธาน</b><b>รูปเต็ม</b><b>รูปย่อ</b><b>ความหมาย</b></div>{olla.map(([p, standard, spoken, th], i) => <div key={`${p}-${i}`}><English text={`${p} ${standard}`}>{p}</English><English text={standard} /><English text={spoken} /><span>{th}</span></div>)}</div><div className="lesson-tip"><b>จำง่าย</b><p><strong>I</strong> ใช้กับ <strong>am</strong>, <strong>He/She/It</strong> ใช้กับ <strong>is</strong>, และ <strong>You/We/They</strong> ใช้กับ <strong>are</strong></p></div><button className="primary lesson-next" onClick={() => go("time")}>ต่อไป: วันและเวลา <ChevronRight /></button></div>}
    {step === "time" && <div className="lesson-panel"><div className="lesson-title"><div><span className="kicker">DAYS · TIME</span><h2>วันและเวลา</h2><p>เมื่อต้องการพูด “ในวัน…” ให้ใช้บุพบท on นำหน้าชื่อวัน</p></div><CalendarDays /></div><div className="day-grid">{days.map(([base, form, th]) => <article key={base}><English text={form} /><English text={base} /><p>{th}</p></article>)}</div><h3 className="subhead">เส้นเวลา</h3><div className="timeline-grid">{timeline.map(([fi, th]) => <div key={fi}><English text={fi} /><span>{th}</span></div>)}</div><div className="useful-grid compact"><article><English text="last week" /><span>สัปดาห์ที่แล้ว</span></article><article><English text="this week" /><span>สัปดาห์นี้</span></article><article><English text="next week" /><span>สัปดาห์หน้า</span></article><article><English text="on weekdays" /><span>ในวันธรรมดา</span></article></div><button className="primary lesson-next" onClick={() => go("numbers")}>ต่อไป: ตัวเลข <ChevronRight /></button></div>}
    {step === "numbers" && <div className="lesson-panel"><div className="lesson-title"><div><span className="kicker">NUMBERS</span><h2>ตัวเลขภาษาอังกฤษ</h2><p>มองหาชิ้นส่วนซ้ำ: -teen สำหรับ 11–19 และ -ty สำหรับหลักสิบ</p></div><Hash /></div><div className="number-sections">{numberGroups.map(group => <section key={group.title}><h3>{group.title}</h3><div>{group.rows.map(([n, fi]) => <article key={n}><span>{n}</span><English text={fi} /></article>)}</div></section>)}</div><button className="primary lesson-next" onClick={() => go("sentences")}>ต่อไป: ประโยคใช้จริง <ChevronRight /></button></div>}
    {step === "sentences" && <div className="lesson-panel"><div className="lesson-title"><div><span className="kicker">EVERYDAY ENGLISH</span><h2>คำทักทายและประโยคใช้จริง</h2><p>กดฟัง แล้วพูดตามทั้งประโยค</p></div><MessageCircle /></div><h3 className="subhead">คำทักทายพื้นฐาน</h3><div className="useful-grid">{basics.map(([fi, th]) => <article key={fi}><English text={fi} /><span>{th}</span></article>)}</div><h3 className="subhead">20 ประโยคสำหรับชีวิตประจำวัน</h3><div className="sentence-list">{sentences.map(([fi, th], i) => <article key={fi}><b>{i + 1}</b><div><English text={fi} /><span>{th}</span></div></article>)}</div><button className="primary lesson-next" onClick={() => go("check")}>ทำแบบทดสอบ <ChevronRight /></button></div>}
    {step === "check" && <div className="lesson-panel quiz-panel"><span className="kicker">KNOWLEDGE CHECK</span><h2>ทบทวน Lesson 2</h2>{finished ? <div className="lesson-result"><span>✓</span><div><p>จบบทเรียนแล้ว</p><b>{score} / {questions.length}</b><p>{score >= 5 ? "Great! ทำได้ยอดเยี่ยม" : "Good try! ลองทบทวนอีกครั้ง"}</p></div></div> : <><p>คำถาม {index + 1} จาก {questions.length}</p><h3>{question.prompt}</h3><div className="lesson-answers">{question.choices.map(choice => <button key={choice} disabled={!!answer} className={answer ? choice === question.correct ? "correct" : choice === answer ? "wrong" : "" : ""} onClick={() => { setAnswer(choice); if (choice === question.correct) setScore(score + 1); }}>{choice}</button>)}</div>{answer && <><div className="lesson-tip"><b>{answer === question.correct ? "Correct! ถูกต้อง" : "ยังไม่ถูก"}</b><p>{question.explain}</p></div><button className="primary lesson-next" onClick={() => { if (index === questions.length - 1) { setFinished(true); finish("check"); } else { setIndex(index + 1); setAnswer(""); window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); } }}>คำถามถัดไป <ChevronRight /></button></>}</>}</div>}
  </section>;
}