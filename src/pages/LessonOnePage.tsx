import { useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  Headphones,
  Languages,
  Volume2,
} from "lucide-react";
import { ttsService } from "../services/ttsService";

const alphabet = [
  ["A", "ay"],
  ["B", "bee"],
  ["C", "see"],
  ["D", "dee"],
  ["E", "ee"],
  ["F", "ef"],
  ["G", "jee"],
  ["H", "aitch"],
  ["I", "eye"],
  ["J", "jay"],
  ["K", "kay"],
  ["L", "el"],
  ["M", "em"],
  ["N", "en"],
  ["O", "oh"],
  ["P", "pee"],
  ["Q", "kyoo"],
  ["R", "ar"],
  ["S", "es"],
  ["T", "tee"],
  ["U", "yoo"],
  ["V", "vee"],
  ["W", "double-u"],
  ["X", "eks"],
  ["Y", "wy"],
  ["Z", "zee"],
];
export const phrases = [
  ["Take care!", "ดูแลตัวเองด้วย!"],
  ["Have a nice day!", "ขอให้เป็นวันที่ดี!"],
  ["Good morning!", "อรุณสวัสดิ์!"],
  ["Morning!", "สวัสดีตอนเช้า!"],
  ["Hello!", "สวัสดี!"],
  ["Good day!", "สวัสดีตอนกลางวัน!"],
  ["Good evening!", "สวัสดีตอนเย็น!"],
  ["Good night!", "ราตรีสวัสดิ์!"],
  ["Sleep well!", "หลับฝันดีนะ!"],
  ["Hi!", "หวัดดี!"],
  ["Hello!", "สวัสดี!"],
  ["Nice to meet you!", "ยินดีที่ได้รู้จัก!"],
  ["See you!", "แล้วเจอกัน!"],
  ["Bye!", "ลาก่อน!"],
  ["See you tomorrow!", "พรุ่งนี้เจอกัน!"],
  ["How are you?", "สบายดีไหม?"],
  ["I am fine.", "ฉันสบายดี"],
  ["Thank you.", "ขอบคุณ"],
  ["You are welcome.", "ด้วยความยินดี"],
  ["Yes.", "ใช่"],
  ["No.", "ไม่"],
  ["Excuse me.", "ขอโทษครับ/ค่ะ"],
  ["Sorry.", "ขอโทษ"],
  ["Never mind.", "ไม่เป็นไร"],
  ["Cheers!", "ชนแก้ว!"],
  ["Enjoy your meal!", "ทานให้อร่อยนะ!"],
  ["Thank you for the meal.", "ขอบคุณสำหรับอาหารมื้อนี้"],
  ["It was good.", "มันอร่อยมาก"],
  ["My name is...", "ฉันชื่อ..."],
  ["What is your name?", "คุณชื่ออะไร?"],
  ["Welcome!", "ยินดีต้อนรับ!"],
  ["I am a student.", "ฉันเป็นนักเรียน"],
  ["You are a teacher.", "คุณเป็นครู"],
  ["They are friends.", "พวกเขาเป็นเพื่อนกัน"],
];
export const bookVocabulary = [
  ["Hi!", "หวัดดี!", "Informal greeting"],
  ["and", "และ", "Conjunction"],
  ["Welcome!", "ยินดีต้อนรับ!", "Greeting"],
  ["Sorry!", "ขอโทษ!", "Apology"],
  ["is", "คือ/เป็น", "Verb to be"],
  ["here", "ที่นี่", "Location"],
  ["English course", "คอร์สภาษาอังกฤษ", "Subject"],
  ["yes", "ใช่", "Affirmation"],
  ["to be", "เป็น/อยู่/คือ", "Verb"],
  ["this", "นี่", "Demonstrative"],
  ["place", "สถานที่", "Noun"],
  ["free", "ว่าง", "Adjective"],
  ["nice", "ดี/น่ารัก", "Adjective"],
  ["I", "ฉัน", "Pronoun"],
  ["who", "ใคร", "Question word"],
  ["you", "คุณ", "Pronoun"],
  ["Nice to meet you!", "ยินดีที่ได้รู้จัก!", "Phrase"],
  ["Likewise!", "เช่นกัน!", "Response"],
  ["How are you?", "สบายดีไหม?", "Question"],
  ["teacher", "ครู", "Noun"],
  ["spelled", "สะกด", "Verb"],
  ["first name", "ชื่อจริง", "Noun"],
  ["last name", "นามสกุล", "Noun"],
  ["okay", "โอเค", "Adjective"],
  ["Monday", "วันจันทร์", "Day"],
  ["Wednesday", "วันพุธ", "Day"],
  ["Thursday", "วันพฤหัสบดี", "Day"],
  ["time", "เวลา", "Noun"],
["classroom", "ห้องเรียน"],
["lesson", "บทเรียน"],
["question", "คำถาม"],
["answer", "คำตอบ"],
["listen", "ฟัง"],
["repeat", "พูดซ้ำ"],
["write", "เขียน"],
["read", "อ่าน"],
["please", "กรุณา"],
["understand", "เข้าใจ"]
];
const twisters = [
  ["She sells seashells by the seashore.", "Focus: s and sh sounds"],
  ["How much wood would a woodchuck chuck?", "Focus: w and ch sounds"],
  ["Red lorry, yellow lorry, red lorry, yellow lorry.", "Focus: r and l sounds"],
];
const pronouns = [
  ["I", "am", "ฉันเป็น/อยู่/คือ"],
  ["you", "are", "คุณเป็น/อยู่/คือ"],
  ["he / she / it", "is", "เขา/มัน เป็น/อยู่/คือ"],
  ["we", "are", "พวกเราเป็น/อยู่/คือ"],
  ["you", "are", "พวกคุณเป็น/อยู่/คือ"],
  ["they", "are", "พวกเขาเป็น/อยู่/คือ"],
];
const spoken = [
  ["I am going", "I'm goin'", "ฉันกำลังไป"],
  ["Do you want?", "Wanna?", "คุณต้องการไหม?"],
  ["I do not know", "Dunno", "ฉันไม่รู้"],
  ["twenty-one", "twenty-one", "ยี่สิบเอ็ด"],
];
const days = [
  ["Monday", "วันจันทร์"],
  ["Tuesday", "วันอังคาร"],
  ["Wednesday", "วันพุธ"],
  ["Thursday", "วันพฤหัสบดี"],
  ["Friday", "วันศุกร์"],
  ["Saturday", "วันเสาร์"],
  ["Sunday", "วันอาทิตย์"],
];
const smallTalk = [
  {
    title: "Introducing yourself",
    lines: [
      ["I am...", "ฉันคือ...", "Standard"],
      ["My name is...", "ชื่อของฉันคือ...", "Standard"],
      ["I'm...", "ฉันชื่อ...", "Spoken"],
    ],
  },
  {
    title: "Asking a name",
    lines: [
      ["What is your name?", "คุณชื่ออะไร?", "Standard"],
      ["What's your name?", "ชื่ออะไรเหรอ?", "Spoken"],
    ],
  },
  {
    title: "Meeting someone",
    lines: [
      ["Nice to meet you!", "ยินดีที่ได้รู้จัก!", "Standard"],
      ["Likewise!", "เช่นกัน!", "Reply"],
    ],
  },
  {
    title: "How are you? — standard",
    lines: [
      ["How are you?", "สบายดีไหม?", "Standard"],
      ["I am doing well.", "ฉันสบายดี", "Reply"],
      ["And you?", "แล้วคุณล่ะ?", "Standard"],
    ],
  },
  {
    title: "How are you? — spoken",
    lines: [
      ["How's it going?", "เป็นไงบ้าง?", "Spoken"],
      ["Good, thanks!", "ดี ขอบคุณ!", "Reply"],
      ["Wonderful!", "ยอดเยี่ยม!", "Reply"],
      ["Not much.", "ไม่มีอะไรพิเศษ", "Reply"],
    ],
  },
  {
    title: "Going well",
    lines: [
      ["How is it going?", "เป็นอย่างไรบ้าง?", "Spoken"],
      ["Well!", "ดี!", "Reply"],
      ["Everything is okay.", "ทุกอย่างโอเค", "Reply"],
    ],
  },
];
const soundConfusers: Record<string, string[]> = {
  A: ["E", "I"],
  B: ["P", "V"],
  C: ["S", "K"],
  D: ["T", "B"],
  E: ["I", "A"],
  F: ["V", "S"],
  G: ["K", "J"],
  H: ["K", "J"],
  I: ["E", "A"],
  J: ["G", "I"],
  K: ["G", "H"],
  L: ["R", "N"],
  M: ["N", "L"],
  N: ["M", "L"],
  P: ["B", "T"],
  Q: ["K", "C"],
  R: ["L", "S"],
  S: ["C", "Z"],
  T: ["D", "P"],
  V: ["W", "F"],
  W: ["V", "U"],
  X: ["S", "Z"],
  Y: ["I", "E"],
  Z: ["S", "C"],
};
const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
const makeSoundRounds = () =>
  shuffle(
    alphabet.map(([letter, sound]) => {
      const preferred = soundConfusers[letter] || [];
      const fillers = shuffle(
        alphabet
          .map(([candidate]) => candidate)
          .filter(
            (candidate) =>
              candidate !== letter && !preferred.includes(candidate),
          ),
      );
      return {
        letter,
        sound,
        choices: shuffle([letter, ...preferred, ...fillers].slice(0, 3)),
      };
    }),
  );
const questions = [
  {
    category: "Alphabet & sounds",
    prompt: "How many letters are in the English alphabet?",
    choices: ["24", "26", "28"],
    correct: "26",
    explain: "The English alphabet consists of 26 letters from A to Z.",
  },
  {
    category: "Alphabet & sounds",
    prompt: "How is the letter W named?",
    choices: ["wee", "double-u", "double-v"],
    correct: "double-u",
    explain: "W is named 'double-u' because it looks like two U's.",
  },
  {
    category: "Alphabet & sounds",
    prompt: "คำว่า “ไฟ” ภาษาอังกฤษคืออะไร?",
    choices: ["fire", "flame", "burn"],
    correct: "fire",
    explain: "Fire is the common English word for combustion.",
  },
  {
    category: "Greetings & phrases",
    prompt: "What does “Good morning!” mean?",
    choices: ["อรุณสวัสดิ์", "ราตรีสวัสดิ์", "สวัสดีตอนเย็น"],
    correct: "อรุณสวัสดิ์",
    explain: "Good morning is used from sunrise until noon.",
  },
  {
    category: "Introductions",
    prompt: "Complete: I ___ a student.",
    choices: ["am", "are", "is"],
    correct: "am",
    explain: "The verb 'to be' for 'I' is 'am'.",
  },
  {
    category: "Introductions",
    prompt: "Complete: They ___ friends.",
    choices: ["am", "are", "is"],
    correct: "are",
    explain: "The verb 'to be' for 'they' is 'are'.",
  },
  {
    category: "Days & countries",
    prompt: "Which day is Thursday?",
    choices: ["วันอังคาร", "วันพฤหัสบดี", "วันเสาร์"],
    correct: "วันพฤหัสบดี",
    explain: "Thursday is the fourth day of the work week.",
  },
  {
    category: "Culture",
    prompt: "What is “Sisu”?",
    choices: ["A greeting", "Finnish determination", "A type of food"],
    correct: "Finnish determination",
    explain: "Sisu is a Finnish concept of grit and perseverance.",
  },
{"category": "Alphabet & sounds", "prompt": "Which letter is pronounced \"ay\"?", "choices": ["A", "E", "I"], "correct": "A", "explain": "A อ่านว่า เอ ส่วน E อ่านว่า อี และ I อ่านว่า ไอ"},
{"category": "Alphabet & sounds", "prompt": "Which word begins with the /ʃ/ sound?", "choices": ["ship", "sip", "zip"], "correct": "ship", "explain": "sh ใน ship ออกเสียง /ʃ/ ต่างจาก s ใน sip"},
{"category": "Alphabet & sounds", "prompt": "Where is the stress in \"TAble\"?", "choices": ["First syllable", "Last syllable", "Both equally"], "correct": "First syllable", "explain": "table เน้นพยางค์แรก แต่ตำแหน่งเน้นเสียงภาษาอังกฤษเปลี่ยนไปตามคำ"},
{"category": "Greetings & phrases", "prompt": "คำว่า \"ขอบคุณ\" คืออะไร?", "choices": ["Thank you.", "Sorry.", "Goodbye."], "correct": "Thank you.", "explain": "Thank you ใช้กล่าวขอบคุณ"},
{"category": "Greetings & phrases", "prompt": "คำตอบสุภาพของ \"Thank you\" คืออะไร?", "choices": ["You're welcome.", "Good night.", "Excuse me."], "correct": "You're welcome.", "explain": "You are welcome ใช้ตอบรับคำขอบคุณ"},
{"category": "Introductions", "prompt": "เติม: What ___ your name?", "choices": ["is", "am", "are"], "correct": "is", "explain": "your name เป็นเอกพจน์จึงใช้ is"},
{"category": "Introductions", "prompt": "เติม: We ___ students.", "choices": ["are", "is", "am"], "correct": "are", "explain": "we ใช้กับ are และ students เป็นพหูพจน์"},
{"category": "Introductions", "prompt": "รูปย่อของ I am คืออะไร?", "choices": ["I'm", "I've", "I'll"], "correct": "I'm", "explain": "I am ย่อเป็น I'm"},
{"category": "Days & countries", "prompt": "วันจันทร์ภาษาอังกฤษคืออะไร?", "choices": ["Monday", "Sunday", "Friday"], "correct": "Monday", "explain": "Monday คือวันจันทร์"},
{"category": "Days & countries", "prompt": "เติม: The class is ___ Monday.", "choices": ["on", "in", "at"], "correct": "on", "explain": "ใช้ on กับชื่อวันในสัปดาห์"},
{"category": "Grammar", "prompt": "เติม: I have ___ apple.", "choices": ["an", "a", "two"], "correct": "an", "explain": "apple เริ่มด้วยเสียงสระ ใช้ an เมื่อพูดถึงหนึ่งผล"},
{"category": "Grammar", "prompt": "ข้อใดขึ้นต้นชื่อภาษาอย่างถูกต้อง?", "choices": ["English", "english", "ENglish"], "correct": "English", "explain": "ชื่อภาษาและสัญชาติขึ้นต้นด้วยตัวพิมพ์ใหญ่"}
];
type Step = "intro" | "alphabet" | "phrases" | "basics" | "tongue" | "check";
const steps: { id: Step; label: string }[] = [
  { id: "intro", label: "Start" },
  { id: "alphabet", label: "Sounds" },
  { id: "phrases", label: "Phrases" },
  { id: "basics", label: "Basics" },
  { id: "tongue", label: "Speak" },
  { id: "check", label: "Check" },
];
const EnglishText = ({
  text,
  children,
}: {
  text: string;
  children?: ReactNode;
}) => (
  <button
    type="button"
    className="finnish-speak"
    onClick={() => ttsService.speak(text)}
    aria-label={`Listen to ${text}`}
  >
    {children ?? text}
    <Volume2 size={13} />
  </button>
);
const SmallTalkSection = () => (
  <section className="small-talk-section">
    <div className="small-talk-title">
      <span className="kicker">INTRODUCTIONS & SMALL TALK</span>
      <h3>Introductions &amp; small talk</h3>
      <p>
        Listen to the standard and spoken forms, then practise both sides of
        each conversation.
      </p>
    </div>
    <div className="small-talk-grid">
      {smallTalk.map((group) => (
        <article key={group.title}>
          <h4>{group.title}</h4>
          {group.lines.map(([en, th, kind]) => (
            <div className="talk-line" key={en}>
              <span className={`talk-kind ${kind.toLowerCase()}`}>{kind}</span>
              <EnglishText text={en} />
              <span className="talk-translation">{th}</span>
            </div>
          ))}
        </article>
      ))}
    </div>
  </section>
);

export function LessonOnePage() {
  const [step, setStep] = useState<Step>("intro"),
    [flipped, setFlipped] = useState<number[]>([]),
    [answer, setAnswer] = useState(""),
    [quizIndex, setQuizIndex] = useState(0),
    [quizScore, setQuizScore] = useState(0),
    [quizFinished, setQuizFinished] = useState(false);
  const [soundRounds, setSoundRounds] = useState(makeSoundRounds),
    [soundRound, setSoundRound] = useState(0),
    [soundChoice, setSoundChoice] = useState(""),
    [soundScore, setSoundScore] = useState(0),
    [soundFinished, setSoundFinished] = useState(false),
    [soundWrong, setSoundWrong] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sisu-english:lesson1:v1") || "[]");
    } catch {
      return [];
    }
  });
  const finish = (id: Step) => {
    const next = [...new Set([...completed, id])];
    setCompleted(next);
    localStorage.setItem("sisu-english:lesson1:v1", JSON.stringify(next));
  };
  const go = (id: Step) => {
    finish(step);
    setStep(id);
    window.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  };
  const progress = Math.round((completed.length / steps.length) * 100),
    question = useMemo(() => questions[quizIndex], [quizIndex]),
    soundQuestion = soundRounds[soundRound];
  return (
    <section className="page lesson-page">
      <div className="lesson-hero">
        <div>
          <span className="kicker">LESSON 1 · CHAPTER 1</span>
          <h1>Welcome to English!</h1>
        </div>
        <div className="lesson-progress">
          <b>{progress}%</b>
          <span>complete</span>
          <i>
            <em style={{ width: `${progress}%` }} />
          </i>
        </div>
      </div>
      <div className="lesson-tabs" role="tablist">
        {steps.map((s, i) => (
          <button
            role="tab"
            aria-selected={step === s.id}
            className={
              step === s.id ? "active" : completed.includes(s.id) ? "done" : ""
            }
            onClick={() => setStep(s.id)}
            key={s.id}
          >
            <span>
              {completed.includes(s.id) ? <Check size={14} /> : i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>
      {step === "intro" && (
        <div className="lesson-panel intro-panel">
          <div className="lesson-number">01</div>
          <span className="kicker">INTRODUCTION TO ENGLISH</span>
          <h2>Your first English lesson</h2>
          <p>
            Learn how English letters sound, greet people naturally, and
            practise the basic verb structures.
          </p>
          <div className="objectives">
            <div>
              <span>01</span>
              <p>
                <b>Recognise the alphabet</b>Hear all 26 letters and repeat
                them.
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <b>Use everyday phrases</b>Say hello, goodbye and thank you.
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <b>Train your mouth</b>Practise common English sounds.
              </p>
            </div>
          </div>
          <div className="course-files">
            <a href="/lesson1/suomen-mestari-1-kappale-1.pdf" target="_blank">
              <BookOpen />
              Chapter 1 PDF <ExternalLink size={15} />
            </a>
            <a href="/lesson1/lesson-1-2026.pptx" download>
              <Download />
              Lesson slides
            </a>
          </div>
          <button
            className="primary lesson-next"
            onClick={() => go("alphabet")}
          >
            Begin with the alphabet <ChevronRight />
          </button>
        </div>
      )}
      {step === "alphabet" && (
        <div className="lesson-panel">
          <div className="lesson-title">
            <div>
              <span className="kicker">PAGE 14</span>
              <h2>Alphabet</h2>
              <p>
                Listen once. Then play it again and repeat each letter aloud.
              </p>
            </div>
            <Headphones />
          </div>
          <div className="audio-card">
            <div className="audio-art">
              <Volume2 />
            </div>
            <div>
              <b>Chapter 1: Alphabet</b>
              <span>English–Thai alphabet audio</span>
              <audio
                data-testid="alphabet-audio"
                controls
                preload="metadata"
                src="/lesson1/004-kappale-1-aakkoset.mp3"
              />
            </div>
          </div>
          <h3 className="subhead">Tap a letter to hear it</h3>
          <div className="alphabet-grid">
            {alphabet.map(([letter, sound]) => (
              <button
                key={letter}
                onClick={() => ttsService.speak(sound)}
                aria-label={`Listen to ${letter}`}
              >
                <b>{letter}</b>
                <span>[{sound}]</span>
              </button>
            ))}
          </div>
          <section className="sound-match">
            <div className="sound-match-head">
              <div>
                <span className="kicker">LISTEN AND CHOOSE</span>
                <h3>Sound matching practice</h3>
                <p>
                  Complete all 26 letters. Every new round randomises the
                  questions and answer positions.
                </p>
              </div>
              {!soundFinished && (
                <b>
                  {soundRound + 1} / {soundRounds.length}
                </b>
              )}
            </div>
            {soundFinished ? (
              <div className="sound-finished">
                <span>🎧</span>
                <h4>
                  {soundScore >= 24
                    ? "Great listening!"
                    : "Good try! Practise once more."}
                </h4>
                <p>
                  You matched {soundScore} of {soundRounds.length} sounds.
                </p>
                {soundWrong.length > 0 && (
                  <div className="sound-review">
                    <b>Review these letters</b>
                    <div>
                      {soundWrong.map((letter) => (
                        <button
                          key={letter}
                          onClick={() =>
                            ttsService.speak(
                              alphabet.find(([item]) => item === letter)?.[1] ||
                                letter,
                            )
                          }
                        >
                          {letter}
                          <Volume2 size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="primary"
                  onClick={() => {
                    setSoundRounds(makeSoundRounds());
                    setSoundRound(0);
                    setSoundChoice("");
                    setSoundScore(0);
                    setSoundWrong([]);
                    setSoundFinished(false);
                  }}
                >
                  Start a new random round
                </button>
              </div>
            ) : (
              <>
                <button
                  className="mystery-sound"
                  onClick={() => ttsService.speak(soundQuestion.sound)}
                  aria-label="Play mystery sound"
                >
                  <Volume2 />
                  <span>Play mystery sound</span>
                  <small>Listen as many times as you need</small>
                </button>
                <div className="sound-options">
                  {soundQuestion.choices.map((letter) => (
                    <button
                      key={letter}
                      disabled={!!soundChoice}
                      className={
                        soundChoice
                          ? letter === soundQuestion.letter
                            ? "correct"
                            : letter === soundChoice
                              ? "wrong"
                              : ""
                          : ""
                      }
                      onClick={() => {
                        setSoundChoice(letter);
                        if (letter === soundQuestion.letter)
                          setSoundScore(soundScore + 1);
                        else
                          setSoundWrong([...soundWrong, soundQuestion.letter]);
                      }}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                {soundChoice && (
                  <p
                    className={`sound-feedback ${soundChoice === soundQuestion.letter ? "correct" : "wrong"}`}
                  >
                    {soundChoice === soundQuestion.letter
                      ? "Correct!"
                      : `Not quite — the sound was ${soundQuestion.letter}.`}
                  </p>
                )}
                <button
                  className="primary sound-next"
                  disabled={!soundChoice}
                  onClick={() => {
                    if (soundRound === soundRounds.length - 1)
                      setSoundFinished(true);
                    else {
                      setSoundRound(soundRound + 1);
                      setSoundChoice("");
                    }
                  }}
                >
                  Next sound <ChevronRight size={17} />
                </button>
              </>
            )}
          </section>
          <div className="lesson-tip">
            <b>English tip</b>
            <p>
              English spelling can be tricky. Focus on the sound of the letters
              rather than just the visual form.
            </p>
          </div>
          <button className="primary lesson-next" onClick={() => go("phrases")}>
            Next: useful phrases <ChevronRight />
          </button>
        </div>
      )}
      {step === "phrases" && (
        <div className="lesson-panel">
          <div className="lesson-title">
            <div>
              <span className="kicker">PAGES 12–13</span>
              <h2>Phrases</h2>
              <p>
                Vocabulary and everyday expressions. Use the speaker buttons to
                hear English pronunciation.
              </p>
            </div>
            <Languages />
          </div>
          <section className="book-vocab">
            <h3>Book vocabulary</h3>
            <p className="book-vocab-note">Page 12 · Vocabulary</p>
            <div className="book-vocab-grid">
              {bookVocabulary.map(([en, th]) => (
                <div className="book-vocab-row" key={en}>
                  <div>
                    <b>{en}</b>
                    <span>{th}</span>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => ttsService.speak(en)}
                    aria-label={`Listen to ${en}`}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
          <h3 className="subhead">Useful phrases</h3>
          <p className="book-vocab-note">
            Pages 12–13 · Tap a card to reveal its meaning
          </p>
          <div className="phrase-grid">
            {phrases.map(([en, th], i) => (
              <button
                key={`${en}-${i}`}
                className={flipped.includes(i) ? "flipped" : ""}
                onClick={() =>
                  setFlipped(
                    flipped.includes(i)
                      ? flipped.filter((x) => x !== i)
                      : [...flipped, i],
                  )
                }
              >
                <span className="phrase-count">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <b>{en}</b>
                {flipped.includes(i) ? (
                  <em>{th}</em>
                ) : (
                  <small>Tap to translate</small>
                )}
                <span
                  className="phrase-audio"
                  onClick={(e) => {
                    e.stopPropagation();
                    ttsService.speak(en);
                  }}
                >
                  <Volume2 size={16} />
                </span>
              </button>
            ))}
          </div>
          <a
            className="source-link"
            href="/lesson1/suomen-mestari-1-kappale-1.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Open English–Thai workbook <ExternalLink size={15} />
          </a>
          <button className="primary lesson-next" onClick={() => go("basics")}>
            Next: English basics <ChevronRight />
          </button>
        </div>
      )}
      {step === "basics" && (
        <div className="lesson-panel">
          <div className="lesson-title">
            <div>
              <span className="kicker">LESSON SLIDES</span>
              <h2>English basics</h2>
              <p>
                The grammar and conversation patterns. Tap any blue English text
                to hear it.
              </p>
            </div>
            <BookOpen />
          </div>
          <div className="basics-grid">
            <section>
              <h3>Why English is approachable</h3>
              <ul>
                <li>Simple verb conjugations</li>
                <li>Global language</li>
                <li>Logical sentence structure</li>
                <li>Flexible vocabulary</li>
              </ul>
            </section>
            <section>
              <h3>
                Pronouns + <EnglishText text="be" />
              </h3>
              <div className="lesson-table">
                {pronouns.map(([p, v, th], i) => (
                  <div key={`${p}-${i}`}>
                    <EnglishText text={p} />
                    <EnglishText text={v} />
                    <span>{th}</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3>Written and spoken English</h3>
              <div className="lesson-table spoken-table">
                <div>
                  <b>Standard</b>
                  <strong>Spoken</strong>
                  <span>Meaning</span>
                </div>
                {spoken.map(([standard, casual, th]) => (
                  <div key={standard}>
                    <EnglishText text={standard} />
                    <EnglishText text={casual} />
                    <span>{th}</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3>Days of the week</h3>
              <div className="days-grid">
                {days.map(([en, th]) => (
                  <div key={en}>
                    <EnglishText text={en} />
                    <span>{th}</span>
                  </div>
                ))}
              </div>
            </section>
            <SmallTalkSection />
          </div>
          <button className="primary lesson-next" onClick={() => go("tongue")}>
            Next: speaking practice <ChevronRight />
          </button>
        </div>
      )}
      {step === "tongue" && (
        <div className="lesson-panel">
          <div className="lesson-title">
            <div>
              <span className="kicker">PRONUNCIATION</span>
              <h2>Tongue twisters</h2>
              <p>
                Start slowly. Keep every word clear, then increase your speed.
              </p>
            </div>
            <Volume2 />
          </div>
          <div className="twister-list">
            {twisters.map(([text, focus], i) => (
              <article key={text}>
                <span>0{i + 1}</span>
                <div>
                  <p>{text}</p>
                  <small>{focus}</small>
                </div>
                <button
                  className="icon-button"
                  onClick={() => ttsService.speak(text)}
                  aria-label={`Listen to tongue twister ${i + 1}`}
                >
                  <Volume2 />
                </button>
              </article>
            ))}
          </div>
          <button className="primary lesson-next" onClick={() => go("check")}>
            Finish with a quick check <ChevronRight />
          </button>
        </div>
      )}
      {step === "check" && !quizFinished && (
        <div className="lesson-panel quiz-panel">
          <div className="quiz-meta">
            <span>{question.category}</span>
            <b>
              Question {quizIndex + 1} of {questions.length}
            </b>
          </div>
          <i className="quiz-progress">
            <em
              style={{
                width: `${((quizIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </i>
          <h2>{question.prompt}</h2>
          <div className="lesson-answers">
            {question.choices.map((x) => (
              <button
                disabled={!!answer}
                className={
                  answer
                    ? x === question.correct
                      ? "correct"
                      : x === answer
                        ? "wrong"
                        : ""
                    : ""
                }
                onClick={() => {
                  setAnswer(x);
                  if (x === question.correct) setQuizScore(quizScore + 1);
                }}
                key={x}
              >
                {x}
                {answer && x === question.correct ? <Check size={18} /> : null}
              </button>
            ))}
          </div>
          {answer && (
            <div className="lesson-result">
              <div>
                <b>
                  {answer === question.correct
                    ? "Correct!"
                    : "The correct answer is " + question.correct}
                </b>
                <p>{question.explain}</p>
              </div>
            </div>
          )}
          <button
            className="primary lesson-next"
            disabled={!answer}
            onClick={() => {
              if (quizIndex === questions.length - 1) {
                finish("check");
                setQuizFinished(true);
              } else {
                setQuizIndex(quizIndex + 1);
                setAnswer("");
              }
            }}
          >
            {quizIndex === questions.length - 1
              ? "See results"
              : "Next question"}{" "}
            <ChevronRight />
          </button>
        </div>
      )}
      {step === "check" && quizFinished && (
        <div className="lesson-panel quiz-summary">
          <div className="score-ring">
            <b>{quizScore}</b>
            <span>/ {questions.length}</span>
          </div>
          <span className="kicker">LESSON 1 COMPLETE</span>
          <h2>
            {quizScore >= 6
              ? "Great job!"
              : "Keep practising!"}
          </h2>
          <p>
            You answered {quizScore} of {questions.length} questions correctly.
          </p>
          <button
            className="primary"
            onClick={() => {
              setQuizIndex(0);
              setQuizScore(0);
              setAnswer("");
              setQuizFinished(false);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}