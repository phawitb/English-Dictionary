import type { VocabularyItem } from '../types'
const now = new Date().toISOString()
const rows = [
  ['student','นักเรียน','I am a student at the university.','ฉันเป็นนักเรียนที่มหาวิทยาลัย'],
  ['friend','เพื่อน','He is my good friend.','เขาเป็นเพื่อนที่ดีของฉัน'],
  ['teacher','ครู','The teacher helps us.','ครูช่วยพวกเรา'],
  ['doctor','หมอ','The doctor works at a hospital.','หมอทำงานที่โรงพยาบาล'],
  ['thank you','ขอบคุณ','Thank you for your help!','ขอบคุณสำหรับความช่วยเหลือของคุณ!'],
  ['home','บ้าน','I go home by bus.','ฉันกลับบ้านโดยรถประจำทาง'],
]
export const seedVocabulary: VocabularyItem[] = rows.map(([english, thai, exampleEnglish, exampleThai], i) => ({
  id:`seed-${i}`, query:english, direction:'en-th', english, thai, exampleEnglish, exampleThai,
  partOfSpeech:english === 'thank you' ? 'phrase' : 'noun', favorite:false, createdAt:now, reviewCount:0, correctCount:0, incorrectCount:0,
  difficulty:'new', nextReviewAt:now, mastered:false,
}))