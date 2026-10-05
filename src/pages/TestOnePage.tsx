import { CSSProperties, ReactNode, useState } from "react";
import { Check, ChevronRight, Eye, EyeOff, MessageCircle, Volume2 } from "lucide-react";
import { ttsService } from "../services/ttsService";

type Step = "start" | "texts" | "phrases" | "days" | "numbers" | "pronouns" | "harmony" | "verbs" | "questions" | "check";

const steps: { id: Step; label: string }[] = [
  { id: "start", label: "Start" }, { id: "texts", label: "Texts" }, { id: "phrases", label: "Phrases" },
  { id: "days", label: "Days" }, { id: "numbers", label: "Numbers" }, { id: "pronouns", label: "Pronouns" },
  { id: "harmony", label: "Articles" }, { id: "verbs", label: "Verbs" }, { id: "questions", label: "Questions" },
  { id: "check", label: "Check" },
];

const text11 = [
  ["Alex", "Excuse me, is there an English course here?", "ขอโทษครับ ที่นี่มีคอร์สภาษาอังกฤษใช่ไหม"],
  ["Olga", "Yes, there is. This is English 1.", "ใช่ค่ะ นี่คือคอร์ส English 1"],
  ["Alex", "Good. Is this seat free?", "ดีเลย ที่นั่งนี้ว่างไหม"], ["Olga", "It is.", "ว่างค่ะ"],
  ["Alex", "Nice. Hi, I am Alex. Who are you?", "เยี่ยม สวัสดี ผมชื่อ Alex คุณคือใคร"],
  ["Olga", "I am Olga. Nice to meet you!", "ฉันชื่อ Olga ยินดีที่ได้รู้จัก"], ["Alex", "Nice to meet you too!", "ขอบคุณ เช่นกันครับ"],
  ["Pedro", "Hi Olga! How are you?", "สวัสดี Olga สบายดีไหม"],
  ["Olga", "Hello Pedro! Thanks, I am fine. And you?", "สวัสดี Pedro ขอบคุณ ฉันสบายดี แล้วคุณล่ะ"],
  ["Pedro", "I am fine, thanks.", "ค่อนข้างสบายดี ขอบคุณ"], ["Olga", "Alex, this is Pedro.", "Alex นี่คือ Pedro"],
  ["Alex", "Hi Pedro. My name is Alex. Nice to meet you!", "สวัสดี Pedro ผมชื่อ Alex ยินดีที่ได้รู้จัก"],
  ["Pedro", "Nice to meet you!", "ยินดีที่ได้รู้จัก"],
  ["Teacher", "Hello and welcome to the English course! This course is English 1 and I am the teacher. My name is Päivi Koskela.", "สวัสดีและยินดีต้อนรับสู่คอร์สภาษาอังกฤษ คอร์สนี้คือ English 1 และฉันเป็นครู ฉันชื่อ Päivi Koskela"],
  ["Alex", "Excuse me, how is it spelled?", "ขอโทษครับ สะกดอย่างไร"],
  ["Teacher", "My first name is spelled P-A-I-V-I and the surname K-O-S-K-E-L-A.", "ชื่อของฉันสะกด P-A-I-V-I และนามสกุล K-O-S-K-E-L-A"],
  ["Alex", "Okay, thanks.", "โอเค ขอบคุณ"],
  ["Teacher", "The course days are Monday, Wednesday and Thursday. The course is at 18–20.", "วันเรียนคือวันจันทร์ พุธ และพฤหัสบดี เรียนเวลา 18–20 น."],
];

const text29 = [
  ["Narrator", "The course ends at 20. Other students go home, but Alex, Olga and Pedro go to the kiosk.", "คอร์สเลิกสองทุ่ม นักเรียนคนอื่นกลับบ้าน แต่ Alex, Olga และ Pedro ไปที่ซุ้มขายของ"],
  ["Narrator", "Alex and Pedro buy ice cream. The ice cream costs 3 euros. Olga does not buy ice cream, because she is saving money.", "Alex และ Pedro ซื้อไอศกรีม ราคา 3 ยูโร Olga ไม่ซื้อเพราะเธอเก็บเงิน"],
  ["Narrator", "Then they sit in the park and talk and laugh.", "จากนั้นพวกเขานั่งในสวน พูดคุยและหัวเราะ"],
  ["Olga", "Pedro, what is your nationality?", "Pedro คุณเป็นคนชาติอะไร"], ["Pedro", "I am Brazilian. And you?", "ผมเป็นชาวบราซิล แล้วคุณล่ะ"],
  ["Olga", "I am Russian. And Alex, where are you from?", "ฉันเป็นชาวรัสเซีย แล้ว Alex คุณมาจากไหน"],
  ["Alex", "I am from Johannesburg, South Africa.", "ผมมาจาก Johannesburg ประเทศแอฟริกาใต้"],
  ["Olga", "Oh, what language do you speak?", "อ๋อ แล้วคุณพูดภาษาอะไร"],
  ["Alex", "My mother tongue is English, but I also speak a little Spanish. Pedro, is your mother tongue Spanish?", "ภาษาแม่ของผมคืออังกฤษ แต่ผมพูดสเปนได้นิดหน่อย Pedro ภาษาแม่ของคุณคือสเปนใช่ไหม"],
  ["Pedro", "No, I do not speak Spanish. In Brazil we speak Portuguese.", "ไม่ ผมไม่พูดสเปน ที่บราซิลเราพูดภาษาโปรตุเกส"],
  ["Alex", "Oh right, true!", "อ๋อจริงด้วย"],
  ["Narrator", "Then Alex drives home by car. Pedro and Olga go to the bus stop.", "จากนั้น Alex ขับรถกลับบ้าน ส่วน Pedro และ Olga ไปป้ายรถเมล์"],
  ["Pedro", "Where do you live?", "คุณอาศัยอยู่ที่ไหน"], ["Olga", "I live in Puistola. It is in North Helsinki. I go home by bus 75.", "ฉันอยู่ Puistola ทางเหนือของ Helsinki ฉันกลับบ้านด้วยรถเมล์สาย 75"],
  ["Pedro", "I do not live in Helsinki but in Espoo. I go home first by bus and then by metro.", "ผมไม่ได้อยู่ Helsinki แต่อยู่ Espoo ผมกลับบ้านด้วยรถเมล์ก่อน แล้วต่อรถไฟใต้ดิน"],
  ["Olga", "Hi, now my bus is coming! Bye bye, see you tomorrow!", "รถของฉันมาแล้ว บ๊ายบาย เจอกันพรุ่งนี้"], ["Pedro", "See you, bye!", "แล้วเจอกัน บ๊ายบาย"],
];

const introductions = [
  ["Pedro", "I am Pedro. I am Brazilian. I am from São Paulo, Brazil. I speak Portuguese.", "ผมชื่อ Pedro เป็นชาวบราซิล มาจาก São Paulo ประเทศบราซิล และพูดภาษาโปรตุเกส"],
  ["Olga", "My name is Olga. I am Russian. I am from St Petersburg, Russia. I speak Russian. I do not speak English.", "ฉันชื่อ Olga เป็นชาวรัสเซีย มาจาก St Petersburg ประเทศรัสเซีย พูดรัสเซีย และไม่พูดอังกฤษ"],
  ["Alex", "I am Alex. I am South African. I am from Johannesburg, South Africa. My mother tongue is English. I also speak a little Spanish.", "ผมชื่อ Alex เป็นชาวแอฟริกาใต้ มาจาก Johannesburg ภาษาแม่คืออังกฤษ และพูดสเปนได้นิดหน่อย"],
];
const countries = [
  ["Finland", "Finnish", "Finnish", "from Finland", "I speak Finnish."],
  ["France", "French", "French", "from France", "I speak French."],
  ["Greece", "Greek", "Greek", "from Greece", "I speak Greek."],
  ["Iceland", "Icelandic", "Icelandic", "from Iceland", "I speak Icelandic."],
  ["Egypt", "Egyptian", "Arabic", "from Egypt", "I speak Arabic."],
  ["Russia", "Russian", "Russian", "from Russia", "I speak Russian."],
  ["Pakistan", "Pakistani", "Urdu", "from Pakistan", "I speak Urdu."],
  ["Thailand", "Thai", "Thai", "from Thailand", "I speak Thai."],
];

const text33 = [
  ["Seller", "Hi.", "สวัสดี"], ["Pedro", "Hi. What does the ice cream cost?", "สวัสดี ไอศกรีมราคาเท่าไร"],
  ["Seller", "One scoop costs 3 euros and two scoops 5 euros.", "หนึ่งลูก 3 ยูโร สองลูก 5 ยูโร"],
  ["Pedro", "Okay. Well I will take two scoops of chocolate.", "โอเค งั้นผมเอาช็อกโกแลตสองลูก"], ["Seller", "Okay. And for you?", "โอเค แล้วคุณล่ะ"],
  ["Alex", "I will also take two scoops: vanilla and strawberry.", "ผมก็เอาสองลูก วานิลลาและสตรอว์เบอร์รี"],
  ["Seller", "Right. Anything else?", "ได้เลย รับอย่างอื่นอีกไหม"], ["Pedro", "No thanks.", "ไม่ครับ ขอบคุณ"],
  ["Seller", "Here. 10 euros total. Are these together?", "นี่ค่ะ รวม 10 ยูโร จ่ายรวมกันไหม"],
  ["Alex", "Yes they are. I will pay for these. By card, please.", "ครับ ผมจ่ายทั้งหมด จ่ายด้วยบัตรครับ"],
  ["Seller", "Thanks. Do you need a receipt?", "ขอบคุณ ต้องการใบเสร็จไหม"], ["Alex", "No thanks.", "ไม่ครับ ขอบคุณ"],
  ["Seller", "Right.", "ได้ค่ะ"], ["Alex", "Thanks, bye!", "ขอบคุณ บ๊ายบาย"], ["Seller", "Thanks, bye bye!", "ขอบคุณ บ๊ายบาย"],
];
const kioskVocabulary = [
  ["ice cream (colloquial)", "ice cream", "ไอศกรีม"], ["kiosk (colloquial)", "kiosk", "ซุ้มขายของ"],
  ["scoop", "—", "ลูก / หนึ่งสกู๊ป"], ["take", "take", "เอา / รับ"], ["chocolate", "chocolate", "ช็อกโกแลต"],
  ["vanilla", "vanilla", "วานิลลา"], ["strawberry", "strawberry", "สตรอว์เบอร์รี"], ["right", "—", "ตกลง / เข้าใจแล้ว"],
  ["total", "—", "รวมทั้งหมด"], ["together", "—", "รวมบิลเดียวกัน"], ["card", "by card", "บัตร / ด้วยบัตร"],
  ["receipt", "receipt", "ใบเสร็จ"], ["else", "else", "สิ่งอื่น"], ["cost", "cost", "มีราคา / จ่าย"],
];

const phrases = [
  ["Good morning! / Morning!", "อรุณสวัสดิ์ / หวัดดีตอนเช้า"], ["Good day! / Day!", "สวัสดีตอนกลางวัน"],
  ["Good evening! / Evening!", "สวัสดีตอนเย็น"], ["Good night! Sleep well!", "ราตรีสวัสดิ์ หลับให้สบายนะ"],
  ["Hi! / Hello!", "สวัสดี"], ["Bye bye! / Bye!", "บ๊ายบาย"],
  ["See you! / Goodbye!", "แล้วพบกัน / ลาก่อน"], ["See you tomorrow!", "พบกันพรุ่งนี้"],
  ["Nice to meet you!", "ยินดีที่ได้รู้จัก"], ["This is Tiina.", "นี่คือ Tiina"], ["Nice to meet you too!", "ขอบคุณ เช่นกัน"],
  ["Welcome!", "ยินดีต้อนรับ"], ["Yes. / Yes. / No.", "ใช่ (กันเอง) / ใช่ / ไม่"],
  ["You are welcome!", "เชิญ / นี่ค่ะ / ด้วยความยินดี"], ["Thanks!", "ขอบคุณ"], ["No problem!", "ไม่เป็นไร ด้วยความยินดี"],
  ["Excuse me!", "ขอโทษ / ขออนุญาต"], ["It is nothing!", "ไม่เป็นไร"], ["Cheers!", "ชนแก้ว"],
  ["Enjoy your meal!", "ทานให้อร่อย"], ["Thanks for the food!", "ขอบคุณสำหรับอาหาร"], ["Thanks, it was good.", "ขอบคุณ อร่อยมาก"],
];

const days = [["Monday", "Mon", "on Monday", "วันจันทร์"], ["Tuesday", "Tue", "on Tuesday", "วันอังคาร"], ["Wednesday", "Wed", "on Wednesday", "วันพุธ"], ["Thursday", "Thu", "on Thursday", "วันพฤหัสบดี"], ["Friday", "Fri", "on Friday", "วันศุกร์"], ["Saturday", "Sat", "on Saturday", "วันเสาร์"], ["Sunday", "Sun", "on Sunday", "วันอาทิตย์"], ["weekend", "Sat and Sun", "on the weekend", "สุดสัปดาห์"]];
const timeline = [["the day before yesterday", "เมื่อวานซืน"], ["yesterday", "เมื่อวาน"], ["today", "วันนี้"], ["tomorrow", "พรุ่งนี้"], ["the day after tomorrow", "มะรืน"]];
const numbers = [
  ["0", "zero"], ["1", "one"], ["2", "two"], ["3", "three"], ["4", "four"], ["5", "five"], ["6", "six"], ["7", "seven"], ["8", "eight"], ["9", "nine"], ["10", "ten"],
  ["11", "eleven"], ["12", "twelve"], ["13", "thirteen"], ["14", "fourteen"], ["15", "fifteen"], ["16", "sixteen"], ["17", "seventeen"], ["18", "eighteen"], ["19", "nineteen"], ["20", "twenty"],
  ["21", "twenty-one"], ["22", "twenty-two"], ["23", "twenty-three"], ["30", "thirty"], ["40", "forty"], ["50", "fifty"], ["60", "sixty"], ["70", "seventy"], ["80", "eighty"], ["90", "ninety"],
  ["100", "one hundred"], ["101", "one hundred one"], ["200", "two hundred"], ["300", "three hundred"], ["1 000", "one thousand"], ["2 000", "two thousand"], ["500 000", "five hundred thousand"], ["1 000 000", "one million"], ["2 000 000", "two million"], ["1 000 000 000", "one billion"], ["5 000 000 000", "five billion"],
];
const olla = [["I", "am", "I'm", "ฉัน"], ["you", "are", "you're", "คุณ"], ["he / she / it", "is", "he's / she's / it's", "เขา/เธอ"], ["we", "are", "we're", "พวกเรา"], ["you", "are", "you're", "พวกคุณ"], ["they", "are", "they're", "พวกเขา"]];
const conjugation = [["I", "speak", "ask", "-"], ["you", "speak", "ask", "-"], ["he / she / it", "speaks", "asks", "-s"], ["we", "speak", "ask", "-"], ["you", "speak", "ask", "-"], ["they", "speak", "ask", "-"], ["You (formal)", "speak", "ask", "-"]];
const negatives = [["I", "do not", "I do not speak", "ฉันไม่พูด"], ["you", "do not", "you do not speak", "คุณไม่พูด"], ["he / she / it", "does not", "he does not speak", "เขาไม่พูด"], ["we", "do not", "we do not speak", "พวกเราไม่พูด"], ["you", "do not", "you do not speak", "พวกคุณไม่พูด"], ["they", "do not", "they do not speak", "พวกเขาไม่พูด"]];
const questionWords = [["who", "ใคร", "Who are you?", "I am Olga."], ["what", "อะไร (ใช้กับ be)", "What day is it today?", "Today is Monday."], ["what", "อะไร (กริยาอื่น)", "What language do you speak?", "I speak Italian."], ["when", "เมื่อไร", "When is the course?", "The course is on Monday."], ["what nationality", "คนชาติอะไร", "What is Pedro's nationality?", "He is Brazilian."], ["where", "ที่ไหน", "Where do you live?", "We live in England."], ["where from", "จากไหน", "Where are you from?", "I am from Brazil."], ["where to", "ไปที่ไหน", "Where are you going?", "I am going home."], ["why", "ทำไม", "Why do you not buy ice cream?", "Because I am saving money."], ["how", "อย่างไร/เท่าไร", "How old are you?", "I am 23 years old."]];
const textsQuiz = [
  [
    "ประโยคใดใช้สำหรับถามว่า 'คุณเป็นคนชาติอะไร'?",
    [
      "What is your nationality?",
      "Where are you from?",
      "What language do you speak?"
    ],
    "What is your nationality?",
    "What is your nationality? แปลว่า คุณเป็นคนชาติอะไร"
  ],
  [
    "ประโยคใดถูกต้องตามหลักไวยากรณ์สำหรับประธาน 'He'?",
    [
      "He speak English.",
      "He speaks English.",
      "He speaking English."
    ],
    "He speaks English.",
    "กริยาที่ตามหลัง He/She/It ต้องเติม -s หรือ -es เสมอ"
  ],
  [
    "คำว่า '11' ในภาษาอังกฤษเขียนอย่างไร?",
    [
      "eleven",
      "twelve",
      "thirteen"
    ],
    "eleven",
    "11 คือ eleven, 12 คือ twelve, 13 คือ thirteen"
  ],
  [
    "ประโยคใดใช้ถามถึงสถานที่ที่อาศัยอยู่?",
    [
      "Where do you live?",
      "Where are you from?",
      "Where are you going?"
    ],
    "Where do you live?",
    "Where do you live? แปลว่า คุณอาศัยอยู่ที่ไหน"
  ],
  [
    "ข้อใดคือคำตอบที่ถูกต้องสำหรับ 'What language do you speak?'",
    [
      "I am from Brazil.",
      "I speak Portuguese.",
      "I live in Brazil."
    ],
    "I speak Portuguese.",
    "คำถามถามถึงภาษาที่พูด ต้องตอบด้วยภาษาที่พูด"
  ],
  [
    "ประโยคปฏิเสธข้อใดถูกต้องสำหรับ 'I speak Spanish'?",
    [
      "I not speak Spanish.",
      "I do not speak Spanish.",
      "I does not speak Spanish."
    ],
    "I do not speak Spanish.",
    "ใช้ do not สำหรับประธาน I, You, We, They ในรูปปฏิเสธ"
  ],
  [
    "คำว่า 'วันพุธ' ภาษาอังกฤษคืออะไร?",
    [
      "Monday",
      "Wednesday",
      "Thursday"
    ],
    "Wednesday",
    "Monday = จันทร์, Wednesday = พุธ, Thursday = พฤหัสบดี"
  ],
  [
    "ประโยคใดใช้แนะนำบุคคลอื่น?",
    [
      "This is Alex.",
      "I am Alex.",
      "He is Alex."
    ],
    "This is Alex.",
    "This is... ใช้สำหรับแนะนำบุคคลที่สามให้ผู้อื่นรู้จัก"
  ],
  [
    "ข้อใดคือคำถามที่ถูกต้องเมื่อต้องการทราบราคา?",
    [
      "What does it cost?",
      "How is it cost?",
      "Where is it cost?"
    ],
    "What does it cost?",
    "What does it cost? แปลว่า มันราคาเท่าไร"
  ],
  [
    "ประโยคใดใช้ถามถึงเหตุผล?",
    [
      "Why do you not buy ice cream?",
      "What do you not buy?",
      "Where do you not buy?"
    ],
    "Why do you not buy ice cream?",
    "Why ใช้ถามถึงเหตุผล (ทำไม)"
  ],
  [
    "ประโยคใดแปลว่า 'ยินดีต้อนรับสู่คอร์สภาษาอังกฤษ'?",
    [
      "Welcome to the English course!",
      "Hi and welcome!",
      "Thanks for the course!"
    ],
    "Welcome to the English course!",
    "Welcome to the English course! แปลว่า ยินดีต้อนรับสู่คอร์สภาษาอังกฤษ"
  ],
  [
    "'How is it spelled?' หมายถึงอะไร?",
    [
      "How is it spelled?",
      "What is your name?",
      "Where is it?"
    ],
    "How is it spelled?",
    "How is it spelled? ใช้ถามเพื่อขอให้สะกดคำ"
  ],
  [
    "คำว่า 'first name' ในภาษาอังกฤษหมายถึงอะไร?",
    [
      "ชื่อต้น",
      "นามสกุล",
      "ชื่อเล่น"
    ],
    "ชื่อต้น",
    "First name คือชื่อต้น ส่วน Surname คือนามสกุล"
  ],
  [
    "วันเรียนของคอร์สนี้คือวันใดบ้าง?",
    [
      "Monday, Wednesday and Thursday",
      "Tuesday, Thursday and Friday",
      "Monday, Tuesday and Friday"
    ],
    "Monday, Wednesday and Thursday",
    "จากเนื้อเรื่อง คอร์สเรียนวันจันทร์ พุธ และพฤหัสบดี"
  ],
  [
    "'The course ends at 20.' หมายถึงคอร์สเลิกกี่โมง?",
    [
      "18:00",
      "20:00",
      "22:00"
    ],
    "20:00",
    "20 คือเวลา 20.00 น. หรือสองทุ่ม"
  ],
  [
    "ประโยคใดใช้ถามเกี่ยวกับสัญชาติ?",
    [
      "What is your nationality?",
      "Where are you?",
      "Who are you?"
    ],
    "What is your nationality?",
    "Nationality แปลว่า สัญชาติ"
  ],
  [
    "หากต้องการบอกว่า 'ฉันเป็นชาวบราซิล' ต้องพูดว่าอย่างไร?",
    [
      "I am from Brazil.",
      "I am Brazilian.",
      "I speak Brazilian."
    ],
    "I am Brazilian.",
    "Brazilian คือคำบอกสัญชาติ (ชาวบราซิล)"
  ],
  [
    "หากต้องการบอกว่า 'ฉันเป็นชาวรัสเซีย' ต้องพูดว่าอย่างไร?",
    [
      "I am Russian.",
      "I am from Russia.",
      "I speak Russian."
    ],
    "I am Russian.",
    "Russian คือคำบอกสัญชาติ (ชาวรัสเซีย)"
  ],
  [
    "ประโยคใดใช้ถามว่า 'คุณมาจากที่ไหน'?",
    [
      "Where do you live?",
      "Where are you going?",
      "Where are you from?"
    ],
    "Where are you from?",
    "Where are you from? ใช้ถามถึงถิ่นกำเนิดหรือประเทศที่จากมา"
  ],
  [
    "ประโยคใดใช้ถามว่า 'คุณพูดภาษาอะไร'?",
    [
      "What language do you speak?",
      "What language is it?",
      "Who speaks?"
    ],
    "What language do you speak?",
    "What language do you speak? เป็นประโยคคำถามที่ถูกต้องตามหลักไวยากรณ์"
  ],
  [
    "ข้อใดคือประโยคภาษาอังกฤษที่แปลว่า 'ภาษาแม่ของฉันคือภาษาอังกฤษ'?",
    [
      "My mother tongue is English.",
      "I am English.",
      "I speak English."
    ],
    "My mother tongue is English.",
    "mother tongue แปลว่า ภาษาแม่"
  ],
  [
    "ประโยคใดถูกต้องตามหลักไวยากรณ์สำหรับ 'เขาไม่พูดภาษาสเปน'?",
    [
      "He do not speak Spanish.",
      "He does not speak Spanish.",
      "He not speak Spanish."
    ],
    "He does not speak Spanish.",
    "ประธานเอกพจน์ (He/She/It) ต้องใช้ does not ในประโยคปฏิเสธ"
  ],
  [
    "เลือกคำตอบที่ถูกต้องสำหรับ 'Where do you live?'",
    [
      "I live in Helsinki.",
      "I am in Helsinki.",
      "I go to Helsinki."
    ],
    "I live in Helsinki.",
    "live แปลว่า อาศัยอยู่ ใช้ถามถึงที่พักอาศัย"
  ],
  [
    "การเดินทางด้วยรถเมล์ในภาษาอังกฤษใช้คำบุพบทใด?",
    [
      "by bus",
      "in bus",
      "on bus"
    ],
    "by bus",
    "ใช้ by นำหน้าชื่อพาหนะ เช่น by bus, by car, by train"
  ],
  [
    "จากเนื้อเรื่อง Alex เดินทางกลับบ้านอย่างไร?",
    [
      "by car",
      "by bus",
      "by metro"
    ],
    "by car",
    "ในเนื้อเรื่องระบุว่า Alex drives home by car"
  ],
  [
    "Pedro เดินทางกลับบ้านอย่างไร?",
    [
      "by car",
      "by bus and metro",
      "by bus 75"
    ],
    "by bus and metro",
    "Pedro กล่าวว่า I go home first by bus and then by metro"
  ],
  [
    "คำว่า 'See you tomorrow' แปลว่าอะไร?",
    [
      "เจอกันพรุ่งนี้",
      "ลาก่อน",
      "ขอบคุณ"
    ],
    "เจอกันพรุ่งนี้",
    "tomorrow แปลว่า พรุ่งนี้"
  ],
  [
    "เลือกประโยคที่ถูกต้องสำหรับ 'ฉันไม่ได้อาศัยอยู่ที่ Helsinki แต่ฉันอยู่ที่ Espoo'",
    [
      "I do not live in Helsinki but in Espoo.",
      "I not live in Helsinki but in Espoo.",
      "I do not live in Helsinki and in Espoo."
    ],
    "I do not live in Helsinki but in Espoo.",
    "but ใช้เชื่อมประโยคที่มีความหมายขัดแย้งกัน"
  ],
  [
    "ประโยคใดใช้กริยาได้ถูกต้องสำหรับ 'She ____ ice cream.'",
    [
      "buy",
      "buys",
      "buying"
    ],
    "buys",
    "ประธานเอกพจน์ (She) กริยาต้องเติม -s"
  ],
  [
    "'What language do you speak?' แปลว่าอะไร?",
    [
      "คุณพูดภาษาอะไร",
      "คุณมาจากไหน",
      "คุณชื่ออะไร"
    ],
    "คุณพูดภาษาอะไร",
    "language แปลว่า ภาษา, speak แปลว่า พูด"
  ],
  [
    "Pedro speaks what language?",
    [
      "Spanish",
      "Portuguese",
      "English"
    ],
    "Portuguese",
    "Pedro กล่าวว่า 'In Brazil we speak Portuguese' ดังนั้นเขาพูดภาษาโปรตุเกส"
  ],
  [
    "Olga is from what city?",
    [
      "Moscow",
      "Helsinki",
      "St Petersburg"
    ],
    "St Petersburg",
    "Olga แนะนำตัวว่า 'I am from St Petersburg, Russia'"
  ],
  [
    "Olga does not speak what language?",
    [
      "Russian",
      "English",
      "Spanish"
    ],
    "English",
    "Olga กล่าวว่า 'I do not speak English'"
  ],
  [
    "Alex's mother tongue is",
    [
      "Spanish",
      "English",
      "Portuguese"
    ],
    "English",
    "Alex กล่าวว่า 'My mother tongue is English'"
  ],
  [
    "What is the nationality of someone from Finland?",
    [
      "Finnish",
      "French",
      "Russian"
    ],
    "Finnish",
    "ประเทศ Finland มีสัญชาติคือ Finnish"
  ],
  [
    "What is the nationality of someone from France?",
    [
      "Greek",
      "French",
      "Egyptian"
    ],
    "French",
    "ประเทศ France มีสัญชาติคือ French"
  ],
  [
    "What is the nationality of someone from Greece?",
    [
      "Greek",
      "Icelandic",
      "French"
    ],
    "Greek",
    "ประเทศ Greece มีสัญชาติคือ Greek"
  ],
  [
    "What is the nationality of someone from Iceland?",
    [
      "Egyptian",
      "Icelandic",
      "Pakistani"
    ],
    "Icelandic",
    "ประเทศ Iceland มีสัญชาติคือ Icelandic"
  ],
  [
    "What is the nationality of someone from Egypt?",
    [
      "Pakistani",
      "Russian",
      "Egyptian"
    ],
    "Egyptian",
    "ประเทศ Egypt มีสัญชาติคือ Egyptian"
  ],
  [
    "Which sentence is grammatically correct for the third person singular?",
    [
      "She speak English.",
      "She speaks English.",
      "She do speak English."
    ],
    "She speaks English.",
    "คำกริยาที่ประธานเป็น he/she/it ต้องเติม -s หรือ -es เสมอ"
  ],
  [
    "ประโยคใดถูกต้องสำหรับการบอกว่าคุณมาจากประเทศรัสเซีย?",
    [
      "I am from Russia.",
      "I am in Russia.",
      "I am at Russia."
    ],
    "I am from Russia.",
    "ใช้ 'from' เพื่อบอกแหล่งกำเนิดหรือประเทศที่จากมา"
  ],
  [
    "ภาษาหลักที่ใช้ในประเทศปากีสถานคือภาษาอะไร?",
    [
      "Pakistani",
      "Hindi",
      "Urdu"
    ],
    "Urdu",
    "ชาวปากีสถาน (Pakistani) พูดภาษาอูรดู (Urdu) เป็นภาษาหลัก"
  ],
  [
    "หากต้องการบอกว่าคุณเป็นคนไทย ต้องพูดว่าอย่างไร?",
    [
      "I am Thailand.",
      "I am Thai.",
      "I am a Thai."
    ],
    "I am Thai.",
    "ใช้ชื่อสัญชาติ (Thai) ไม่ใช่ชื่อประเทศ (Thailand) หลัง verb to be"
  ],
  [
    "ประโยคใดถูกต้องตามหลักไวยากรณ์?",
    [
      "I speak English.",
      "I am speak English.",
      "I speaks English."
    ],
    "I speak English.",
    "ประธาน 'I' ใช้กริยาช่องปกติ ไม่ต้องเติม -s"
  ],
  [
    "ประโยคใดถูกต้องสำหรับการบอกว่าคุณพูดภาษาฝรั่งเศสได้?",
    [
      "I speak French.",
      "I am speak French.",
      "I speaking French."
    ],
    "I speak French.",
    "ใช้กริยา 'speak' ตามด้วยชื่อภาษาโดยไม่ต้องมีกริยาช่วย"
  ],
  [
    "ประโยคใดถูกต้องสำหรับการบอกว่าคุณมาจากประเทศฟินแลนด์?",
    [
      "I am in Finland.",
      "I am from Finland.",
      "I am at Finland."
    ],
    "I am from Finland.",
    "ใช้ 'from' เพื่อระบุประเทศต้นทาง"
  ],
  [
    "ประโยคใดถูกต้องสำหรับการบอกว่าคุณมาจากประเทศไอซ์แลนด์?",
    [
      "I am from Iceland.",
      "I am at Iceland.",
      "I am in Iceland."
    ],
    "I am from Iceland.",
    "ใช้ 'from' เพื่อระบุประเทศต้นทาง"
  ],
  [
    "ประโยคใดถูกต้องสำหรับการบอกว่าคุณมาจากประเทศไทย?",
    [
      "I am in Thailand.",
      "I am at Thailand.",
      "I am from Thailand."
    ],
    "I am from Thailand.",
    "ใช้ 'from' เพื่อระบุประเทศต้นทาง"
  ],
  [
    "หากต้องการถามราคาไอศกรีมอย่างเป็นทางการ ควรใช้ประโยคใด?",
    [
      "What does the ice cream cost?",
      "How much is the ice cream?",
      "What is the ice cream price?"
    ],
    "What does the ice cream cost?",
    "ใช้ 'What does... cost?' เพื่อถามราคาของสินค้า"
  ],
  [
    "คำว่า 'Anything else?' ในบริบทการซื้อของหมายถึงอะไร?",
    [
      "คุณต้องการอะไรอีกไหม?",
      "นี่คือทั้งหมดใช่ไหม?",
      "คุณมีเงินพอไหม?"
    ],
    "คุณต้องการอะไรอีกไหม?",
    "ใช้ถามเพื่อตรวจสอบว่าลูกค้าต้องการสั่งสินค้าเพิ่มหรือไม่"
  ],
  [
    "ประโยคใดใช้ถามว่า 'คุณต้องการใบเสร็จไหม' ได้ถูกต้องที่สุด?",
    [
      "Do you need a receipt?",
      "Do you want a receipt?",
      "Is there a receipt?"
    ],
    "Do you need a receipt?",
    "ใช้ 'need' เพื่อถามถึงความจำเป็นในการรับใบเสร็จ"
  ],
  [
    "คำว่า 'จ่ายด้วยบัตร' ในภาษาอังกฤษคือข้อใด?",
    [
      "By card",
      "With card",
      "In card"
    ],
    "By card",
    "การใช้บัตรชำระเงินใช้บุพบท 'by'"
  ],
  [
    "ประโยคใดใช้ถามว่า 'จ่ายรวมกันไหม' ได้ถูกต้อง?",
    [
      "Are these together?",
      "Do you pay together?",
      "Is it the same?"
    ],
    "Are these together?",
    "ใช้ 'together' เพื่อถามว่าต้องการรวมบิลหรือไม่"
  ],
  [
    "ข้อใดคือคำแปลที่ถูกต้องของ 'I am from Johannesburg'?",
    [
      "ฉันมาจากโจฮันเนสเบิร์ก",
      "ฉันอยู่ที่โจฮันเนสเบิร์ก",
      "ฉันไปโจฮันเนสเบิร์ก"
    ],
    "ฉันมาจากโจฮันเนสเบิร์ก",
    "from ใช้บอกสถานที่ต้นทางหรือบ้านเกิด"
  ],
  [
    "ประโยคใดใช้กริยาสำหรับประธาน 'He/She' ได้ถูกต้องตามหลักไวยากรณ์?",
    [
      "He speaks English.",
      "He speak English.",
      "He speaking English."
    ],
    "He speaks English.",
    "ประธานเอกพจน์บุรุษที่ 3 (He/She/It) กริยาต้องเติม -s"
  ],
  [
    "คำถาม 'What language do you speak?' ควรตอบอย่างไร?",
    [
      "I speak Thai.",
      "I am Thai.",
      "I from Thai."
    ],
    "I speak Thai.",
    "คำถามถามถึงภาษาที่พูด ต้องตอบด้วยกริยา speak"
  ],
  [
    "ข้อใดคือการใช้ 'on' กับวันในสัปดาห์ที่ถูกต้อง?",
    [
      "on Monday",
      "in Monday",
      "at Monday"
    ],
    "on Monday",
    "วันในสัปดาห์ต้องใช้บุพบท 'on' เสมอ"
  ],
  [
    "ประโยคปฏิเสธข้อใดถูกต้องสำหรับ 'He'?",
    [
      "He does not speak.",
      "He do not speak.",
      "He not speak."
    ],
    "He does not speak.",
    "ประธานเอกพจน์บุรุษที่ 3 ใช้ 'does not' ในรูปปฏิเสธ"
  ],
  [
    "'What is your nationality?' หมายถึงอะไร?",
    [
      "คุณเป็นคนชาติอะไร",
      "คุณมาจากไหน",
      "คุณพูดภาษาอะไร"
    ],
    "คุณเป็นคนชาติอะไร",
    "nationality หมายถึง สัญชาติ"
  ],
  [
    "ข้อใดคือคำตอบที่ถูกต้องของ 'Where are you from?'",
    [
      "I am from Thailand.",
      "I am Thai.",
      "I speak Thai."
    ],
    "I am from Thailand.",
    "คำถามถามถึงสถานที่ที่จากมา ต้องตอบด้วย from + ชื่อประเทศ"
  ],
  [
    "What is the correct way to say 'ขอบคุณ' in English?",
    [
      "thanks",
      "nice",
      "language"
    ],
    "thanks",
    "คำว่า 'thanks' เป็นคำที่ใช้ขอบคุณในภาษาอังกฤษ"
  ],
  [
    "What does the word 'scoop' refer to in the context of buying ice cream?",
    [
      "scoop",
      "football",
      "cup"
    ],
    "scoop",
    "คำว่า 'scoop' หมายถึง ไอศกรีมหนึ่งลูกหรือหนึ่งสกู๊ป"
  ],
  [
    "If the seller says '10 euros total', what does 'total' mean?",
    [
      "separately",
      "total",
      "correct"
    ],
    "total",
    "คำว่า 'total' หมายถึง ยอดรวมทั้งหมดของราคาสินค้า"
  ],
  [
    "When the seller says 'Right' after an order, what does it mean?",
    [
      "expensive",
      "right / understood",
      "cheap"
    ],
    "right / understood",
    "คำว่า 'Right' ในบริบทนี้ใช้ตอบรับว่าเข้าใจแล้วหรือตกลง"
  ],
  [
    "Why does Olga not buy ice cream in the story?",
    [
      "because she does not like it",
      "because she is saving money",
      "because she has no money"
    ],
    "because she is saving money",
    "จากเนื้อเรื่อง Olga ไม่ซื้อไอศกรีมเพราะเธอกำลังเก็บเงิน (saving money)"
  ]
] as const;

const phrasesQuiz = [
  [
    "What is the English for 'อรุณสวัสดิ์'?",
    [
      "Good morning!",
      "Good day!",
      "Good evening!"
    ],
    "Good morning!",
    "Good morning ใช้ทักทายในช่วงเช้า"
  ],
  [
    "What is the English for 'สวัสดีตอนกลางวัน'?",
    [
      "Good morning!",
      "Good day!",
      "Good evening!"
    ],
    "Good day!",
    "Good day ใช้ทักทายในช่วงกลางวัน"
  ],
  [
    "What is the English for 'สวัสดีตอนเย็น'?",
    [
      "Good morning!",
      "Good day!",
      "Good evening!"
    ],
    "Good evening!",
    "Good evening ใช้ทักทายในช่วงเย็น"
  ],
  [
    "What is the English for 'ราตรีสวัสดิ์'?",
    [
      "Good night!",
      "Good day!",
      "Good evening!"
    ],
    "Good night!",
    "Good night ใช้พูดก่อนเข้านอน"
  ],
  [
    "Which phrase is used for an informal greeting?",
    [
      "Good day!",
      "Hi!",
      "Goodbye!"
    ],
    "Hi!",
    "Hi เป็นคำทักทายแบบไม่เป็นทางการ"
  ],
  [
    "Which phrase is used for an informal farewell?",
    [
      "Bye bye!",
      "Welcome!",
      "Good day!"
    ],
    "Bye bye!",
    "Bye bye เป็นคำลาแบบไม่เป็นทางการ"
  ],
  [
    "Which phrase is formal for saying goodbye?",
    [
      "Bye bye!",
      "See you / Goodbye!",
      "Hi!"
    ],
    "See you / Goodbye!",
    "Goodbye เป็นทางการกว่า Bye bye"
  ],
  [
    "What is the English for 'พบกันพรุ่งนี้'?",
    [
      "See you tomorrow!",
      "See you!",
      "Goodbye!"
    ],
    "See you tomorrow!",
    "tomorrow แปลว่า พรุ่งนี้"
  ],
  [
    "What do you say when meeting someone for the first time?",
    [
      "Nice to meet you!",
      "Welcome!",
      "Thanks!"
    ],
    "Nice to meet you!",
    "ใช้เมื่อแนะนำตัวหรือพบคนใหม่ครั้งแรก"
  ],
  [
    "How do you introduce a person named Tiina?",
    [
      "Who is Tiina?",
      "This is Tiina.",
      "Tiina is here."
    ],
    "This is Tiina.",
    "This is... ใช้สำหรับแนะนำบุคคล"
  ],
  [
    "How do you respond to 'Nice to meet you'?",
    [
      "You are welcome!",
      "Nice to meet you too!",
      "No problem!"
    ],
    "Nice to meet you too!",
    "เติม too เพื่อบอกว่ายินดีที่ได้รู้จักเช่นกัน"
  ],
  [
    "What do you say to welcome someone?",
    [
      "Welcome!",
      "Nice to meet you!",
      "See you!"
    ],
    "Welcome!",
    "Welcome ใช้ต้อนรับผู้มาเยือน"
  ],
  [
    "Which word is the standard way to say 'ใช่'?",
    [
      "Yes.",
      "No.",
      "Maybe."
    ],
    "Yes.",
    "Yes เป็นคำตอบรับที่เป็นมาตรฐาน"
  ],
  [
    "How do you respond to 'Thanks'?",
    [
      "You are welcome!",
      "Excuse me!",
      "No problem!"
    ],
    "You are welcome!",
    "You are welcome เป็นการตอบรับคำขอบคุณที่สุภาพ"
  ],
  [
    "What is the most common way to say 'ขอบคุณ'?",
    [
      "Thanks!",
      "Excuse me!",
      "Welcome!"
    ],
    "Thanks!",
    "Thanks เป็นคำที่ใช้บ่อยที่สุดในภาษาอังกฤษ"
  ],
  [
    "Which phrase is a casual reply to 'Thanks'?",
    [
      "It is nothing!",
      "No problem!",
      "Excuse me!"
    ],
    "No problem!",
    "No problem เป็นการตอบรับแบบกันเอง"
  ],
  [
    "What do you say to get someone's attention?",
    [
      "Excuse me!",
      "It is nothing!",
      "You are welcome!"
    ],
    "Excuse me!",
    "Excuse me ใช้ขอโทษหรือขออนุญาต"
  ],
  [
    "How do you respond to an apology?",
    [
      "It is nothing!",
      "You are welcome!",
      "No problem!"
    ],
    "It is nothing!",
    "It is nothing ใช้ตอบรับเมื่อมีคนขอโทษ"
  ],
  [
    "What do you say when drinking together?",
    [
      "Cheers!",
      "Enjoy your meal!",
      "Thanks!"
    ],
    "Cheers!",
    "Cheers ใช้พูดเวลาชนแก้ว"
  ],
  [
    "What do you say before someone eats?",
    [
      "Enjoy your meal!",
      "Thanks for the food!",
      "Cheers!"
    ],
    "Enjoy your meal!",
    "Enjoy your meal แปลว่า ขอให้ทานให้อร่อย"
  ],
  [
    "What do you say after eating?",
    [
      "Thanks for the food!",
      "Enjoy your meal!",
      "Cheers!"
    ],
    "Thanks for the food!",
    "ใช้ขอบคุณสำหรับมื้ออาหาร"
  ],
  [
    "How do you say 'ขอบคุณ มันอร่อยมาก'?",
    [
      "Thanks, it was good.",
      "Thanks for the food!",
      "Enjoy your meal!"
    ],
    "Thanks, it was good.",
    "it was good แปลว่า มันอร่อย/มันดี"
  ],
  [
    "Which of these are correct replies to 'Thanks'?",
    [
      "Nice to meet you too!",
      "You are welcome! / No problem!",
      "Excuse me!"
    ],
    "You are welcome! / No problem!",
    "ทั้งสองประโยคใช้ตอบรับคำขอบคุณได้ถูกต้อง"
  ]
] as const;

const daysQuiz = [
  [
    "'Monday' is",
    [
      "Tuesday",
      "Monday",
      "Wednesday"
    ],
    "Monday",
    "Monday คือวันจันทร์"
  ],
  [
    "'Tuesday' is",
    [
      "Thursday",
      "Tuesday",
      "Friday"
    ],
    "Tuesday",
    "Tuesday คือวันอังคาร"
  ],
  [
    "'Wednesday' is",
    [
      "Thursday",
      "Friday",
      "Wednesday"
    ],
    "Wednesday",
    "Wednesday คือวันพุธ"
  ],
  [
    "'Thursday' is",
    [
      "Tuesday",
      "Friday",
      "Thursday"
    ],
    "Thursday",
    "Thursday คือวันพฤหัสบดี"
  ],
  [
    "'Friday' is",
    [
      "Saturday",
      "Friday",
      "Thursday"
    ],
    "Friday",
    "Friday คือวันศุกร์"
  ],
  [
    "'Saturday' is",
    [
      "Sunday",
      "Friday",
      "Saturday"
    ],
    "Saturday",
    "Saturday คือวันเสาร์"
  ],
  [
    "'Sunday' is",
    [
      "Saturday",
      "Sunday",
      "Monday"
    ],
    "Sunday",
    "Sunday คือวันอาทิตย์"
  ],
  [
    "'Weekend' is",
    [
      "weekday",
      "weekend",
      "week"
    ],
    "weekend",
    "Weekend หมายถึงวันเสาร์และอาทิตย์"
  ],
  [
    "'On Monday' (When?) uses",
    [
      "Monday",
      "in Monday",
      "on Monday"
    ],
    "on Monday",
    "ใช้ on นำหน้าวัน"
  ],
  [
    "'On Wednesday' uses",
    [
      "Wednesday",
      "in Wednesday",
      "on Wednesday"
    ],
    "on Wednesday",
    "ใช้ on นำหน้าวัน"
  ],
  [
    "'On the weekend' uses",
    [
      "weekend",
      "in weekend",
      "on the weekend"
    ],
    "on the weekend",
    "ใช้ on นำหน้า weekend"
  ],
  [
    "'The day before yesterday' is",
    [
      "yesterday",
      "the day after tomorrow",
      "the day before yesterday"
    ],
    "the day before yesterday",
    "หมายถึงเมื่อวานซืน"
  ],
  [
    "'Yesterday' is",
    [
      "the day before yesterday",
      "yesterday",
      "today"
    ],
    "yesterday",
    "หมายถึงเมื่อวาน"
  ],
  [
    "'Today' is",
    [
      "yesterday",
      "today",
      "tomorrow"
    ],
    "today",
    "หมายถึงวันนี้"
  ],
  [
    "'Tomorrow' is",
    [
      "the day after tomorrow",
      "tomorrow",
      "today"
    ],
    "tomorrow",
    "หมายถึงพรุ่งนี้"
  ],
  [
    "'The day after tomorrow' is",
    [
      "tomorrow",
      "the day before yesterday",
      "the day after tomorrow"
    ],
    "the day after tomorrow",
    "หมายถึงมะรืน"
  ],
  [
    "Ask 'What day is it today?'",
    [
      "When is today?",
      "Where is the day?",
      "What day is it today?"
    ],
    "What day is it today?",
    "ใช้ถามเพื่อระบุวันปัจจุบัน"
  ],
  [
    "Ask 'When is the course?'",
    [
      "What is the course?",
      "When is the course?",
      "Where is the course?"
    ],
    "When is the course?",
    "ใช้ when ถามถึงเวลาหรือวัน"
  ],
  [
    "Answer 'What day is it today?' uses",
    [
      "on Monday",
      "Monday",
      "in Monday"
    ],
    "Monday",
    "ถามวันใช้คำนามปกติ ไม่ต้องมีบุพบท"
  ]
] as const;

const numbersQuiz = [
  [
    "What is the correct spelling of the number 11?",
    [
      "eleven",
      "elven",
      "elevenn"
    ],
    "eleven",
    "11 คือ eleven (สิบเอ็ด)"
  ],
  [
    "What is the correct spelling of the number 12?",
    [
      "twelve",
      "twelv",
      "twelvee"
    ],
    "twelve",
    "12 คือ twelve (สิบสอง)"
  ],
  [
    "Which sentence is grammatically correct?",
    [
      "She speak English.",
      "She speaks English.",
      "She speaking English."
    ],
    "She speaks English.",
    "ประธานเอกพจน์ (he/she/it) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "What is the correct article for 'English course'?",
    [
      "a English course",
      "an English course",
      "the English course"
    ],
    "an English course",
    "ใช้ an นำหน้าคำที่ขึ้นต้นด้วยเสียงสระ (English)"
  ],
  [
    "Which question is correct?",
    [
      "Where you are from?",
      "Where are you from?",
      "Where do you from?"
    ],
    "Where are you from?",
    "การถามที่มาใช้โครงสร้าง Where + verb to be + subject"
  ],
  [
    "How do you say 'วันจันทร์' in English?",
    [
      "Monday",
      "Tuesday",
      "Wednesday"
    ],
    "Monday",
    "Monday คือ วันจันทร์"
  ],
  [
    "What is the correct negative form?",
    [
      "He do not speak.",
      "He does not speak.",
      "He not speak."
    ],
    "He does not speak.",
    "ประธานเอกพจน์ (he) ใช้ does not ในรูปปฏิเสธ"
  ],
  [
    "Which word is used to ask about a person?",
    [
      "What",
      "Who",
      "Where"
    ],
    "Who",
    "Who ใช้ถามถึงบุคคล (ใคร)"
  ],
  [
    "What is the correct spelling of the number 15?",
    [
      "fifteen",
      "fiveteen",
      "fiften"
    ],
    "fifteen",
    "15 คือ fifteen (สิบห้า)"
  ],
  [
    "Which sentence correctly uses a preposition?",
    [
      "I live at Helsinki.",
      "I live in Helsinki.",
      "I live on Helsinki."
    ],
    "I live in Helsinki.",
    "ใช้ in นำหน้าชื่อเมืองหรือประเทศ"
  ],
  [
    "'___ egg' ควรเติมคำนำหน้า (Article) ข้อใด?",
    [
      "A",
      "An",
      "Are"
    ],
    "An",
    "ใช้ 'an' นำหน้าคำนามที่ขึ้นต้นด้วยเสียงสระ (a, e, i, o, u)"
  ],
  [
    "เลข 11 ในภาษาอังกฤษเขียนอย่างไร?",
    [
      "oneteen",
      "eleven",
      "ten-one"
    ],
    "eleven",
    "11 เป็นคำยกเว้น ไม่ใช้รูป -teen เหมือนเลข 13-19"
  ],
  [
    "เลข 12 ในภาษาอังกฤษเขียนอย่างไร?",
    [
      "twelve",
      "twoteen",
      "twentee"
    ],
    "twelve",
    "12 เป็นคำยกเว้น ไม่ใช้รูป -teen"
  ],
  [
    "'He ___ every day.' ควรเติมคำกริยาในรูป Present Simple ข้อใด?",
    [
      "run",
      "runs",
      "running"
    ],
    "runs",
    "ประธานเอกพจน์ (He, She, It) กริยาต้องเติม s หรือ es"
  ],
  [
    "ข้อใดคือการเรียงลำดับประโยคคำถามที่ถูกต้อง?",
    [
      "You do like tea?",
      "Do you like tea?",
      "Like you tea?"
    ],
    "Do you like tea?",
    "ประโยคคำถามต้องใช้กริยาช่วย (Do/Does) วางไว้หน้าประธาน"
  ],
  [
    "'Sarah is kind. I like ___.' ควรเติมสรรพนามข้อใด?",
    [
      "she",
      "her",
      "hers"
    ],
    "her",
    "ใช้ 'her' เป็นสรรพนามรูปกรรม (Object Pronoun)"
  ],
  [
    "'I was born ___ 1995.' ควรเติมคำบุพบทข้อใด?",
    [
      "in",
      "on",
      "at"
    ],
    "in",
    "ใช้ 'in' กับปี ค.ศ. หรือเดือน"
  ],
  [
    "ข้อใดเขียนประโยคได้ถูกต้องตามหลักภาษา?",
    [
      "i dont know.",
      "I don't know.",
      "I dont know."
    ],
    "I don't know.",
    "ประโยคต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่ และ don't ต้องมีเครื่องหมาย apostrophe"
  ],
  [
    "ประโยค 'It is ___ cat' ควรใช้คำนำหน้า (Article) ใด?",
    [
      "a",
      "an",
      "am"
    ],
    "a",
    "ใช้ a นำหน้าคำนามนับได้เอกพจน์ที่ขึ้นต้นด้วยเสียงพยัญชนะ"
  ],
  [
    "ประโยค 'I am ___ Thailand' (ฉันอยู่ในประเทศไทย) ควรใช้คำบุพบท (Preposition) ใด?",
    [
      "in",
      "on",
      "at"
    ],
    "in",
    "ใช้ in กับชื่อประเทศหรือเมืองใหญ่"
  ],
  [
    "1,000 is",
    [
      "one hundred",
      "one thousand",
      "ten thousand"
    ],
    "one thousand",
    "1,000 อ่านว่า one thousand"
  ],
  [
    "2,000 is",
    [
      "two thousand",
      "two hundred",
      "twenty thousand"
    ],
    "two thousand",
    "2,000 อ่านว่า two thousand"
  ],
  [
    "1,000,000 is",
    [
      "one billion",
      "one million",
      "one hundred thousand"
    ],
    "one million",
    "1,000,000 อ่านว่า one million"
  ],
  [
    "2,000,000 is",
    [
      "two million",
      "two billion",
      "two hundred thousand"
    ],
    "two million",
    "2,000,000 อ่านว่า two million"
  ],
  [
    "1,000,000,000 is",
    [
      "one million",
      "one billion",
      "one trillion"
    ],
    "one billion",
    "1,000,000,000 อ่านว่า one billion"
  ],
  [
    "Numbers 13–19 end with",
    [
      "-teen",
      "-ty",
      "-th"
    ],
    "-teen",
    "เลข 13-19 จะลงท้ายด้วย -teen เช่น thirteen, fourteen"
  ],
  [
    "Tens like 20, 30, 40 end with",
    [
      "-teen",
      "-ty",
      "-th"
    ],
    "-ty",
    "เลขหลักสิบจะลงท้ายด้วย -ty เช่น twenty, thirty, forty"
  ],
  [
    "How do you ask someone's age?",
    [
      "What is your age?",
      "How old are you?",
      "How many years?"
    ],
    "How old are you?",
    "การถามอายุใช้ประโยคว่า How old are you?"
  ]
] as const;

const pronounsQuiz = [
  [
    "I + be is",
    [
      "are",
      "is",
      "am"
    ],
    "am",
    "I ใช้กับ am เสมอ (I am = ฉันเป็น/อยู่)"
  ],
  [
    "you + be is",
    [
      "am",
      "are",
      "is"
    ],
    "are",
    "you ใช้กับ are เสมอ (you are = คุณเป็น/อยู่)"
  ],
  [
    "he / she / it + be is",
    [
      "am",
      "is",
      "are"
    ],
    "is",
    "he/she/it ใช้กับ is (he is = เขาเป็น)"
  ],
  [
    "we + be is",
    [
      "are",
      "is",
      "am"
    ],
    "are",
    "we ใช้กับ are (we are = พวกเราเป็น)"
  ],
  [
    "you (plural) + be is",
    [
      "am",
      "are",
      "is"
    ],
    "are",
    "you (พวกคุณ) ใช้กับ are เสมอ"
  ],
  [
    "they + be is",
    [
      "are",
      "is",
      "am"
    ],
    "are",
    "they ใช้กับ are (they are = พวกเขาเป็น)"
  ],
  [
    "I am (contraction) is",
    [
      "you're",
      "I'm",
      "we're"
    ],
    "I'm",
    "I am ย่อเป็น I'm"
  ],
  [
    "you are (contraction) is",
    [
      "I'm",
      "it's",
      "you're"
    ],
    "you're",
    "you are ย่อเป็น you're"
  ],
  [
    "he is (contraction) is",
    [
      "he's",
      "it's",
      "they're"
    ],
    "he's",
    "he is ย่อเป็น he's"
  ],
  [
    "we are (contraction) is",
    [
      "we're",
      "they're",
      "it's"
    ],
    "we're",
    "we are ย่อเป็น we're"
  ],
  [
    "they are (contraction) is",
    [
      "they're",
      "it's",
      "we're"
    ],
    "they're",
    "they are ย่อเป็น they're"
  ],
  [
    "it is (contraction) is",
    [
      "it's",
      "he's",
      "they're"
    ],
    "it's",
    "it is ย่อเป็น it's"
  ],
  [
    "he/she is used for",
    [
      "animals",
      "people",
      "things"
    ],
    "people",
    "he/she ใช้เรียกคน ส่วน it ใช้เรียกสิ่งของหรือสัตว์"
  ],
  [
    "What is the correct sentence?",
    [
      "I am a student.",
      "I is a student.",
      "I are a student."
    ],
    "I am a student.",
    "I ต้องใช้คู่กับ am เสมอ"
  ],
  [
    "What is the correct sentence?",
    [
      "We is in Finland.",
      "We are in Finland.",
      "We am in Finland."
    ],
    "We are in Finland.",
    "We ต้องใช้คู่กับ are"
  ],
  [
    "What is the correct sentence?",
    [
      "She are a teacher.",
      "She am a teacher.",
      "She is a teacher."
    ],
    "She is a teacher.",
    "She (เอกพจน์) ต้องใช้คู่กับ is"
  ]
] as const;

const harmonyQuiz = [
  [
    "Which sentence uses the correct article?",
    [
      "I am a teacher.",
      "I am an teacher.",
      "I am the teacher."
    ],
    "I am a teacher.",
    "ใช้ 'a' นำหน้าคำนามที่ขึ้นต้นด้วยเสียงพยัญชนะ"
  ],
  [
    "Which sentence uses the correct article?",
    [
      "She is a engineer.",
      "She is an engineer.",
      "She is the engineer."
    ],
    "She is an engineer.",
    "ใช้ 'an' นำหน้าคำนามที่ขึ้นต้นด้วยเสียงสระ (a, e, i, o, u)"
  ],
  [
    "What is the correct verb form for 'He'?",
    [
      "He speak English.",
      "He speaks English.",
      "He speaking English."
    ],
    "He speaks English.",
    "ประธานเอกพจน์บุรุษที่ 3 (He/She/It) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "What is the correct negative form?",
    [
      "She do not speak Spanish.",
      "She does not speak Spanish.",
      "She not speak Spanish."
    ],
    "She does not speak Spanish.",
    "ใช้ 'does not' สำหรับประธาน He/She/It"
  ],
  [
    "Which preposition is correct for days?",
    [
      "in Monday",
      "at Monday",
      "on Monday"
    ],
    "on Monday",
    "ใช้ 'on' นำหน้าวันในสัปดาห์"
  ],
  [
    "Which preposition is correct for time?",
    [
      "in 18:00",
      "at 18:00",
      "on 18:00"
    ],
    "at 18:00",
    "ใช้ 'at' นำหน้าเวลา"
  ],
  [
    "Which preposition is correct for locations?",
    [
      "in Helsinki",
      "at Helsinki",
      "on Helsinki"
    ],
    "in Helsinki",
    "ใช้ 'in' นำหน้าชื่อเมืองหรือประเทศ"
  ],
  [
    "How do you say '11' in English?",
    [
      "eleven",
      "ten-one",
      "eleventeen"
    ],
    "eleven",
    "11 คือ eleven"
  ],
  [
    "How do you say '13' in English?",
    [
      "thirteen",
      "threeteen",
      "three-ten"
    ],
    "thirteen",
    "13 คือ thirteen"
  ],
  [
    "Which question is grammatically correct?",
    [
      "What you do speak?",
      "What do you speak?",
      "What does you speak?"
    ],
    "What do you speak?",
    "ใช้ 'do' กับประธาน 'you' ในประโยคคำถาม"
  ],
  [
    "Which question is grammatically correct?",
    [
      "Where does she live?",
      "Where do she live?",
      "Where she lives?"
    ],
    "Where does she live?",
    "ใช้ 'does' กับประธาน 'she' ในประโยคคำถาม"
  ],
  [
    "What is the correct nationality for Brazil?",
    [
      "Brazilian",
      "Brazilish",
      "Brazilan"
    ],
    "Brazilian",
    "ชาวบราซิลคือ Brazilian"
  ],
  [
    "What is the correct nationality for Russia?",
    [
      "Russian",
      "Russiaish",
      "Russier"
    ],
    "Russian",
    "ชาวรัสเซียคือ Russian"
  ],
  [
    "Which word is the correct spelling for 15?",
    [
      "fifteen",
      "fiveteen",
      "fivteen"
    ],
    "fifteen",
    "15 คือ fifteen"
  ],
  [
    "Which word is the correct spelling for 40?",
    [
      "fourty",
      "forty",
      "four-ty"
    ],
    "forty",
    "40 คือ forty (ไม่มี u)"
  ],
  [
    "Which sentence is correct?",
    [
      "I go to home.",
      "I go home.",
      "I go at home."
    ],
    "I go home.",
    "คำว่า home ไม่ต้องใช้ preposition นำหน้าเมื่อใช้กับกริยา go"
  ],
  [
    "Which sentence is correct?",
    [
      "I go by bus.",
      "I go with bus.",
      "I go in bus."
    ],
    "I go by bus.",
    "ใช้ 'by' นำหน้าพาหนะเพื่อบอกวิธีการเดินทาง"
  ],
  [
    "What is the correct plural of 'ice cream'?",
    [
      "ice creams",
      "ice cream",
      "ice creamses"
    ],
    "ice cream",
    "ice cream เป็นนามนับไม่ได้ในบริบทนี้ จึงไม่ต้องเติม s"
  ]
] as const;

const verbsQuiz = [
  [
    "Which sentence is grammatically correct?",
    [
      "She speak English.",
      "She speaks English.",
      "She speaking English."
    ],
    "She speaks English.",
    "ประธานเอกพจน์บุรุษที่ 3 (he, she, it) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "What is the correct way to say 'I' in a negative sentence?",
    [
      "I does not speak.",
      "I do not speak.",
      "I am not speak."
    ],
    "I do not speak.",
    "ใช้ do not กับประธาน I, you, we, they"
  ],
  [
    "Which question is correct for asking about nationality?",
    [
      "What is your nationality?",
      "Where is your nationality?",
      "Who is your nationality?"
    ],
    "What is your nationality?",
    "ใช้ What เพื่อถามเกี่ยวกับข้อมูลทั่วไปหรือสัญชาติ"
  ],
  [
    "How do you correctly ask where someone lives?",
    [
      "Where you live?",
      "Where do you live?",
      "Where does you live?"
    ],
    "Where do you live?",
    "การสร้างคำถามที่ขึ้นต้นด้วย Where ต้องใช้ do/does ช่วย"
  ],
  [
    "Choose the correct verb form for 'They'.",
    [
      "They speaks Thai.",
      "They speak Thai.",
      "They speaking Thai."
    ],
    "They speak Thai.",
    "ประธานพหูพจน์ (I, you, we, they) ใช้กริยาช่องที่ 1 โดยไม่ต้องเติม -s"
  ],
  [
    "Which sentence correctly uses the article 'an'?",
    [
      "I have a apple.",
      "I have an apple.",
      "I have the apple."
    ],
    "I have an apple.",
    "ใช้ an นำหน้าคำนามที่ขึ้นต้นด้วยเสียงสระ (a, e, i, o, u)"
  ],
  [
    "What is the correct response to 'How are you?'",
    [
      "I am fine, thanks.",
      "I am fine, please.",
      "I am fine, welcome."
    ],
    "I am fine, thanks.",
    "เมื่อมีคนถามสารทุกข์สุกดิบ ควรตอบว่า I am fine และขอบคุณ"
  ],
  [
    "Which sentence is correct regarding the ice cream price?",
    [
      "The ice cream cost 3 euros.",
      "The ice cream costs 3 euros.",
      "The ice cream is cost 3 euros."
    ],
    "The ice cream costs 3 euros.",
    "ประธานคือ The ice cream (it) กริยาต้องเติม -s"
  ],
  [
    "How do you ask about a person's name?",
    [
      "Who are you?",
      "What are you?",
      "Where are you?"
    ],
    "Who are you?",
    "ใช้ Who เพื่อถามเกี่ยวกับบุคคล"
  ],
  [
    "Which sentence correctly describes the course days?",
    [
      "The course is on Monday.",
      "The course is in Monday.",
      "The course is at Monday."
    ],
    "The course is on Monday.",
    "ใช้บุพบท on นำหน้าชื่อวันในสัปดาห์"
  ],
  [
    "Which sentence is grammatically correct for the third person singular?",
    [
      "He speak English.",
      "He speaks English.",
      "He speaking English."
    ],
    "He speaks English.",
    "ประธานเอกพจน์บุรุษที่ 3 (he/she/it) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "What is the correct negative form for 'She speaks Spanish'?",
    [
      "She do not speak Spanish.",
      "She does not speaks Spanish.",
      "She does not speak Spanish."
    ],
    "She does not speak Spanish.",
    "เมื่อใช้ does not แล้ว กริยาหลักต้องกลับมาเป็นรูปปกติ (infinitive) ไม่เติม -s"
  ],
  [
    "Which option correctly completes the sentence: 'I ___ from Thailand.'",
    [
      "am",
      "is",
      "are"
    ],
    "am",
    "I ใช้คู่กับ am เสมอ"
  ],
  [
    "Choose the correct question word: '___ are you from?'",
    [
      "What",
      "Where",
      "Who"
    ],
    "Where",
    "Where ใช้ถามถึงสถานที่หรือที่มา"
  ],
  [
    "Which sentence uses the correct article?",
    [
      "I am a teacher.",
      "I am an teacher.",
      "I am the teacher."
    ],
    "I am a teacher.",
    "ใช้ a นำหน้าคำนามที่ขึ้นต้นด้วยเสียงพยัญชนะ"
  ],
  [
    "What is the correct way to say '15' in English?",
    [
      "fiveteen",
      "fifteen",
      "fifteteen"
    ],
    "fifteen",
    "15 คือ fifteen (สะกดด้วย f-i-f-t-e-e-n)"
  ],
  [
    "Which sentence is correct for the plural subject?",
    [
      "They speaks Russian.",
      "They speak Russian.",
      "They speaking Russian."
    ],
    "They speak Russian.",
    "ประธานพหูพจน์ (I, you, we, they) กริยาไม่ต้องเติม -s"
  ],
  [
    "Choose the correct negative form: 'We ___ live in Helsinki.'",
    [
      "do not",
      "does not",
      "is not"
    ],
    "do not",
    "We ใช้คู่กับ do not ในรูปปฏิเสธ"
  ],
  [
    "Which question is correct?",
    [
      "What language you speak?",
      "Do you speak what language?",
      "What language do you speak?"
    ],
    "What language do you speak?",
    "การตั้งคำถามต้องใช้กริยาช่วย do/does วางหน้าประธาน"
  ],
  [
    "Complete the sentence: 'The course is ___ Monday.'",
    [
      "in",
      "on",
      "at"
    ],
    "on",
    "ใช้ on นำหน้าชื่อวันในสัปดาห์"
  ],
  [
    "ประโยคปฏิเสธของ 'we speak' คือข้อใด",
    [
      "we do not speak",
      "we does not speak",
      "we not speak"
    ],
    "we do not speak",
    "ในภาษาอังกฤษ เราใช้ 'do not' (หรือ don't) วางหน้าคำกริยาสำหรับประธาน I, You, We, They"
  ],
  [
    "ประโยคปฏิเสธของ 'he speaks' คือข้อใด",
    [
      "he does not speak",
      "he do not speak",
      "he not speaks"
    ],
    "he does not speak",
    "เมื่อประธานเป็น He, She, It เราต้องใช้ 'does not' (หรือ doesn't) และเปลี่ยนกริยาจาก speaks กลับเป็นรูปปกติ (speak)"
  ],
  [
    "ข้อใดคือโครงสร้างที่ถูกต้องของประโยคปฏิเสธในภาษาอังกฤษ",
    [
      "do/does + not + verb",
      "not + do/does + verb",
      "verb + do/does + not"
    ],
    "do/does + not + verb",
    "โครงสร้างประโยคปฏิเสธคือ ประธาน + do/does + not + กริยาช่องที่ 1 (infinitive)"
  ]
] as const;

const questionsQuiz = [
  [
    "'Who' ใช้ถามเกี่ยวกับอะไร",
    [
      "บุคคล",
      "สถานที่",
      "เวลา"
    ],
    "บุคคล",
    "Who ใช้ถามถึงบุคคล เช่น Who are you? = คุณคือใคร"
  ],
  [
    "'What' ใช้ถามเกี่ยวกับอะไร (เมื่อใช้กับกริยา be)",
    [
      "อะไร",
      "ที่ไหน",
      "ใคร"
    ],
    "อะไร",
    "What ใช้ถามถึงสิ่งของหรือข้อมูล เช่น What day is it today?"
  ],
  [
    "'What' ใช้ถามเกี่ยวกับอะไร (เมื่อใช้กับกริยาอื่น)",
    [
      "อะไร",
      "ที่ไหน",
      "ใคร"
    ],
    "อะไร",
    "What ใช้ถามถึงสิ่งที่กระทำ เช่น What language do you speak?"
  ],
  [
    "'When' ใช้ถามเกี่ยวกับอะไร",
    [
      "ที่ไหน",
      "ทำไม",
      "เมื่อไร"
    ],
    "เมื่อไร",
    "When ใช้ถามถึงเวลา เช่น When is the course?"
  ],
  [
    "'What nationality' ใช้ถามเกี่ยวกับอะไร",
    [
      "จากไหน",
      "ใคร",
      "สัญชาติ"
    ],
    "สัญชาติ",
    "What nationality ใช้ถามถึงสัญชาติ เช่น What is Pedro's nationality?"
  ],
  [
    "'Where' (ที่อยู่) ใช้ถามเกี่ยวกับอะไร",
    [
      "จากไหน",
      "ที่ไหน",
      "ไปที่ไหน"
    ],
    "ที่ไหน",
    "Where ใช้ถามถึงสถานที่ที่อาศัยอยู่ เช่น Where do you live?"
  ],
  [
    "'Where from' ใช้ถามเกี่ยวกับอะไร",
    [
      "ที่ไหน",
      "ไปที่ไหน",
      "มาจากไหน"
    ],
    "มาจากไหน",
    "Where from ใช้ถามถึงต้นกำเนิด เช่น Where are you from?"
  ],
  [
    "'Where to' ใช้ถามเกี่ยวกับอะไร",
    [
      "ที่ไหน",
      "มาจากไหน",
      "ไปที่ไหน"
    ],
    "ไปที่ไหน",
    "Where to ใช้ถามถึงจุดหมายปลายทาง เช่น Where are you going?"
  ],
  [
    "'Why' ใช้ถามเกี่ยวกับอะไร",
    [
      "อะไร",
      "ทำไม",
      "เมื่อไร"
    ],
    "ทำไม",
    "Why ใช้ถามถึงเหตุผล เช่น Why do you not buy ice cream? ตอบด้วย Because..."
  ],
  [
    "'How' ใช้ถามเกี่ยวกับอะไร",
    [
      "อะไร",
      "อย่างไร",
      "ที่ไหน"
    ],
    "อย่างไร",
    "How ใช้ถามถึงวิธีการหรืออายุ เช่น How old are you?"
  ],
  [
    "เปลี่ยนประโยค 'You are English.' ให้เป็นคำถาม",
    [
      "Are you English?",
      "Is you English?",
      "Do you English?"
    ],
    "Are you English?",
    "ใช้กริยา be วางไว้หน้าประธาน"
  ],
  [
    "เปลี่ยนประโยค 'He lives in London.' ให้เป็นคำถาม",
    [
      "Do he live in London?",
      "Does he live in London?",
      "Is he live in London?"
    ],
    "Does he live in London?",
    "ใช้ Does สำหรับประธานเอกพจน์บุรุษที่ 3"
  ],
  [
    "เปลี่ยนประโยค 'You do not speak Thai.' ให้เป็นคำถาม",
    [
      "Do you not speak Thai?",
      "Does you not speak Thai?",
      "Are you not speak Thai?"
    ],
    "Do you not speak Thai?",
    "ใช้ Do วางไว้หน้าประธานเพื่อสร้างคำถามปฏิเสธ"
  ],
  [
    "คำถาม Yes/No ในภาษาอังกฤษมักมีระดับเสียงอย่างไร",
    [
      "เสียงต่ำลง",
      "เสียงสูงขึ้น",
      "เสียงราบเรียบ"
    ],
    "เสียงสูงขึ้น",
    "คำถาม Yes/No มักใช้เสียงสูงขึ้นที่ท้ายประโยค"
  ],
  [
    "คำตอบสำหรับ 'Do you live in Helsinki?'",
    [
      "I am.",
      "I do.",
      "I live."
    ],
    "I do.",
    "ตอบด้วยกริยาช่วยที่ใช้ในคำถาม"
  ],
  [
    "คำตอบปฏิเสธสำหรับ 'Do you live in Helsinki?'",
    [
      "No, I do not.",
      "No, I am not.",
      "No, I not."
    ],
    "No, I do not.",
    "ใช้ I do not สำหรับประธาน I"
  ],
  [
    "คำตอบสำหรับ 'Do you speak English?' (ตอบในนามพวกเรา)",
    [
      "We speak.",
      "We do.",
      "We are."
    ],
    "We do.",
    "ตอบด้วยกริยาช่วยที่ใช้ในคำถาม"
  ],
  [
    "คำตอบปฏิเสธสำหรับ 'Do you speak English?' (ตอบในนามพวกเรา)",
    [
      "We do not.",
      "We are not.",
      "We not."
    ],
    "We do not.",
    "ใช้ We do not สำหรับประธาน We"
  ],
  [
    "คำตอบสำหรับ 'Does he speak English?'",
    [
      "He does.",
      "He speaks.",
      "He is."
    ],
    "He does.",
    "ตอบด้วยกริยาช่วยที่ใช้ในคำถาม"
  ],
  [
    "คำตอบปฏิเสธสำหรับ 'Does he speak English?'",
    [
      "He does not.",
      "He is not.",
      "He not."
    ],
    "He does not.",
    "ใช้ He does not สำหรับประธาน He"
  ],
  [
    "คำถาม Wh- (เช่น Who, What, Where) มักมีระดับเสียงอย่างไร",
    [
      "เสียงสูงขึ้น",
      "เสียงต่ำลง",
      "เสียงราบเรียบ"
    ],
    "เสียงต่ำลง",
    "คำถาม Wh- มักใช้เสียงต่ำลงที่ท้ายประโยค"
  ],
  [
    "โครงสร้างประโยคคำถาม Wh- ที่ถูกต้องคืออะไร",
    [
      "กริยา + ประธาน + คำถาม",
      "คำถาม + ประธาน + กริยา",
      "คำถาม + กริยา + ประธาน"
    ],
    "คำถาม + ประธาน + กริยา",
    "เช่น Who are you? หรือ What language do you speak?"
  ],
  [
    "คำว่า 'a' หรือ 'an' ใช้หน้าคำนามอย่างไร",
    [
      "ใช้หน้าคำนามนับได้เอกพจน์",
      "ใช้หน้าคำนามพหูพจน์",
      "ใช้หน้าคำกริยา"
    ],
    "ใช้หน้าคำนามนับได้เอกพจน์",
    "ใช้ a หน้าพยัญชนะ และ an หน้าสระ (a, e, i, o, u)"
  ]
] as const;

function SectionQuiz({ items }: { items: readonly (readonly [string, readonly string[], string, string])[] }) {
  const [idx, setIdx] = useState(0), [ans, setAns] = useState(""), [sc, setSc] = useState(0), [done, setDone] = useState(false);
  const cur = items[idx];
  return <div className="section-quiz-wrap"><h3 className="section-quiz-heading">ทบทวนก่อนไปต่อ</h3>
    {done ? <div className="lesson-result"><span>✓</span><div><p>ทำครบแล้ว</p><b>{sc} / {items.length}</b><p>{sc >= Math.round(items.length * 0.8) ? "เข้าใจดีแล้ว ไปหมวดถัดไปได้เลย!" : "ลองทบทวนเนื้อหาด้านบนอีกครั้ง"}</p></div></div>
      : <><p className="section-quiz-progress">{idx + 1} / {items.length}</p><h4>{cur[0]}</h4><div className="lesson-answers">{cur[1].map(c => <button key={c} disabled={!!ans} className={ans ? c === cur[2] ? "correct" : c === ans ? "wrong" : "" : ""} onClick={() => { setAns(c); if (c === cur[2]) setSc(s => s + 1); }}>{c}</button>)}</div>
        {ans && <><div className="lesson-tip"><b>{ans === cur[2] ? "Correct! ถูกต้อง" : "ยังไม่ถูก"}</b><p>{cur[3]}</p></div><button className="primary lesson-next" onClick={() => { if (idx === items.length - 1) setDone(true); else { setIdx(i => i + 1); setAns(""); } }}>ข้อถัดไป <ChevronRight /></button></>}</>}
  </div>;
}

const quiz = [
  [
    "What is the correct article for 'apple'?",
    [
      "a",
      "an",
      "the"
    ],
    "an",
    "ใช้ 'an' นำหน้าคำนามที่ขึ้นต้นด้วยเสียงสระ (a, e, i, o, u)"
  ],
  [
    "Which sentence is grammatically correct?",
    [
      "She speak English.",
      "She speaks English.",
      "She speaking English."
    ],
    "She speaks English.",
    "ประธานเอกพจน์ (he/she/it) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "What is the correct response to 'How are you?'",
    [
      "I am fine, thanks.",
      "I am from Brazil.",
      "My name is Alex."
    ],
    "I am fine, thanks.",
    "คำถามนี้ถามถึงสารทุกข์สุกดิบ ไม่ใช่ชื่อหรือที่มา"
  ],
  [
    "Which word is the correct nationality for someone from Russia?",
    [
      "Russian",
      "Russia",
      "Russians"
    ],
    "Russian",
    "Russian คือคำคุณศัพท์บอกสัญชาติ ส่วน Russia คือชื่อประเทศ"
  ],
  [
    "How do you say 'วันพุธ' in English?",
    [
      "Monday",
      "Wednesday",
      "Thursday"
    ],
    "Wednesday",
    "Wednesday คือวันพุธ (อย่าลืมตัว d ในการสะกด)"
  ],
  [
    "Which sentence uses the correct negative form?",
    [
      "He do not speak Spanish.",
      "He does not speak Spanish.",
      "He not speak Spanish."
    ],
    "He does not speak Spanish.",
    "ประธานเอกพจน์ (he/she/it) ต้องใช้ does not ในรูปปฏิเสธ"
  ],
  [
    "What is the correct way to ask about someone's origin?",
    [
      "Where are you from?",
      "Where do you live?",
      "What are you from?"
    ],
    "Where are you from?",
    "ใช้ Where are you from? เพื่อถามว่าคุณมาจากที่ไหน"
  ],
  [
    "Which number is '15'?",
    [
      "fifty",
      "fifteen",
      "five"
    ],
    "fifteen",
    "15 คือ fifteen ส่วน 50 คือ fifty"
  ],
  [
    "What is the correct article for 'university'?",
    [
      "a",
      "an",
      "the"
    ],
    "a",
    "แม้ขึ้นต้นด้วย u แต่เสียงอ่านคือ 'ยู' (y-sound) จึงใช้ a"
  ],
  [
    "Which sentence is correct for a daily routine?",
    [
      "I go home by bus.",
      "I go home in bus.",
      "I go home at bus."
    ],
    "I go home by bus.",
    "ใช้ by นำหน้าพาหนะเพื่อบอกวิธีการเดินทาง"
  ],
  [
    "What is the correct English translation for 'วันจันทร์'?",
    [
      "Monday",
      "Tuesday",
      "Wednesday"
    ],
    "Monday",
    "Monday คือวันจันทร์ ส่วน Tuesday คือวันอังคาร และ Wednesday คือวันพุธ"
  ],
  [
    "Which sentence is grammatically correct?",
    [
      "She speak English.",
      "She speaks English.",
      "She speaking English."
    ],
    "She speaks English.",
    "ประธานที่เป็นเอกพจน์บุรุษที่ 3 (he/she/it) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "What is the correct form of 'be' for 'They'?",
    [
      "is",
      "are",
      "am"
    ],
    "are",
    "ใช้ They are สำหรับประธานพหูพจน์"
  ],
  [
    "How do you say 'ฉันมาจากประเทศไทย' in English?",
    [
      "I am from Thailand.",
      "I is from Thailand.",
      "I are from Thailand."
    ],
    "I am from Thailand.",
    "ใช้ I am เพื่อบอกที่มาหรือตัวตน"
  ],
  [
    "Which word correctly completes: 'What language ___ you speak?'",
    [
      "do",
      "does",
      "is"
    ],
    "do",
    "ใช้ do กับประธาน I, you, we, they ในประโยคคำถาม"
  ],
  [
    "What is the correct negative form for 'He'?",
    [
      "He do not speak.",
      "He does not speak.",
      "He is not speak."
    ],
    "He does not speak.",
    "ประธานเอกพจน์บุรุษที่ 3 ใช้ does not ในรูปปฏิเสธ"
  ],
  [
    "Which number is '15'?",
    [
      "fifty",
      "fifteen",
      "five"
    ],
    "fifteen",
    "15 คือ fifteen ส่วน 50 คือ fifty"
  ],
  [
    "What is the correct article for 'English course'?",
    [
      "a English course",
      "an English course",
      "the English course"
    ],
    "an English course",
    "ใช้ an นำหน้าคำนามที่ขึ้นต้นด้วยเสียงสระ (E)"
  ],
  [
    "Which question asks about nationality?",
    [
      "Where are you from?",
      "What is your nationality?",
      "How are you?"
    ],
    "What is your nationality?",
    "What is your nationality? ใช้ถามสัญชาติโดยตรง"
  ],
  [
    "What does 'See you tomorrow!' mean?",
    [
      "แล้วเจอกันพรุ่งนี้",
      "แล้วเจอกันวันนี้",
      "ลาก่อน"
    ],
    "แล้วเจอกันพรุ่งนี้",
    "tomorrow แปลว่า พรุ่งนี้ ส่วน see you แปลว่า แล้วเจอกัน"
  ],
  [
    "Which article is used before a word starting with a vowel sound?",
    [
      "a",
      "an",
      "the"
    ],
    "an",
    "ใช้ 'an' นำหน้าคำที่ขึ้นต้นด้วยเสียงสระ เช่น an ice cream"
  ],
  [
    "What is the correct verb form for 'He' in the present simple?",
    [
      "speak",
      "speaks",
      "speaking"
    ],
    "speaks",
    "ประธานเอกพจน์บุรุษที่ 3 (He/She/It) ต้องเติม -s ที่กริยา"
  ],
  [
    "Which preposition is used for days of the week?",
    [
      "in",
      "at",
      "on"
    ],
    "on",
    "ใช้ 'on' นำหน้าวัน เช่น on Monday"
  ],
  [
    "How do you ask about someone's nationality?",
    [
      "What is your nationality?",
      "Where is your nationality?",
      "Who is your nationality?"
    ],
    "What is your nationality?",
    "ใช้ 'What' เพื่อถามเกี่ยวกับข้อมูลหรือประเภทของสิ่งนั้นๆ"
  ],
  [
    "Which sentence is grammatically correct?",
    [
      "She do not speak English.",
      "She does not speak English.",
      "She does not speaks English."
    ],
    "She does not speak English.",
    "ใช้ 'does not' กับประธานเอกพจน์ และกริยาหลักไม่ต้องเติม -s"
  ],
  [
    "What is the correct way to say you are from a country?",
    [
      "I am from Thailand.",
      "I am in Thailand.",
      "I am at Thailand."
    ],
    "I am from Thailand.",
    "ใช้ 'from' เพื่อบอกแหล่งกำเนิดหรือประเทศที่จากมา"
  ],
  [
    "Which word is the correct number for 11?",
    [
      "eleven",
      "teen-one",
      "one-ten"
    ],
    "eleven",
    "11 คือ eleven และ 12 คือ twelve"
  ],
  [
    "What is the correct question word for location?",
    [
      "What",
      "Where",
      "When"
    ],
    "Where",
    "ใช้ 'Where' เพื่อถามถึงสถานที่"
  ],
  [
    "Which sentence uses the correct article?",
    [
      "I have a apple.",
      "I have an apple.",
      "I have the apple."
    ],
    "I have an apple.",
    "apple ขึ้นต้นด้วยเสียงสระ จึงใช้ an"
  ],
  [
    "How do you ask about the price of an item?",
    [
      "What does it cost?",
      "Where does it cost?",
      "Who does it cost?"
    ],
    "What does it cost?",
    "ใช้ 'What' เพื่อถามเกี่ยวกับราคาหรือจำนวนเงิน"
  ],
  [
    "ประโยค 'คุณพูดภาษาอังกฤษ' (You + speak) ในรูปปัจจุบันคือข้อใด?",
    [
      "You speak English",
      "You speaks English",
      "You speaking English"
    ],
    "You speak English",
    "ประธาน You ใช้กริยาช่อง 1 โดยไม่ต้องเติม s"
  ],
  [
    "เลข 11 ในภาษาอังกฤษคือข้อใด?",
    [
      "eleven",
      "oneteen",
      "eleventeen"
    ],
    "eleven",
    "11 คือ eleven เป็นคำยกเว้น ไม่ได้ลงท้ายด้วย -teen เหมือนเลขอื่น"
  ],
  [
    "เลข 12 ในภาษาอังกฤษคือข้อใด?",
    [
      "twelve",
      "twoteen",
      "twelveteen"
    ],
    "twelve",
    "12 คือ twelve เป็นคำยกเว้น ไม่ได้ลงท้ายด้วย -teen เหมือนเลขอื่น"
  ],
  [
    "ประโยค 'พวกเราไม่พูดภาษาอังกฤษ' (We + speak) คือข้อใด?",
    [
      "We don't speak English",
      "We doesn't speak English",
      "We not speak English"
    ],
    "We don't speak English",
    "ประธาน We ใช้ don't (do not) ในประโยคปฏิเสธ"
  ],
  [
    "ประโยค 'เขาไม่พูดภาษาอังกฤษ' (He + speak) คือข้อใด?",
    [
      "He doesn't speak English",
      "He doesn't speaks English",
      "He don't speak English"
    ],
    "He doesn't speak English",
    "เมื่อใช้ doesn't ในประโยคปฏิเสธ กริยาหลักต้องกลับเป็นรูปปกติ (ไม่มี s)"
  ],
  [
    "ข้อใดคือการตั้งคำถาม 'พวกเขาพูดภาษาอังกฤษไหม' (They + speak) ที่ถูกต้อง?",
    [
      "Do they speak English?",
      "Does they speak English?",
      "Speak they English?"
    ],
    "Do they speak English?",
    "การสร้างประโยคคำถามใน Present Simple ต้องใช้ Do นำหน้าประธาน They"
  ],
  [
    "รูปปฏิเสธของ 'you speak' คือข้อใด?",
    [
      "do not speak",
      "does not speak",
      "don't speaks"
    ],
    "do not speak",
    "ประธาน you ใช้ do not (don't) ตามด้วยกริยาช่อง 1 ไม่เติม s"
  ],
  [
    "กริยาหลักในประโยคปฏิเสธ (หลัง do/does not) ต้องใช้รูปใด?",
    [
      "base form (ไม่เติม s/es)",
      "v-ing",
      "v-ed"
    ],
    "base form (ไม่เติม s/es)",
    "หลัง do not หรือ does not กริยาต้องกลับเป็นรูปปกติเสมอ เช่น does not speak"
  ],
  [
    "เปลี่ยน 'You are Thai.' เป็นประโยคคำถามที่ถูกต้อง",
    [
      "Are you Thai?",
      "Do you are Thai?",
      "Is you Thai?"
    ],
    "Are you Thai?",
    "ประโยคที่มี Verb to be (is/am/are) ให้สลับที่กับประธานเพื่อสร้างคำถาม"
  ],
  [
    "เปลี่ยน 'He lives in Thailand.' เป็นประโยคคำถาม",
    [
      "Does he live in Thailand?",
      "Do he live in Thailand?",
      "Does he lives in Thailand?"
    ],
    "Does he live in Thailand?",
    "ใช้ Does นำหน้าประธานเอกพจน์ และกริยาหลักต้องตัด s ออก"
  ],
  [
    "Which article is used before a word starting with a vowel sound?",
    [
      "a",
      "an",
      "the"
    ],
    "an",
    "ใช้ 'an' นำหน้าคำที่ขึ้นต้นด้วยเสียงสระ เช่น an ice cream"
  ],
  [
    "What is the correct verb form for 'She' in the present simple?",
    [
      "speak",
      "speaks",
      "speaking"
    ],
    "speaks",
    "ประธานเอกพจน์บุรุษที่ 3 (he/she/it) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "How do you ask about someone's origin?",
    [
      "Where are you from?",
      "Where do you live?",
      "Where are you going?"
    ],
    "Where are you from?",
    "Where are you from? ใช้ถามว่าคุณมาจากที่ไหน"
  ],
  [
    "Which sentence is grammatically correct?",
    [
      "He do not speak Thai.",
      "He does not speak Thai.",
      "He not speak Thai."
    ],
    "He does not speak Thai.",
    "ประธานเอกพจน์บุรุษที่ 3 ใช้ does not ในประโยคปฏิเสธ"
  ],
  [
    "What is the correct response to 'Do you speak English?'",
    [
      "Yes, I do.",
      "Yes, I am.",
      "Yes, I speak."
    ],
    "Yes, I do.",
    "คำถามที่ขึ้นต้นด้วย Do ต้องตอบด้วย do/does"
  ],
  [
    "Which word is used to ask for a reason?",
    [
      "When",
      "Why",
      "Where"
    ],
    "Why",
    "Why ใช้ถามเหตุผล (ทำไม) และมักตอบด้วย Because"
  ],
  [
    "What is the correct way to say the time 18:00?",
    [
      "eighteen",
      "eighty",
      "eight"
    ],
    "eighteen",
    "18 คือ eighteen ส่วน 80 คือ eighty"
  ],
  [
    "Which preposition is used with days of the week?",
    [
      "in",
      "on",
      "at"
    ],
    "on",
    "ใช้ on นำหน้าวัน เช่น on Monday"
  ],
  [
    "What is the correct nationality for someone from Russia?",
    [
      "Russian",
      "Russia",
      "Russish"
    ],
    "Russian",
    "Russian คือคำคุณศัพท์บอกสัญชาติรัสเซีย"
  ],
  [
    "Which question asks about a person's identity?",
    [
      "What are you?",
      "Who are you?",
      "Where are you?"
    ],
    "Who are you?",
    "Who ใช้ถามเกี่ยวกับบุคคล (ใคร)"
  ],
  [
    "คำถามข้อใดใช้ถาม 'สัญชาติ'?",
    [
      "What nationality",
      "Where from",
      "Who"
    ],
    "What nationality",
    "What nationality is he? = เขาสัญชาติอะไร"
  ],
  [
    "คำว่า 'How' ใช้ถามในความหมายใด?",
    [
      "อย่างไร/เท่าไร",
      "อะไร",
      "ที่ไหน"
    ],
    "อย่างไร/เท่าไร",
    "How old are you? = คุณอายุเท่าไร"
  ],
  [
    "บุพบทที่ใช้กับวัน (เช่น Wednesday) คือข้อใด?",
    [
      "on",
      "in",
      "at"
    ],
    "on",
    "ใช้ on นำหน้าวันในสัปดาห์เสมอ"
  ],
  [
    "Thursday คือวันอะไร?",
    [
      "วันพฤหัสบดี",
      "วันพุธ",
      "วันเสาร์"
    ],
    "วันพฤหัสบดี",
    "Thursday แปลว่า วันพฤหัสบดี"
  ],
  [
    "\"The day after tomorrow\" หมายถึงวันใด?",
    [
      "yesterday",
      "tomorrow",
      "the day after tomorrow"
    ],
    "the day after tomorrow",
    "tomorrow คือ พรุ่งนี้, the day after tomorrow คือ มะรืนนี้"
  ],
  [
    "\"The day before yesterday\" หมายถึงวันใด?",
    [
      "the day before yesterday",
      "last week",
      "the day after tomorrow"
    ],
    "the day before yesterday",
    "the day before yesterday หมายถึง เมื่อวานซืน"
  ],
  [
    "\"last week\" หมายถึงช่วงเวลาใด?",
    [
      "last week",
      "this week",
      "next week"
    ],
    "last week",
    "last = ที่แล้ว, this = นี้, next = หน้า"
  ],
  [
    "ข้อใดคือการถาม \"วันนี้วันอะไร\" ที่ถูกต้องตามหลักไวยากรณ์?",
    [
      "What day is it today?",
      "What day it is today?",
      "What day today is?"
    ],
    "What day is it today?",
    "ในประโยคคำถามภาษาอังกฤษ ต้องวางกริยาช่วย (is) ไว้หน้าประธาน (it)"
  ],
  [
    "ตัวเลข 20 ในภาษาอังกฤษเขียนอย่างไร?",
    [
      "twelve",
      "twenty",
      "two hundred"
    ],
    "twenty",
    "20 คือ twenty (ระวังการสะกดคำที่เปลี่ยนรูปจาก two)"
  ],
  [
    "ตัวเลข 23 เขียนเป็นตัวอักษรได้อย่างไร?",
    [
      "twelve-three",
      "twenty-three",
      "thirty-two"
    ],
    "twenty-three",
    "การเขียนตัวเลขหลักสิบเชื่อมกับหลักหน่วยต้องใช้เครื่องหมายขีด (hyphen)"
  ],
  [
    "ตัวเลข 11 และ 12 ในภาษาอังกฤษเขียนอย่างไร?",
    [
      "eleven, twelve",
      "oneteen, twoteen",
      "ten-one, ten-two"
    ],
    "eleven, twelve",
    "11 (eleven) และ 12 (twelve) เป็นคำยกเว้น ไม่ได้ลงท้ายด้วย -teen เหมือนเลข 13-19"
  ],
  [
    "ตัวเลข 200 เขียนเป็นภาษาอังกฤษอย่างไร?",
    [
      "two hundred",
      "two hundreds",
      "two hundredth"
    ],
    "two hundred",
    "เมื่อมีตัวเลขระบุจำนวนอยู่ข้างหน้า คำว่า hundred จะไม่เติม s"
  ],
  [
    "2,000 เขียนเป็นตัวอักษรภาษาอังกฤษได้อย่างไร?",
    [
      "two thousand",
      "two thousands",
      "twenty hundred"
    ],
    "two thousand",
    "2,000 คือ two thousand (คำว่า thousand ไม่ต้องเติม s เมื่อมีตัวเลขระบุข้างหน้า)"
  ],
  [
    "1,000,000 เขียนเป็นภาษาอังกฤษว่าอย่างไร?",
    [
      "one million",
      "one billion",
      "one trillion"
    ],
    "one million",
    "1,000,000 คือ one million (หนึ่งล้าน)"
  ],
  [
    "คำถาม 'How old are you?' ใช้ถามเกี่ยวกับอะไร?",
    [
      "อายุ",
      "ส่วนสูง",
      "น้ำหนัก"
    ],
    "อายุ",
    "How old are you? ใช้ถามอายุ คำตอบมักจะเป็น I am ... years old."
  ],
  [
    "หากต้องการบอกว่า 'ฉันมาจากประเทศไทย' ควรใช้คำบุพบทใด?",
    [
      "from",
      "in",
      "at"
    ],
    "from",
    "ใช้โครงสร้าง be + from เพื่อบอกถิ่นกำเนิด เช่น I am from Thailand."
  ],
  [
    "ชื่อประเทศในข้อใดต้องมี 'the' นำหน้าเสมอ?",
    [
      "the USA",
      "the Thailand",
      "the Japan"
    ],
    "the USA",
    "โดยปกติชื่อประเทศไม่ต้องมี the ยกเว้นประเทศที่เป็นกลุ่มรัฐหรือราชอาณาจักร เช่น the USA, the UK"
  ],
  [
    "คำลงท้าย (Suffix) ของสัญชาติในภาษาอังกฤษมักลงท้ายด้วยอะไร?",
    [
      "-ian / -ese",
      "-ing / -ed",
      "-ly / -ty"
    ],
    "-ian / -ese",
    "สัญชาติส่วนใหญ่มักลงท้ายด้วย -ian (เช่น Canadian) หรือ -ese (เช่น Japanese)"
  ],
  [
    "การเขียนชื่อประเทศและสัญชาติในภาษาอังกฤษ ข้อใดถูกต้อง?",
    [
      "ต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่เสมอ",
      "ต้องขึ้นต้นด้วยตัวพิมพ์เล็กเสมอ",
      "ชื่อประเทศพิมพ์ใหญ่ สัญชาติพิมพ์เล็ก"
    ],
    "ต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่เสมอ",
    "ในภาษาอังกฤษ ทั้งชื่อประเทศ (Thailand) และสัญชาติ (Thai) ถือเป็นวิสามานยนาม ต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่เสมอ"
  ],
  [
    "ประโยคคำถามของ 'He speaks English.' คือข้อใด?",
    [
      "Does he speak English?",
      "Do he speak English?",
      "Is he speak English?"
    ],
    "Does he speak English?",
    "ใน Present Simple เมื่อประธานเป็นเอกพจน์ (He) ใช้ Does เข้ามาช่วยในประโยคคำถาม และกริยาหลัก (speak) ไม่ต้องเติม s"
  ],
  [
    "'My mother tongue is English' หมายความว่าอย่างไร?",
    [
      "ภาษาแม่ของฉันคือภาษาอังกฤษ",
      "ฉันกำลังเรียนภาษาอังกฤษ",
      "ฉันพูดภาษาอังกฤษได้นิดหน่อย"
    ],
    "ภาษาแม่ของฉันคือภาษาอังกฤษ",
    "mother tongue หมายถึง ภาษาแม่ หรือภาษาแรกที่เรียนรู้ตั้งแต่เกิด"
  ],
  [
    "ประโยคคำถาม 'Is there an English course here?' แปลว่าอะไร?",
    [
      "ที่นี่มีคอร์สภาษาอังกฤษไหม",
      "คอร์สภาษาอังกฤษอยู่ที่ไหน",
      "คอร์สภาษาอังกฤษคืออะไร"
    ],
    "ที่นี่มีคอร์สภาษาอังกฤษไหม",
    "การสร้างประโยคคำถามแบบ Yes/No ให้ย้ายกริยาช่วย (is/are) มาไว้หน้าประโยค"
  ],
  [
    "ประโยคคำถาม 'Is this seat free?' แปลว่าอะไร?",
    [
      "ที่นั่งนี้ว่างไหม",
      "ที่นั่งนี้อยู่ที่ไหน",
      "ที่นั่งนี้ไม่ว่าง"
    ],
    "ที่นั่งนี้ว่างไหม",
    "โครงสร้าง Is + ประธาน + คำคุณศัพท์ ใช้สำหรับถามคำถามที่ต้องการคำตอบว่า ใช่ หรือ ไม่ใช่"
  ],
  [
    "ประโยค 'How is it spelled?' ใช้ในสถานการณ์ใด?",
    [
      "ถามวิธีสะกดคำ",
      "ถามชื่อคน",
      "ถามสถานที่"
    ],
    "ถามวิธีสะกดคำ",
    "ใช้เมื่อต้องการทราบวิธีเขียนตัวอักษรของชื่อหรือคำศัพท์นั้นๆ"
  ],
  [
    "ทำไม Olga ถึงไม่ซื้อไอศกรีม?",
    [
      "เพราะเธอไม่ชอบไอศกรีม",
      "เพราะเธอกำลังเก็บเงิน",
      "เพราะเธอไม่มีเงิน"
    ],
    "เพราะเธอกำลังเก็บเงิน",
    "จากเนื้อเรื่อง Olga ไม่ซื้อเพราะ she is saving money (เธอกำลังเก็บเงิน)"
  ],
  [
    "Pedro มาจากประเทศอะไร?",
    [
      "Brazil",
      "Russia",
      "South Africa"
    ],
    "Brazil",
    "Pedro บอกว่า I am Brazilian และมาจาก São Paulo ซึ่งอยู่ในประเทศ Brazil"
  ],
  [
    "คำว่า 'ice cream' ในภาษาอังกฤษหมายถึงอะไร?",
    [
      "ไอศกรีม",
      "ชีส",
      "แม่น้ำ"
    ],
    "ไอศกรีม",
    "ice cream คือคำศัพท์มาตรฐานที่ใช้เรียกของหวานแช่แข็ง"
  ],
  [
    "คำสรรพนาม 'I' ในภาษาอังกฤษใช้แทนใคร?",
    [
      "ตัวผู้พูดเอง",
      "คนที่เรากำลังคุยด้วย",
      "บุคคลที่สาม"
    ],
    "ตัวผู้พูดเอง",
    "I แปลว่า ฉัน ใช้แทนตัวผู้พูดเพียงคนเดียว"
  ],
  [
    "คำว่า 'Thanks' ในภาษาอังกฤษหมายถึงอะไร?",
    [
      "ขอบคุณ",
      "ยินดี",
      "ภาษา"
    ],
    "ขอบคุณ",
    "Thanks เป็นคำที่ใช้แสดงความขอบคุณแบบทั่วไปและเป็นกันเอง"
  ],
  [
    "ประโยค 'Anything else?' หมายความว่าอย่างไร?",
    [
      "ต้องการรับอะไรเพิ่มไหม",
      "นี่คือทั้งหมดใช่ไหม",
      "คุณต้องการอะไร"
    ],
    "ต้องการรับอะไรเพิ่มไหม",
    "ใช้ถามเพื่อเสนอความช่วยเหลือเพิ่มเติมหลังจากสั่งของหรือทำกิจกรรมบางอย่างเสร็จแล้ว"
  ],
  [
    "What is the correct way to say 'I am fine' in Thai?",
    [
      "ฉันสบายดี",
      "ฉันเรียนเก่ง",
      "ฉันชอบ"
    ],
    "ฉันสบายดี",
    "I am fine. ใช้ตอบคำถาม How are you? เพื่อบอกว่าสบายดี"
  ],
  [
    "Which structure is correct for contrasting two locations?",
    [
      "not … but …",
      "not … and …",
      "not … or …"
    ],
    "not … but …",
    "ใช้ but เพื่อแสดงความขัดแย้ง เช่น I live in Espoo, not in Helsinki."
  ],
  [
    "What is the correct preposition to use with 'bus' when talking about transport?",
    [
      "by bus",
      "in bus",
      "from bus"
    ],
    "by bus",
    "เราใช้ by นำหน้ายานพาหนะ เช่น by bus, by car, by metro"
  ],
  [
    "How does a standard 'Wh-' question (e.g., Where are you from?) end in English?",
    [
      "falling intonation",
      "rising intonation",
      "flat intonation"
    ],
    "falling intonation",
    "คำถามที่ขึ้นต้นด้วย Wh- จะมีระดับเสียงต่ำลงที่ท้ายประโยค"
  ],
  [
    "What is the correct verb form for 'She' in the present simple tense?",
    [
      "She speaks",
      "She speak",
      "She speaking"
    ],
    "She speaks",
    "ประธานเอกพจน์บุรุษที่ 3 (he/she/it) กริยาต้องเติม -s หรือ -es"
  ],
  [
    "Which is the correct way to ask about someone's nationality?",
    [
      "What is your nationality?",
      "What are you nationality?",
      "Where is your nationality?"
    ],
    "What is your nationality?",
    "ใช้ What is your nationality? เพื่อถามสัญชาติ"
  ],
  [
    "How do you write the number 21 in English?",
    [
      "twenty-one",
      "twenty one",
      "twentyone"
    ],
    "twenty-one",
    "เลข 21-99 ต้องมีเครื่องหมายขีด (hyphen) ระหว่างคำ"
  ],
  [
    "Which sentence is grammatically correct?",
    [
      "I am from Thailand.",
      "I am from Thai.",
      "I am from the Thailand."
    ],
    "I am from Thailand.",
    "ชื่อประเทศไม่ต้องมี article นำหน้า และใช้ชื่อประเทศไม่ใช่ชื่อสัญชาติหลัง from"
  ],
  [
    "What is the correct short answer to 'Are you a student?'",
    [
      "Yes, I am.",
      "Yes, I do.",
      "Yes, I be."
    ],
    "Yes, I am.",
    "คำถามที่ขึ้นต้นด้วย Are ต้องตอบด้วย verb to be (am/is/are)"
  ]
] as const;

function Finnish({ text, children }: { text: string; children?: ReactNode }) { return <button type="button" className="finnish-speak" onClick={() => ttsService.speak(text)} aria-label={`Listen to ${text}`}>{children ?? text}<Volume2 size={13} /></button>; }
function Table({ headers, rows, audio = [] }: { headers: string[]; rows: string[][]; audio?: number[] }) { return <div className="lesson3-table" style={{ "--columns": headers.length } as CSSProperties}><div className="table-head">{headers.map(h => <b key={h}>{h}</b>)}</div>{rows.map((row, i) => <div key={`${row[0]}-${i}`}>{row.map((cell, j) => audio.includes(j) ? <Finnish key={j} text={cell} /> : <span key={j}>{cell}</span>)}</div>)}</div>; }
const dialogueRowIds = ([["11", text11], ["29", text29], ["31", introductions], ["33", text33]] as const).flatMap(
  ([page, rows]) => rows.map((_, i) => `${page}-${i}`),
);

function Dialog({ title, page, rows, revealed, onToggle }: {
  title: string; page: string; rows: string[][];
  revealed: Set<string>; onToggle: (id: string) => void;
}) {
  return <section className="test1-dialog"><div><span className="page-badge">Book page {page}</span><h3>{title}</h3></div>{rows.map(([speaker, en, th], i) => {
    const id = `${page}-${i}`;
    const visible = revealed.has(id);
    return <article key={id}><b>{speaker}</b><div>
      <button type="button" className="test1-reveal test1-reveal-icon" aria-label={visible ? "Hide English" : "Show English"} title={visible ? "Hide English" : "Show English"} aria-expanded={visible} aria-controls={`test1-en-${id}`} onClick={() => onToggle(id)}>{visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
      <div id={`test1-en-${id}`} hidden={!visible}>{visible && <Finnish text={en} />}</div>
      <p lang="th">{th}</p>
    </div></article>;
  })}</section>;
}

export function TestOnePage() {
  const [step, setStep] = useState<Step>("start");
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const toggleDialogueRow = (id: string) => setRevealed(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const [completed, setCompleted] = useState<Step[]>(() => { try { return JSON.parse(localStorage.getItem("sisu-english:test1:v1") || "[]"); } catch { return []; } });
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState(""), [score, setScore] = useState(0), [finished, setFinished] = useState(false);
  const finish = (id: Step) => { const next = [...new Set([...completed, id])]; setCompleted(next); localStorage.setItem("sisu-english:test1:v1", JSON.stringify(next)); };
  const go = (id: Step) => { finish(step); setStep(id); window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); };
  const progress = Math.round(completed.length / steps.length * 100), q = quiz[index];
  const title = (source: string, heading: string, body: string) => <div className="lesson-title"><div><span className="kicker">{source}</span><h2>{heading}</h2><p>{body}</p></div><MessageCircle /></div>;
  return <section className="page lesson-page test-one">
    <div className="lesson-hero"><div><span className="kicker">TEST 1 · COMPLETE REVIEW</span><h1>Test 1 · Review</h1><p>Review all required texts, vocabulary and grammar for the exam</p></div><div className="lesson-progress"><b>{progress}%</b><span>complete</span><i><em style={{ width: `${progress}%` }} /></i></div></div>
    <div className="lesson-tabs" role="tablist">{steps.map((s, i) => <button role="tab" aria-selected={step === s.id} className={step === s.id ? "active" : completed.includes(s.id) ? "done" : ""} onClick={() => setStep(s.id)} key={s.id}><span>{completed.includes(s.id) ? <Check size={14} /> : i + 1}</span>{s.label}</button>)}</div>
    {step === "start" && <div className="lesson-panel intro-panel"><div className="lesson-number">T1</div><span className="kicker">EXAM MAP</span><h2>All Test 1 Exam Content</h2><p>Referenced book page numbers: 11–17, 29, 31, 33 and 37–39 (corresponds to PDF pages 10–16, 28, 30, 32 and 36–38)</p><div className="objectives"><div><span>01</span><p><b>Read and understand</b> 4 pages of dialogues and phrases in all situations</p></div><div><span>02</span><p><b>Construct words and sentences</b> using days, numbers, be, articles and verb conjugation</p></div><div><span>03</span><p><b>Ask and answer</b> yes/no questions, question words and short answers</p></div></div><div className="lesson-tip"><b>How to use this</b><p>Click English text to listen, read Thai translation, try speaking yourself, then click to reveal English to check. When finishing each section, click next to save progress.</p></div><button className="primary lesson-next" onClick={() => go("texts")}>Start with texts <ChevronRight /></button></div>}
    {step === "texts" && <div className="lesson-panel">{title("BOOK PAGES 11 · 29 · 31 · 33", "Texts to know", "Read every line and observe real usage, page 33 is colloquial")}
      <div className="test1-text-controls"><p>Read Thai then try speaking. Click to reveal English line by line to check.</p><div>
        <button type="button" className="test1-reveal" onClick={() => setRevealed(new Set(dialogueRowIds))}>Reveal all English</button>
        <button type="button" className="test1-reveal" onClick={() => setRevealed(new Set())}>Hide all English</button>
      </div></div>
      <Dialog title="Hello and welcome!" page="11" rows={text11} revealed={revealed} onToggle={toggleDialogueRow} /><Dialog title="What is your nationality?" page="29" rows={text29} revealed={revealed} onToggle={toggleDialogueRow} />
      <Dialog title="Introductions: Country, Nationality, Language" page="31" rows={introductions} revealed={revealed} onToggle={toggleDialogueRow} />
      <h3>Page 31 · Country, Nationality and Language</h3><Table headers={["Country", "Nationality", "Language", "From…", "Speak…"]} rows={countries} audio={[0, 1, 2, 3, 4]} />
      <div className="answer-pairs"><article><b>be + from + place</b><Finnish text="I am from Finland." /><p>ใช้ be + from + สถานที่ เพื่อบอกว่ามาจากไหน เช่น I am from Thailand.</p></article><article><b>Nationality + -ian/-ese</b><Finnish text="I am Thai." /><p>ชื่อประเทศ สัญชาติ และภาษาในภาษาอังกฤษขึ้นต้นด้วยตัวพิมพ์ใหญ่ เช่น Thailand, Thai, English</p></article><article><b>speak + language</b><Finnish text="I speak English." /><p>Language name after speak uses base form</p></article><article><b>mother tongue</b><Finnish text="My mother tongue is Thai." /><p>Mother tongue; standard form is name / mother tongue</p></article></div>
      <Dialog title="At the ice cream kiosk" page="33" rows={text33} revealed={revealed} onToggle={toggleDialogueRow} />
      <h3>Page 33 · Vocabulary</h3><Table headers={["Word in text", "Related form", "Meaning"]} rows={kioskVocabulary} audio={[0, 1]} />
      <div className="lesson-tip"><b>Colloquial page 33</b><p>I am → I'm · I will → I'll · Do you need a receipt? → Need a receipt? · Thank you → Thanks · Yes → Yeah</p></div>
      <h3>Grammar hidden in texts</h3><div className="answer-pairs"><article><b>I am fine + adjective</b><p>I am fine. = ฉันสบายดี; question is How are you?</p></article><article><b>not … but …</b><p>I do not live in Helsinki but in Espoo. = ฉันไม่ได้อยู่ Helsinki แต่อยู่ Espoo</p></article><article><b>by + vehicle</b><p>by bus, by metro, by car = โดยรถเมล์ รถไฟใต้ดิน รถยนต์</p></article><article><b>Language is base form</b><p>speak Spanish / Portuguese and I do not speak Spanish still use base form</p></article></div>
      <SectionQuiz items={textsQuiz} />
      <button className="primary lesson-next" onClick={() => go("phrases")}>Next: Phrases <ChevronRight /></button></div>}
    {step === "phrases" && <div className="lesson-panel">{title("BOOK PAGES 12–13", "Phrases · Important phrases", "Remember both situation and formality, short words are often informal")}
      <div className="useful-grid">{phrases.map(([en, th]) => <article key={en}><Finnish text={en} /><span>{th}</span></article>)}</div>
      <div className="lesson-tip"><b>Pairs to remember</b><p>Nice to meet you! → Nice to meet you too! · Thanks! → You are welcome! / No problem! · Sorry! → That is okay!</p></div>
      <SectionQuiz items={phrasesQuiz} />
      <button className="primary lesson-next" onClick={() => go("days")}>Next: Days <ChevronRight /></button></div>}
    {step === "days" && <div className="lesson-panel">{title("BOOK PAGE 14", "Days of the week", "Answer to What day is it today? uses base form, but answer to When? uses on")}
      <Table headers={["Day", "Abbr", "When / On…", "Thai"]} rows={days} audio={[0, 2]} />
      <div className="timeline-grid">{timeline.map(([en, th]) => <div key={en}><Finnish text={en} /><span>{th}</span></div>)}</div>
      <div className="answer-pairs"><article><Finnish text="What day is it today?" /><p>Today is Monday. = วันนี้คือวันจันทร์</p></article><article><Finnish text="When is the course?" /><p>The course is on Monday. = คอร์สเรียนวันจันทร์</p></article></div>
      <SectionQuiz items={daysQuiz} />
      <button className="primary lesson-next" onClick={() => go("numbers")}>Next: Numbers <ChevronRight /></button></div>}
    {step === "numbers" && <div className="lesson-panel">{title("BOOK PAGE 15", "Numbers", "ใช้ขีดกลางในจำนวน 21–99 ที่ไม่ใช่หลักสิบเต็ม เช่น twenty-one; two hundred และ two million เขียนแยกคำ")}
      <div className="test1-number-grid">{numbers.map(([n, en]) => <article key={n}><b>{n}</b><Finnish text={en} /></article>)}</div>
      <div className="lesson-tip"><b>Exam formula</b><p>11 = eleven · 12 = twelve · 13–19 ลงท้าย -teen · หลักสิบ: twenty, thirty, forty… · 21 = twenty-one · 200 = two hundred, 2,000 = two thousand, 2,000,000 = two million</p></div><div className="answer-pairs"><article><Finnish text="How old are you?" /><p>Ask age: คุณอายุเท่าไร</p></article><article><Finnish text="I am 23 years old." /><p>ฉันอายุ 23 ปี</p></article></div>
      <SectionQuiz items={numbersQuiz} />
      <button className="primary lesson-next" onClick={() => go("pronouns")}>Next: Pronouns and be <ChevronRight /></button></div>}
    {step === "pronouns" && <div className="lesson-panel">{title("BOOK PAGE 16", "Personal pronouns and be-verb", "be means am / is / are and must be conjugated to match the subject")}
      <Table headers={["Pronoun", "Written", "Colloquial", "Meaning"]} rows={olla} audio={[0, 1, 2]} />
      <div className="lesson-tip"><b>Key points</b><p>he/she ใช้กับคน; it ใช้กับสิ่งของ สถานการณ์ หรือสัตว์ที่ไม่ระบุเพศ; they ใช้กับพหูพจน์หรือบุคคลที่ไม่ระบุเพศ; you ใช้ได้ทั้งเอกพจน์และพหูพจน์ ไม่ต้องขึ้นต้นตัวใหญ่กลางประโยค</p></div><div className="answer-pairs"><article><Finnish text="I am a student." /><p>ฉันเป็นนักเรียน</p></article><article><Finnish text="We are in Finland." /><p>พวกเราอยู่ในฟินแลนด์</p></article></div>
      <SectionQuiz items={pronounsQuiz} />
      <button className="primary lesson-next" onClick={() => go("harmony")}>Next: Articles <ChevronRight /></button></div>}
    {step === "harmony" && <div className="lesson-panel">{title("BOOK PAGE 17", "Articles and prepositions", "ฝึก a/an/the และ in/on/at เพื่อสร้างประโยคภาษาอังกฤษ")}
      <div className="vowel-groups"><article className="back"><b>a</b><span>Consonant sound</span><p>นำหน้าคำนามนับได้เอกพจน์ที่เริ่มด้วยเสียงพยัญชนะ เช่น a book, a university</p></article><article className="neutral"><b>an</b><span>Vowel sound</span><p>นำหน้าคำนามนับได้เอกพจน์ที่เริ่มด้วยเสียงสระ เช่น an apple, an hour</p></article><article className="front"><b>the</b><span>Specific noun</span><p>ใช้เมื่อผู้พูดและผู้ฟังรู้ว่าหมายถึงสิ่งใด เช่น the book on the table</p></article></div>
      <div className="example-flow"><article><Finnish text="a book" /><span>→</span><Finnish text="the book" /></article><article><Finnish text="an apple" /><span>→</span><Finnish text="the apple" /></article><article><Finnish text="in the morning" /></article><article><Finnish text="on Monday" /></article></div>
      <h3>Prepositions of time and place</h3><div className="answer-pairs"><article><Finnish text="I study at nine." /><p>at ใช้กับเวลาที่ระบุชัด เช่น at nine; on ใช้กับวัน เช่น on Monday</p></article><article><Finnish text="I live in Bangkok." /><p>in ใช้กับเมือง ประเทศ เดือน และฤดู เช่น in Thailand, in May, in summer</p></article></div>
      <SectionQuiz items={harmonyQuiz} />
      <button className="primary lesson-next" onClick={() => go("verbs")}>Next: Verb conjugation <ChevronRight /></button></div>}
    {step === "verbs" && <div className="lesson-panel">{title("BOOK PAGE 37", "Verb conjugation", "Conjugate based on subject, add -s for third person singular")}
      <Table headers={["Subject", "speak", "ask", "Ending"]} rows={conjugation} audio={[0, 1, 2]} />
      <div className="lesson-tip"><b>Colloquial</b><p>I speak · you speak · he speaks · we speak · you speak · they speak — Colloquial follows standard rules</p></div>
      <h3>Negative sentence</h3><p>Conjugate negative verb do/does not then use main verb in base form</p><Table headers={["Subject", "Negative", "Written", "Colloquial"]} rows={negatives} audio={[0, 1, 2, 3]} />
      <div className="formula"><b>I speak</b><span>→</span><b>I do not speak</b></div>
      <SectionQuiz items={verbsQuiz} />
      <button className="primary lesson-next" onClick={() => go("questions")}>Next: Questions <ChevronRight /></button></div>}
    {step === "questions" && <div className="lesson-panel">{title("BOOK PAGES 38–39", "Question · Creating questions", "Special questions start with question word, yes/no questions move verb to front")}
      <h3>1. Special question</h3><p>Main order is <b>question word + auxiliary + subject + main verb</b>: Who are you? / What language do you speak?</p><Table headers={["Question", "Meaning", "Example", "Answer"]} rows={questionWords} audio={[0, 2, 3]} />
      <h3>2. Yes / no question</h3><div className="transform-list"><article><Finnish text="You are Finnish." /><span>→</span><Finnish text="Are you Finnish?" /></article><article><Finnish text="He lives in Finland." /><span>→</span><Finnish text="Does he live in Finland?" /></article><article><Finnish text="You do not speak English." /><span>→</span><Finnish text="Do you not speak English?" /></article></div>
      <div className="lesson-tip"><b>Short answer method</b><p>Answer by repeating verb conjugated by responder: Do you live in Helsinki? → I do. / I do not. · Do you speak English? → We do. / We do not.</p></div>
      <h3>Colloquial and intonation</h3><div className="lesson3-chip-grid"><Finnish text="Are you Finnish?" /><Finnish text="Does he live in Finland?" /><Finnish text="Do you not speak English?" /></div><p><b>Yes/No questions often rise; Wh-questions often fall.</b> คำถามใช่/ไม่ใช่มักยกเสียงท้าย ส่วนคำถาม What/Where/Why มักลงเสียงต่ำ ทั้งนี้ขึ้นกับบริบท</p>
      <SectionQuiz items={questionsQuiz} />
      <button className="primary lesson-next" onClick={() => go("check")}>Take test <ChevronRight /></button></div>}
    {step === "check" && <div className="lesson-panel quiz-panel"><span className="kicker">TEST 1 · KNOWLEDGE CHECK</span><h2>Try before the exam</h2>{finished ? <div className="lesson-result"><span>✓</span><div><p>Review finished</p><b>{score} / {quiz.length}</b><p>{score >= Math.round(quiz.length * 0.8) ? "Great! Ready for Test 1" : "Review tabs you are unsure about and try again"}</p></div></div> : <><p>Question {index + 1} of {quiz.length}</p><h3>{q[0]}</h3><div className="lesson-answers">{q[1].map(choice => <button key={choice} disabled={!!answer} className={answer ? choice === q[2] ? "correct" : choice === answer ? "wrong" : "" : ""} onClick={() => { setAnswer(choice); if (choice === q[2]) setScore(s => s + 1); }}>{choice}</button>)}</div>{answer && <><div className="lesson-tip"><b>{answer === q[2] ? "Correct!" : "Not quite"}</b><p>{q[3]}</p></div><button className="primary lesson-next" onClick={() => { if (index === quiz.length - 1) { setFinished(true); finish("check"); } else { setIndex(i => i + 1); setAnswer(""); window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); } }}>Next question <ChevronRight /></button></>}</>}</div>}
  </section>;
}