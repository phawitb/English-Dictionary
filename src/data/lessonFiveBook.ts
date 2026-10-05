// Page numbers below are the printed sivu numbers, visually verified in the supplied scan.
export const bookPages = [
  { printed: 60, filePage: 59, title: 'What kind? — Adjectives' },
  { printed: 61, filePage: 60, title: 'Weather — สภาพอากาศ' },
  { printed: 62, filePage: 61, title: 'Seasons, Months, Periods, and Days of the Week' },
  { printed: 73, filePage: 72, title: 'Exercise 9 A–B' },
  { printed: 75, filePage: 74, title: 'Exercise 12' },
  { printed: 81, filePage: 80, title: 'Exercise 23' },
  { printed: 331, filePage: 330, title: 'Answer Key: Exercise 9, 12, 23' },
];
export const adjectivePairs = [
  ['good', 'ดี', 'bad', 'ไม่ดี / แย่'], ['hot', 'ร้อน', 'cold', 'เย็น / หนาว'],
  ['difficult', 'ยาก', 'easy', 'ง่าย'], ['small', 'เล็ก', 'big', 'ใหญ่'],
  ['new', 'ใหม่', 'old', 'เก่า / แก่'], ['beautiful', 'สวย', 'ugly', 'น่าเกลียด'],
  ['warm', 'อบอุ่น', 'cool', 'เย็นสบาย / เย็นนิด ๆ'], ['bright', 'สว่าง', 'dark', 'มืด'],
  ['short', 'สั้น', 'long', 'ยาว / สูง'], ['much', 'มาก', 'little', 'น้อย'],
];
export const bookWeather = [
  ['What is the weather like today?', 'วันนี้สภาพอากาศเป็นอย่างไร?'],
  ['The weather is beautiful/good.', 'อากาศดี'], ['The weather is bad.', 'อากาศไม่ดี'],
  ['How many degrees is it outside?', 'ข้างนอกอุณหภูมิกี่องศา?'],
  ['It is +30 degrees. It is hot.', '30 องศาเหนือศูนย์ อากาศร้อน'],
  ['It is +20 degrees. It is warm.', '20 องศาเหนือศูนย์ อากาศอบอุ่น'],
  ['It is +2 degrees. It is cool.', '2 องศาเหนือศูนย์ อากาศเย็น'],
  ['It is -15 degrees. It is cold. It is freezing.', '15 องศาต่ำกว่าศูนย์ อากาศหนาวและต่ำกว่าจุดเยือกแข็ง'],
  ['The sun is shining. It is sunny.', 'พระอาทิตย์ส่องแสง / มีแดด'],
  ['It is cloudy.', 'มีเมฆมาก'], ['It is partly cloudy.', 'มีเมฆบางส่วน'],
  ['It is foggy.', 'มีหมอก'], ['It is raining. It is rainy.', 'ฝนตก / อากาศมีฝน'],
  ['It is sleeting.', 'ฝนปนหิมะตก'], ['It is snowing.', 'หิมะตก'],
  ['It is windy. There is a storm.', 'ลมพัด / มีลม / มีพายุ'],
  ['There is a thunderstorm.', 'มีพายุฝนฟ้าคะนอง'],
];
export const weatherDialogues = [
  [['Ugh, the weather is terrible today!', 'เฮ้อ วันนี้อากาศแย่จัง!'], ['Yes, it is!', 'นั่นสิ เป็นอย่างนั้นจริง ๆ!']],
  [['It is lovely that the sun is shining!', 'ดีจังที่พระอาทิตย์ส่องแสง!'], ['Yes, and it is really warm!', 'ใช่ แล้วก็อุ่นมากเลย!']],
];
export const weekdays = [
  ['Monday', 'on Monday', 'วันจันทร์'], ['Tuesday', 'on Tuesday', 'วันอังคาร'],
  ['Wednesday', 'on Wednesday', 'วันพุธ'], ['Thursday', 'on Thursday', 'วันพฤหัสบดี'],
  ['Friday', 'on Friday', 'วันศุกร์'], ['Saturday', 'on Saturday', 'วันเสาร์'], ['Sunday', 'on Sunday', 'วันอาทิตย์'],
];
export const exercise9Bank = ['ugly', 'warm', 'old', 'difficult', 'bright', 'big', 'beautiful', 'new', 'easy', 'short', 'bad', 'cool', 'small', 'dark', 'good', 'much', 'little', 'long'];
export const exercise9A = [
  ['ugly', 'beautiful', 'น่าเกลียด ↔ สวย'], ['new', 'old', 'ใหม่ ↔ เก่า'], ['good', 'bad', 'ดี ↔ ไม่ดี'],
  ['warm', 'cool', 'อบอุ่น ↔ เย็นสบาย'], ['easy', 'difficult', 'ง่าย ↔ ยาก'], ['much', 'little', 'มาก ↔ น้อย'],
  ['short', 'long', 'สั้น ↔ ยาว'], ['bright', 'dark', 'สว่าง ↔ มืด'], ['big', 'small', 'ใหญ่ ↔ เล็ก'],
];
export const exercise9B = [
  { prompt: 'In the sauna it is ___.', th: 'ในซาวน่าอากาศ…', answer: 'hot', note: 'ตัวอย่างที่หนังสือเติมไว้ให้: hot = ร้อน' },
  { prompt: 'In summer, the night is ___.', th: 'ในฤดูร้อน กลางคืน…', answer: 'bright', note: 'สว่าง = สว่าง' },
  { prompt: 'Today it is +25 degrees and the sun is shining. It is ___ weather!', th: 'วันนี้ 25 องศาและพระอาทิตย์ส่องแสง อากาศ…!', answer: 'beautiful / warm / good', note: 'อากาศดี / อุ่น / ดี' },
  { prompt: 'Outside it is raining and windy. It is ___ weather.', th: 'ข้างนอกฝนตกและลมพัด อากาศ…', answer: 'bad', note: 'bad weather = อากาศไม่ดี' },
  { prompt: 'Can you help me? The exercise is a little ___.', th: 'ช่วยฉันได้ไหม? แบบฝึกนี้…นิดหน่อย', answer: 'difficult', note: 'a little difficult = ยากนิดหน่อย' },
  { prompt: 'Our home is ___.', th: 'บ้านของพวกเรา…', answer: 'nice', note: 'nice = ดี / น่าอยู่ / น่ารัก' },
  { prompt: 'Helsinki is a ___ city and Ähtäri is a ___ city.', th: 'เฮลซิงกิเป็นเมือง… และแอห์แตริเป็นเมือง…', answer: 'big, small', note: 'big = ใหญ่, small = เล็ก' },
  { prompt: 'The word "cat" is ___ and "elephant" is ___.', th: 'คำว่า cat เป็นคำ… ส่วน elephant เป็นคำ…', answer: 'short, long', note: 'short = สั้น; long = ยาว โดยเปรียบเทียบจำนวนตัวอักษรในคำ' },
];
export const exercise12Bank = [
  'It is raining.', 'The sun is shining.', 'It is windy.', 'There is a thunderstorm.', 'It is snowing.',
  'It is hot.', 'It is bad weather.', 'It is partly cloudy.', 'It is freezing.', 'It is cold.', 'It is beautiful weather.', 'It is cool.',
];
export const exercise12 = [
  { picture: 'Person resting on beach with sun', answer: 'The sun is shining. It is hot. It is beautiful weather.', th: 'พระอาทิตย์ส่องแสง อากาศร้อน อากาศดี', note: 'เติมประโยคบรรยายสภาพอากาศ' },
  { picture: 'Child with snowman and snowflakes', answer: 'It is snowing. It is freezing. It is cold.', th: 'หิมะตก อุณหภูมิต่ำกว่าศูนย์ อากาศหนาว', note: 'ใช้ It is snowing เมื่อหิมะตก' },
  { picture: 'Person with umbrella in rain and lightning', answer: 'It is raining. There is a thunderstorm. It is bad weather.', th: 'ฝนตก มีพายุฟ้าคะนอง อากาศไม่ดี', note: 'thunderstorm = พายุฝนฟ้าคะนอง' },
  { picture: 'Person with scarf, wind blowing leaves, sun and clouds', answer: 'It is windy. It is partly cloudy. It is cool.', th: 'ลมพัด มีเมฆบางส่วน อากาศเย็น', note: 'partly cloudy = มีเมฆบางส่วน' },
];
export const exercise23 = [
  { question: 'What does Paula do on the weekend?', th: 'Paula ทำอะไรในช่วงสุดสัปดาห์?', verbs: 'play the piano / go on a trip', picture: 'Paula pulling a suitcase', answers: ['On the weekend Paula does not play the piano.', 'On the weekend Paula goes on a trip.'], meaning: 'ช่วงสุดสัปดาห์ Paula ไม่เล่นเปียโน แต่เธอออกเดินทาง', note: 'Paula = she: does not + play (base form); goes (third-person -es)' },
  { question: 'What do the children do at school?', th: 'เด็ก ๆ ทำอะไรที่โรงเรียน?', verbs: 'write / sleep', picture: 'Children writing at desks', answers: ['At school the children write.', 'At school the children do not sleep.'], meaning: 'ที่โรงเรียนเด็ก ๆ เขียนหนังสือ พวกเขาไม่ได้นอน', note: 'children = they: write; do not sleep' },
  { question: 'What do you do in the evening?', th: 'คุณทำอะไรในตอนเย็น?', verbs: 'read a book / bathe', picture: 'Person in a bathtub', answers: ['In the evening I do not read a book.', 'In the evening I bathe.'], meaning: 'ตอนเย็นฉันไม่อ่านหนังสือ ฉันอาบน้ำ', note: 'I do not read; I bathe' },
  { question: 'What do you do at the cottage?', th: 'พวกคุณทำอะไรที่บ้านพักตากอากาศ?', verbs: 'write an email / fish', picture: 'Two people fishing', answers: ['At the cottage we do not write an email.', 'At the cottage we fish.'], meaning: 'ที่บ้านพักตากอากาศพวกเราไม่เขียนอีเมล พวกเราตกปลา', note: 'we do not write; we fish' },
];
export const kptVerbs = [
  ['ski', 'I ski', 'we do not ski', 'English verbs use base forms for I/we'], ['stay', 'I stay', 'we stay', 'Regular third-person -s'], ['play', 'I play', 'does not play', 'Third-person -s rule'], ['leave', 'I leave', 'she leaves', 'leave เติม -s เป็น leaves; รูปอดีตคือ left'], ['write', 'I write', 'they write', 'Irregular verb forms'], ['sleep', 'I sleep', 'they do not sleep', 'Negative with do not'], ['read', 'I read', 'I do not read', 'Negative with do not'], ['bathe', 'I bathe', 'I bathe', 'Verb conjugation'], ['fish', 'I fish', 'we fish', 'Simple present usage'],
];