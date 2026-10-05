import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import './styles.css'
import { ttsService } from './services/ttsService'
import { translationService } from './services/translationService'

const examples = [
  { english: 'This is my house.', thai: 'นี่คือบ้านของฉัน' },
  { english: 'The house is small.', thai: 'บ้านหลังนี้เล็ก' },
  { english: 'We bought a house.', thai: 'เราซื้อบ้านแล้ว' },
]

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  vi.spyOn(Math, 'random').mockReturnValue(0.999)
})

async function openLessonOne() {
  await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
  await userEvent.click(screen.getByRole('button', { name: /Lesson 1.*Introduction to English/i }))
}

async function openLessonTwo() {
  await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
  await userEvent.click(screen.getByRole('button', { name: /Lesson 2.*Everyday English/i }))
}

async function openLessonThree() {
  await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
  await userEvent.click(screen.getByRole('button', { name: /Lesson 3.*English sentence toolkit/i }))
}

async function openTestOne() {
  await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
  await userEvent.click(screen.getByRole('button', { name: /Test 1.*exam review/i }))
}

async function chooseLetters(answer: string) {
  for (const letter of answer.match(/[a-z]/gi) || []) {
    const tile = screen.getAllByRole('button').find((button) =>
      button.getAttribute('aria-label')?.toLocaleLowerCase('en-US').startsWith(`choose letter ${letter.toLocaleLowerCase('en-US')},`)
      && !(button as HTMLButtonElement).disabled,
    )
    expect(tile).toBeDefined()
    await userEvent.click(tile!)
  }
}

describe('App', () => {
  it('shows three bilingual examples with separate audio controls', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    vi.spyOn(translationService, 'translate').mockResolvedValue({
      id: 'three-examples', query: 'house', direction: 'en-th', english: 'house', thai: 'บ้าน',
      exampleEnglish: examples[0].english, exampleThai: examples[0].thai, examples,
    })
    render(<App />)
    await userEvent.type(screen.getByPlaceholderText(/search english or thai/i), 'house')
    await userEvent.click(screen.getByRole('button', { name: /Translate/i }))
    for (const [index, example] of examples.entries()) {
      expect(await screen.findByText(example.english)).toBeVisible()
      expect(screen.getByText(example.thai)).toBeVisible()
      const section = screen.getByText(`Example ${index + 1}`).closest('.example')!
      await userEvent.click(section.querySelector('button')!)
      expect(speak).toHaveBeenLastCalledWith(example.english, expect.any(Function), expect.any(Function))
    }
  })
  it('refreshes a legacy saved word to three examples without losing favorite progress', async () => {
    const legacy = { id: 'legacy', query: 'house', direction: 'en-th' as const, english: 'house', thai: 'บ้าน', exampleEnglish: examples[0].english, exampleThai: examples[0].thai }
    localStorage.setItem('sisu-english:history:v1', JSON.stringify([{ id: 'history-legacy', result: legacy, createdAt: '2026-10-01' }]))
    localStorage.setItem('sisu-english:favorites:v1', JSON.stringify([{ ...legacy, favorite: true, reviewCount: 7, mastered: true }]))
    const translate = vi.spyOn(translationService, 'translate').mockResolvedValue({ ...legacy, id: 'fresh', examples })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Open house, บ้าน' }))
    expect(await screen.findByText(examples[2].english)).toBeVisible()
    expect(translate).toHaveBeenCalledOnce()
    const history = JSON.parse(localStorage.getItem('sisu-english:history:v1')!)
    expect(history).toHaveLength(1)
    expect(history[0].result.examples).toHaveLength(3)
    expect(JSON.parse(localStorage.getItem('sisu-english:favorites:v1')!)[0]).toMatchObject({ id: 'legacy', reviewCount: 7, mastered: true, examples })
  })
  it('tests the English voice from Profile and reports success', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockImplementation((_text, onEnd) => {
      onEnd?.()
      return true
    })
    render(<App />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Profile' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Test sound' }))

    expect(speak).toHaveBeenCalledWith('Hello! Welcome.', expect.any(Function), expect.any(Function))
    expect(screen.getByRole('status')).toHaveTextContent('Sound is working')
  })

  it('reports an unavailable English voice from the Profile sound test', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(false)
    render(<App />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Profile' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Test sound' }))

    expect(screen.getByRole('status')).toHaveTextContent('English voice unavailable')
  })

  it('opens with an immediately understandable dictionary search', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /understand english/i })).toBeInTheDocument()
    const search = screen.getByPlaceholderText(/search english or thai/i)
    expect(search).toBeInTheDocument()
    expect(search).not.toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Translate/i }).closest('.search-line')).toBeInTheDocument()
  })
  it('filters recent searches while the search field is focused', async () => {
    const makeResult = (id: string, english: string, thai: string) => ({
      id,
      query: english,
      direction: 'en-th',
      english,
      thai,
      exampleEnglish: `${english}.`,
      examples, exampleThai: `${thai}.`,
    })
    localStorage.setItem('sisu-english:history:v1', JSON.stringify([
      { id: 'recent-1', result: makeResult('word-1', 'student', 'นักเรียน'), createdAt: '2026-09-13T10:00:00.000Z' },
      { id: 'recent-2', result: makeResult('word-2', 'thank you', 'ขอบคุณ'), createdAt: '2026-09-13T09:00:00.000Z' },
    ]))
    render(<App />)
    const search = screen.getByPlaceholderText(/search english or thai/i)

    await userEvent.click(search)
    await userEvent.type(search, 'tha')

    expect(screen.getByRole('button', { name: 'Open thank you, ขอบคุณ' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Open student, นักเรียน' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recent searches' })).toBeVisible()
    await userEvent.clear(search)
    await userEvent.type(search, 'zzz')
    expect(screen.getByText('No matching recent searches')).toBeVisible()
  })
  it('clears the query and open dictionary result with the search clear button', async () => {
    const result = {
      id: 'clear-word',
      query: 'thank you',
      direction: 'en-th',
      english: 'thank you',
      thai: 'ขอบคุณ',
      exampleEnglish: 'Thank you very much.',
      examples, exampleThai: 'ขอบคุณมาก',
    }
    localStorage.setItem('sisu-english:history:v1', JSON.stringify([
      { id: 'clear-history', result, createdAt: '2026-09-13T10:00:00.000Z' },
    ]))
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Open thank you, ขอบคุณ' }))
    expect(screen.getByRole('heading', { name: 'thank you' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(screen.getByPlaceholderText(/search english or thai/i)).toHaveValue('')
    expect(screen.queryByRole('heading', { name: 'thank you' })).not.toBeInTheDocument()
    expect(screen.getByText('Try searching')).toBeVisible()
  })
  it('reuses a case-insensitive cached search without asking the translation service again', async () => {
    const translate = vi.spyOn(translationService, 'translate')
    const result = {
      id: 'cached-word',
      query: 'thank you',
      direction: 'en-th',
      english: 'thank you',
      thai: 'ขอบคุณ',
      exampleEnglish: 'Thank you very much.',
      examples, exampleThai: 'ขอบคุณมาก',
    }
    localStorage.setItem('sisu-english:history:v1', JSON.stringify([
      { id: 'cached-history', result, createdAt: '2026-09-13T10:00:00.000Z' },
    ]))
    render(<App />)
    const search = screen.getByPlaceholderText(/search english or thai/i)

    await userEvent.type(search, '  THANK YOU  ')
    await userEvent.click(screen.getByRole('button', { name: /Translate/i }))

    expect(translate).not.toHaveBeenCalled()
    expect(search).toHaveValue('thank you')
    expect(screen.getByRole('heading', { name: 'thank you' })).toBeVisible()
    expect(JSON.parse(localStorage.getItem('sisu-english:history:v1') ?? '[]')).toHaveLength(1)
  })
  it('reuses English or Thai text from a previous result and moves it to the top', async () => {
    const translate = vi.spyOn(translationService, 'translate')
    const cachedResult = {
      id: 'cached-card', query: 'thank you', direction: 'en-th', english: 'thank you', thai: 'ขอบคุณ',
      exampleEnglish: 'Thank you very much.', examples, exampleThai: 'ขอบคุณมาก',
    }
    const newerResult = {
      id: 'newer-card', query: 'house', direction: 'en-th', english: 'house', thai: 'บ้าน',
      exampleEnglish: 'This is a house.', examples, exampleThai: 'นี่คือบ้าน',
    }
    localStorage.setItem('sisu-english:history:v1', JSON.stringify([
      { id: 'newer-history', result: newerResult, createdAt: '2026-09-13T11:00:00.000Z' },
      { id: 'cached-history', result: cachedResult, createdAt: '2026-09-13T10:00:00.000Z' },
    ]))
    render(<App />)
    const search = screen.getByPlaceholderText(/search english or thai/i)

    await userEvent.type(search, '  THANK   YOU ')
    await userEvent.click(screen.getByRole('button', { name: /Translate/i }))

    expect(translate).not.toHaveBeenCalled()
    expect(search).toHaveValue('thank you')
    expect(screen.getByRole('heading', { name: 'thank you' })).toBeVisible()
    const saved = JSON.parse(localStorage.getItem('sisu-english:history:v1') ?? '[]')
    expect(saved).toHaveLength(2)
    expect(saved.map((item: { id: string }) => item.id)).toEqual(['cached-history', 'newer-history'])
  })
  it('shows a helpful not-found state instead of a service error', async () => {
    vi.spyOn(translationService, 'translate').mockRejectedValue(new Error('translation_not_found'))
    render(<App />)

    await userEvent.type(screen.getByPlaceholderText(/search english or thai/i), 'asdfgh')
    await userEvent.click(screen.getByRole('button', { name: /Translate/i }))

    expect(await screen.findByText('Word not found')).toBeVisible()
    expect(screen.getByText('Check the spelling or try another word.')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })
  it('opens a successful translation as a focused word view', async () => {
    vi.spyOn(translationService, 'translate').mockResolvedValue({
      id: 'found-word', query: 'house', direction: 'auto', english: 'house', thai: 'บ้าน',
      exampleEnglish: 'This is a house.', examples, exampleThai: 'นี่คือบ้าน',
    })
    render(<App />)

    await userEvent.type(screen.getByPlaceholderText(/search english or thai/i), 'house')
    await userEvent.click(screen.getByRole('button', { name: /Translate/i }))

    expect(await screen.findByRole('heading', { name: 'house' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Recent searches' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeVisible()
  })
  it('replaces an open word with a service error when a new search fails', async () => {
    const result = {
      id: 'old-word', query: 'house', direction: 'en-th', english: 'house', thai: 'บ้าน',
      exampleEnglish: 'This is a house.', examples, exampleThai: 'นี่คือบ้าน',
    }
    localStorage.setItem('sisu-english:history:v1', JSON.stringify([
      { id: 'old-history', result, createdAt: '2026-09-13T10:00:00.000Z' },
    ]))
    vi.spyOn(translationService, 'translate').mockRejectedValue(new Error('translation_failed'))
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Open house, บ้าน' }))
    const search = screen.getByPlaceholderText(/search english or thai/i)
    await userEvent.type(search, 'x')
    await userEvent.click(screen.getByRole('button', { name: /Translate/i }))

    expect(await screen.findByText('Translation unavailable')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'house' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
  it('shows persisted recent searches inside Dictionary and lets users reopen or remove them', async () => {
    const result = {
      id: 'history-word',
      query: 'I',
      direction: 'en-th',
      english: 'I',
      thai: 'ฉัน',
      exampleEnglish: 'I am a student.',
      examples, exampleThai: 'ฉันเป็นนักเรียน',
    }
    localStorage.setItem('sisu-english:history:v1', JSON.stringify([
      { id: 'history-1', result, createdAt: '2026-09-12T12:00:00.000Z' },
    ]))

    render(<App />)
    expect(screen.getByRole('heading', { name: 'Recent searches' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Open I, ฉัน' }))
    expect(screen.getByRole('heading', { name: 'I' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    await userEvent.click(screen.getByRole('button', { name: 'Remove I' }))
    expect(screen.queryByRole('button', { name: 'Open I, ฉัน' })).not.toBeInTheDocument()
  })
  it('marks the dictionary as search-focused while the search keyboard is active', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/search english or thai/i)

    await userEvent.click(input)

    expect(input.closest('.dictionary')).toHaveClass('search-focused')
    await userEvent.tab()
    expect(input.closest('.dictionary')).not.toHaveClass('search-focused')
  })
  it('restores the mobile page when the on-screen keyboard is dismissed', async () => {
    const viewport = new EventTarget() as VisualViewport
    Object.defineProperty(viewport, 'height', { value: 800, writable: true })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })
    render(<App />)
    const input = screen.getByPlaceholderText(/search english or thai/i)

    await userEvent.click(input)
    Object.defineProperty(viewport, 'height', { value: 400, writable: true })
    viewport.dispatchEvent(new Event('resize'))
    expect(input.closest('.dictionary')).toHaveClass('search-focused')

    Object.defineProperty(viewport, 'height', { value: 800, writable: true })
    viewport.dispatchEvent(new Event('resize'))
    await waitFor(() => expect(input.closest('.dictionary')).not.toHaveClass('search-focused'))
    Reflect.deleteProperty(window, 'visualViewport')
  })
  it('navigates to the favorites empty state', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /favorites/i })[0])
    expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument()
  })
  it('uses four destinations and opens Lesson 1 through the Lessons hub', async () => {
    render(<App />)
    expect(screen.queryByRole('button', { name: 'History' })).not.toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
    expect(screen.getAllByRole('heading', { name: 'Lessons' })).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: /Lesson 1.*Introduction to English/i }))
    expect(screen.getByRole('button', { name: 'Back to Lessons' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Back to Lessons' }).closest('.mobile-head')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Welcome to English!/i })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Back to Lessons' }))
    expect(screen.getAllByRole('heading', { name: 'Lessons' })).toHaveLength(2)
  })
  it('opens Lesson 2 from the Lessons hub and returns with the mobile back button', async () => {
    render(<App />)
    await openLessonTwo()

    expect(screen.getByTestId('mobile-page-title')).toHaveTextContent('Lesson 2')
    expect(screen.getByRole('heading', { name: /Everyday English/i })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Back to Lessons' }))
    expect(screen.getAllByRole('heading', { name: 'Lessons' })).toHaveLength(2)
  })
  it('opens a comprehensive Lesson 3 from the Lessons hub', async () => {
    render(<App />)
    await openLessonThree()

    expect(screen.getByTestId('mobile-page-title')).toHaveTextContent('Lesson 3')
    expect(screen.getByRole('heading', { name: /Build English/i })).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(10)
    expect(screen.getByText(/คำนำหน้า.*การผันกริยา.*ประโยคคำถาม/i)).toBeVisible()
  })
  it('opens Test 1 as a dedicated exam review lesson', async () => {
    render(<App />)
    await openTestOne()

    expect(screen.getByTestId('mobile-page-title')).toHaveTextContent('Test 1')
    expect(screen.getByRole('heading', { name: /Test 1.*Review/i })).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(10)
    expect(screen.getByText(/book page numbers: 11–17.*29.*31.*33.*37–39/i)).toBeVisible()
  })
  it('orders lessons as 01 through 05, then Test 1', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])

    const cards = screen.getAllByRole('button').filter((button) => button.classList.contains('lesson-card'))
    expect(cards.map((button) => button.querySelector('.lesson-card-number')?.textContent)).toEqual(['01', '02', '03', '04', '05', 'T1'])
  })
  it('covers every assigned Test 1 page with detailed English examples', async () => {
    render(<App />)
    await openTestOne()

    await userEvent.click(screen.getByRole('tab', { name: /texts/i }))
    expect(screen.getByRole('heading', { name: 'Hello and welcome!' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'What is your nationality?' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'At the ice cream kiosk' })).toBeVisible()
    const firstEnglish = 'Listen to Excuse me, is there an English course here?'
    const firstThai = 'ขอโทษครับ ที่นี่มีคอร์สภาษาอังกฤษใช่ไหม'
    expect(screen.queryByRole('button', { name: firstEnglish })).not.toBeInTheDocument()
    expect(screen.getAllByText(firstThai)[0]).toBeVisible()
    await userEvent.click(screen.getAllByRole('button', { name: 'Show English' })[0])
    expect(screen.getByRole('button', { name: firstEnglish })).toBeVisible()
    expect(screen.queryByRole('button', { name: /Listen to Yes, there is\. This is English 1\./i })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Hide English' }))
    expect(screen.queryByRole('button', { name: firstEnglish })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reveal all English' }))
    expect(screen.getByRole('button', { name: /Listen to My name is Olga\./i })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Hide all English' }))
    expect(screen.queryByRole('button', { name: firstEnglish })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Listen to My name is Olga\./i })).not.toBeInTheDocument()
    expect(screen.getAllByText(firstThai)[0]).toBeVisible()
    expect(screen.getAllByText('Thai')[0]).toBeVisible()
    expect(screen.getAllByText('I am from Finland.')[0]).toBeVisible()
    expect(screen.getAllByText('I speak Urdu.')).toHaveLength(1)
    expect(screen.getAllByText('receipt')[0]).toBeVisible()
    expect(screen.getAllByText(/be \+ from \+ place/i)[0]).toBeVisible()
    expect(screen.getAllByText(/not … but …/i)[0]).toBeVisible()
    expect(screen.getAllByText(/by.*vehicle/i)[0]).toBeVisible()
    expect(screen.getAllByText(/Language is base form/i)[0]).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: /phrases/i }))
    expect(screen.getAllByText('Enjoy your meal!')[0]).toBeVisible()
    expect(screen.getAllByText('It is nothing!')[0]).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: /days/i }))
    expect(screen.getAllByText('on Wednesday')[0]).toBeVisible()
    expect(screen.getAllByText('the day before yesterday')[0]).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: /numbers/i }))
    expect(screen.getAllByText('twenty-three')[0]).toBeVisible()
    expect(screen.getAllByText('five hundred thousand')[0]).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: /pronouns/i }))
    expect(screen.getAllByText("we're")[0]).toBeVisible()
    expect(screen.getAllByText("they're")[0]).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: /articles/i }))
    expect(screen.getAllByText('an apple')[0]).toBeVisible()
    expect(screen.getAllByText('the apple')[0]).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: /verbs/i }))
    expect(screen.getAllByText('speak')[0]).toBeVisible()
    expect(screen.getAllByText(/do not speak/)[0]).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: /questions/i }))
    expect(screen.getAllByText('Do you not speak English?')[0]).toBeVisible()
    expect(screen.getAllByText('Where are you from?')[0]).toBeVisible()
    expect(screen.getAllByText(/Yes\/No questions often rise/i)[0]).toBeVisible()
  })
  it('teaches every Lesson 3 topic with English audio and personalized examples', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await openLessonThree()

    await userEvent.click(screen.getByRole('tab', { name: /Articles/i }))
    expect(screen.getAllByText('a')[0]).toBeVisible()
    expect(screen.getByText('an apple')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Listen to a book' }))
    expect(speak).toHaveBeenCalledWith('a book')

    await userEvent.click(screen.getByRole('tab', { name: /Verbs/i }))
    expect(screen.getAllByText('speak')[0]).toBeVisible()
    expect(screen.getAllByText('ask')[0]).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Negative/i }))
    expect(screen.getAllByText(/do not speak/)[0]).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Yes \/ No/i }))
    expect(screen.getAllByText('Are you Finnish?')[0]).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Question words/i }))
    expect(screen.getByRole('button', { name: 'Listen to what nationality' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Listen to Where are you going?' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Listen to I am going home.' })).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Introduce/i }))
    expect(screen.getByText('I am from Bangkok, Thailand.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Listen to Thailand' })).toBeVisible()
    expect(screen.getByText(/My native language is Thai/)).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Exercises/i }))
    expect(screen.getByText('EXERCISES')).toBeVisible()
    expect(screen.getByText('in Jyväskylä')).toBeVisible()
    expect(screen.getByText('Are they looking for the bus stop?')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Time/i }))
    expect(screen.getByText('Have a nice weekend')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Check/i }))
    expect(screen.getByText(/คำถาม 1 จาก 15/i)).toBeVisible()
  })
  it('adds Lesson 3 study material to Practice', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])

    expect(screen.getAllByRole('button', { name: /Lesson 3 — Articles.*items/i })[0]).toBeVisible()
    expect(screen.getAllByRole('button', { name: /Lesson 3 — Questions.*items/i })[0]).toBeVisible()
    expect(screen.getByRole('button', { name: /Lesson 3 — Introductions.*items/i })).toBeVisible()
  })
  it('teaches Lesson 2 grammar, days, numbers, and useful sentences with English audio', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await openLessonTwo()

    await userEvent.click(screen.getByRole('tab', { name: /^2\s*Be$/i }))
    expect(screen.getByText("I'm")).toBeVisible()
    expect(screen.getByText('ฉัน เป็น/อยู่/คือ')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Listen to I am' }))
    expect(speak).toHaveBeenCalledWith('I am')

    await userEvent.click(screen.getByRole('tab', { name: /Time/i }))
    expect(screen.getByText('on Monday')).toBeVisible()
    expect(screen.getByText('the day after tomorrow')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Numbers/i }))
    expect(screen.getByText('twenty')).toBeVisible()
    expect(screen.getByText('one billion')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Sentences/i }))
    expect(screen.getByText('Does this bus go to Oulu?')).toBeVisible()
    expect(screen.getByText('รถบัสคันนี้ไปเมือง Oulu หรือเปล่า?')).toBeVisible()
  })
  it('speaks the base weekday names in Lesson 2', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await openLessonTwo()
    await userEvent.click(screen.getByRole('tab', { name: /Time/i }))

    await userEvent.click(screen.getByRole('button', { name: 'Listen to Monday' }))
    expect(speak).toHaveBeenCalledWith('Monday')
    await userEvent.click(screen.getByRole('button', { name: 'Listen to weekend' }))
    expect(speak).toHaveBeenCalledWith('weekend')
  })
  it('removes page subtitles and avoids repeating Lesson 1 on its card', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
    expect(screen.queryByText('Build your English step by step.')).not.toBeInTheDocument()
    const lessonCard = screen.getByRole('button', { name: /Lesson 1.*Introduction to English/i })
    expect(lessonCard).not.toHaveTextContent('LESSON 1')
    expect(lessonCard).toHaveTextContent('Introduction to English')
  })
  it('uses clean page titles and adds Search and Profile to mobile navigation', async () => {
    render(<App />)
    expect(screen.getByTestId('mobile-page-title')).toHaveTextContent('Search')
    expect(screen.queryByRole('button', { name: 'Dictionary' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Search' })).toHaveLength(2)
    await userEvent.click(screen.getAllByRole('button', { name: 'Profile' })[0])
    expect(screen.getByTestId('mobile-page-title')).toHaveTextContent('Profile')
    expect(screen.getByText('Favorite words')).toBeVisible()
    await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
    await userEvent.click(screen.getByRole('button', { name: /Lesson 1.*Introduction to English/i }))
    expect(screen.getByTestId('mobile-page-title')).toHaveTextContent('Lesson 1')
    await userEvent.click(screen.getAllByRole('button', { name: 'Profile' })[0])
    expect(screen.getByTestId('mobile-page-title')).toHaveTextContent('Profile')
  })
  it('focuses Search when its navigation button is pressed and keeps language detection automatic', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
    await userEvent.click(screen.getAllByRole('button', { name: 'Search' })[0])
    await waitFor(() => expect(screen.getByPlaceholderText(/search english or thai/i)).toHaveFocus())
    expect(screen.queryByRole('combobox', { name: 'Translation direction' })).not.toBeInTheDocument()
  })
  it('keeps Words to review above the word groups', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    expect(screen.getByText('Words to review')).toBeVisible()
    expect(screen.queryByText('Due today')).not.toBeInTheDocument()
    expect(screen.queryByText('Mastered')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose a word group' })).toBeVisible()
    expect(screen.queryByRole('group', { name: 'Choose your practice' })).not.toBeInTheDocument()
  })
  it('scrolls to the top when opening pages, practice subpages, and the next question', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    scrollTo.mockClear()

    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'auto' })

    scrollTo.mockClear()
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'auto' })

    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    const card = screen.getByTestId('flashcard-face').closest('.flashcard') as HTMLElement
    card.scrollTop = 120
    await userEvent.click(screen.getByRole('button', { name: 'Know' }))
    expect(card.scrollTop).toBe(0)
  })
  it('flips a flashcard and advances with know or do not know', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await waitFor(() => expect(speak).toHaveBeenCalledWith('Hi!'))
    const card = screen.getByTestId('flashcard-face')
    expect(card).toHaveTextContent('Hi!')
    expect(card).not.toHaveTextContent('หวัดดี!')
    await userEvent.click(card)
    expect(card.querySelector('h1')).toHaveTextContent('Hi!')
    expect(card).toHaveTextContent('หวัดดี!')
    await userEvent.click(card)
    expect(card.querySelector('h1')).toHaveTextContent('Hi!')
    expect(card).not.toHaveTextContent('หวัดดี!')
    const knowButton = screen.getByRole('button', { name: 'Know' })
    const unknownButton = screen.getByRole('button', { name: "Don't know" })
    expect(knowButton).toHaveTextContent(/^✓$/)
    expect(unknownButton).toHaveTextContent(/^✕$/)
    expect(knowButton).toHaveClass('know')
    expect(unknownButton).toHaveClass('dont-know')
    await userEvent.click(knowButton)
    expect(screen.getByTestId('flashcard-face')).toHaveTextContent('and')
    expect(speak).toHaveBeenCalledWith('and')
  })
  it('adds a missed flashcard to Words to review and removes it after a correct review', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    expect(screen.getByRole('button', { name: /0 words to review/i })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await userEvent.click(screen.getByRole('button', { name: "Don't know" }))
    await userEvent.click(screen.getByRole('button', { name: /close practice/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to word groups/i }))

    const reviewButton = screen.getByRole('button', { name: /1 word to review/i })
    expect(reviewButton).toBeEnabled()
    await userEvent.click(reviewButton)
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    expect(screen.getByTestId('flashcard-face')).toHaveTextContent('Hi!')
    await userEvent.click(screen.getByRole('button', { name: 'Know' }))
    expect(screen.getByRole('heading', { name: /Great job!/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /practice again/i }))
    expect(screen.getByRole('button', { name: /0 words to review/i })).toBeDisabled()
  })
  it('opens Lesson 1 with the course alphabet audio and phrase practice', async () => {
    render(<App />)
    await openLessonOne()
    expect(screen.getByRole('heading', { name: /Welcome to English!/i })).toBeInTheDocument()
    expect(screen.queryByText(/alphabet · greetings · pronunciation/i)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Begin with the alphabet/i }))
    expect(screen.getByTestId('alphabet-audio')).toHaveAttribute('src', '/lesson1/004-kappale-1-aakkoset.mp3')
  })
  it('provides a comprehensive Lesson 1 knowledge check', async () => {
    render(<App />)
    await openLessonOne()
    await userEvent.click(screen.getByRole('tab', { name: /Check/i }))
    expect(screen.getByText(/Question 1 of 20/i)).toBeInTheDocument()
    expect(screen.getByText(/Alphabet & sounds/i)).toBeInTheDocument()
  })
  it('includes vocabulary from printed book pages 12 and 13', async () => {
    render(<App />)
    await openLessonOne()
    await userEvent.click(screen.getByRole('tab', { name: /Phrases/i }))
    expect(screen.getByRole('heading', { name: /Book vocabulary/i })).toBeInTheDocument()
    expect(screen.getByText('English course')).toBeInTheDocument()
    expect(screen.getByText('time')).toBeInTheDocument()
    expect(screen.getAllByText('Hi!')[0]).toBeInTheDocument()
  })
  it('speaks English content when it is clicked on the Basics page', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await openLessonOne()
    await userEvent.click(screen.getByRole('tab', { name: /Basics/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Listen to I' }))
    expect(speak).toHaveBeenCalledWith('I')
  })
  it('practises matching an English letter name to its sound', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await openLessonOne()
    await userEvent.click(screen.getByRole('tab', { name: /Sounds/i }))
    expect(screen.getByRole('heading', { name: /Sound matching practice/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Play mystery sound/i }))
    expect(speak).toHaveBeenCalledWith('ay')
    await userEvent.click(screen.getByRole('button', { name: 'A' }))
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next sound/i })).toBeEnabled()
  })
  it('builds a full sound-practice round covering all 26 letters', async () => {
    render(<App />)
    await openLessonOne()
    await userEvent.click(screen.getByRole('tab', { name: /Sounds/i }))
    expect(screen.getByText('1 / 26')).toBeInTheDocument()
    expect(screen.getByText(/Complete all 26 letters/i)).toBeInTheDocument()
  })
  it('includes the complete introductions and small-talk lesson with audio and translations', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await openLessonOne()
    await userEvent.click(screen.getByRole('tab', { name: /Basics/i }))
    expect(screen.getByRole('heading', { name: /Introductions & small talk/i })).toBeInTheDocument()
    expect(screen.getByText("What's your name?")).toBeInTheDocument()
    expect(screen.getByText("How's it going?")).toBeInTheDocument()
    expect(screen.getByText('Not much.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: "Listen to How's it going?" }))
    expect(speak).toHaveBeenCalledWith("How's it going?")
  })
  it('splits lesson vocabulary into selectable practice groups of at most ten items', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    expect(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vocab — Page 12 \(4\).*8 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Useful Phrases — Pages 12–13 \(4\).*4 items/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    expect(screen.getByText('Vocab — Page 12 (1)')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /listen to/i })).toHaveLength(10)
  })
  it('keeps word-group cards connected within their category and separates other categories', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])

    const vocabOne = screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i })
    const vocabTwo = screen.getByRole('button', { name: /Vocab — Page 12 \(2\).*10 items/i })
    const phrasesOne = screen.getByRole('button', { name: /Useful Phrases — Pages 12–13 \(1\).*10 items/i })

    expect(vocabOne.closest('.practice-group-section')).toBe(vocabTwo.closest('.practice-group-section'))
    expect(vocabOne.closest('.practice-group-section')).not.toBe(phrasesOne.closest('.practice-group-section'))
  })
  it('offers number and color word groups in chunks of at most ten', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    expect(screen.getByRole('button', { name: /Numbers \(1\).*10 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Numbers \(3\).*9 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Colors \(1\).*10 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Colors \(2\).*2 items/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Numbers \(1\).*10 items/i }))
    expect(screen.getByText('Numbers (1)')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    expect(screen.getByTestId('flashcard-face')).toHaveTextContent('zero')
  })
  it('adds missing Lesson 2 vocabulary to Practice with Thai translations', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])

    expect(screen.getByRole('button', { name: /Lesson 2 — Be verbs \(1\).*10 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lesson 2 — Days & Time \(1\).*10 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lesson 2 — Numbers \(1\).*6 items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lesson 2 — Everyday Sentences \(1\).*10 items/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Lesson 2 — Days & Time \(1\).*10 items/i }))
    expect(screen.getByText('Tuesday')).toBeVisible()
    expect(screen.getByText('on Monday')).toBeVisible()
    expect(screen.getByText('ในวันจันทร์')).toBeVisible()
  })
  it('shows a group word list before choosing a practice mode and starting', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    expect(screen.getByRole('heading', { name: 'Choose a word group' })).toBeVisible()
    expect(screen.queryByRole('group', { name: 'Choose your practice' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))

    expect(screen.getByRole('heading', { name: 'Colors (2)' })).toBeVisible()
    expect(screen.queryByText('WORD GROUP')).not.toBeInTheDocument()
    expect(screen.getByText('brown')).toBeVisible()
    expect(screen.getByText('สีน้ำตาล')).toBeVisible()
    expect(screen.getByText('turquoise')).toBeVisible()
    expect(screen.getByText('สีฟ้าอมเขียว')).toBeVisible()
    expect(screen.getByRole('group', { name: 'Choose your practice' })).toBeVisible()
    expect(screen.queryByTestId('flashcard-face')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /multiple choice/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    expect(screen.getByRole('heading', { name: 'brown' })).toBeInTheDocument()
  })
  it('puts practice choices first and keeps an icon-only play control beside Practice', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))

    const choices = screen.getByRole('group', { name: 'Choose your practice' }).closest('.preview-practice-options')!
    const wordList = screen.getByText('brown').closest('.practice-word-list')!
    const play = screen.getByRole('button', { name: 'Play all words' })
    const start = screen.getByRole('button', { name: 'Start practice' })

    expect(choices.compareDocumentPosition(wordList) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(play).toHaveTextContent('')
    expect(play.parentElement).toBe(start.parentElement)
    expect(choices.compareDocumentPosition(play.parentElement!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(play.parentElement!.compareDocumentPosition(wordList) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
  it('plays every word in the selected group in list order', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockImplementation((_text, onEnd) => {
      onEnd?.()
      return true
    })
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))

    await userEvent.click(screen.getByRole('button', { name: /play all words/i }))

    expect(speak.mock.calls.map(([text]) => text)).toEqual(['brown', 'turquoise'])
  })
  it('highlights each word while Play all is speaking it', async () => {
    let finishCurrent: (() => void) | undefined
    vi.spyOn(ttsService, 'speak').mockImplementation((_text, onEnd) => {
      finishCurrent = onEnd
      return true
    })
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))

    await userEvent.click(screen.getByRole('button', { name: /play all words/i }))
    expect(screen.getByText('brown').closest('.practice-word-row')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('turquoise').closest('.practice-word-row')).not.toHaveAttribute('aria-current')

    act(() => finishCurrent?.())
    expect(screen.getByText('brown').closest('.practice-word-row')).not.toHaveAttribute('aria-current')
    expect(screen.getByText('turquoise').closest('.practice-word-row')).toHaveAttribute('aria-current', 'true')
  })
  it('marks long flashcard words for a smaller responsive type size', async () => {
    localStorage.setItem('sisu-english:favorites:v1', JSON.stringify([{
      id: 'long-word', english: 'supercalifragilisticexpialidocious', thai: 'a very long word',
      favorite: true, createdAt: '2026-09-13T10:00:00.000Z', nextReviewAt: '2026-09-13T10:00:00.000Z',
      difficulty: 'new', mastered: false,
    }]))
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Favorites.*1 item/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))

    expect(screen.getByRole('heading', { name: /supercalifragilisticexpialidocious/i })).toHaveClass('word-extra-long')
  })
  it('keeps multiple-choice content mounted and adds Continue after an answer', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /multiple choice/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    const choices = screen.getAllByTestId('multiple-choice-option').map((option) => option.textContent)
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'สีฟ้าอมเขียว' }))
    expect(screen.getAllByTestId('multiple-choice-option').map((option) => option.textContent)).toEqual(choices)
    expect(screen.getByRole('button', { name: 'Continue' }).closest('.quiz-action')).toBeInTheDocument()
  })
  it('hides the matching title while preserving an accessible label', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /^matching$/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    expect(screen.queryByRole('heading', { name: 'Match the pairs' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Match the pairs' })).toBeVisible()
    expect(screen.queryByText('Connect English with Thai')).not.toBeInTheDocument()
  })
  it('saves a group level from first attempts only after completion', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /multiple choice/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await userEvent.click(screen.getByRole('button', { name: 'สีฟ้าอมเขียว' }))
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.click(screen.getByRole('button', { name: 'สีฟ้าอมเขียว' }))
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.click(screen.getByRole('button', { name: 'สีน้ำตาล' }))
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.click(screen.getByRole('button', { name: /practice again/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to word groups/i }))

    expect(screen.getByLabelText('Level 3 of 5, latest score 50 percent')).toBeVisible()
  })

  it('does not change a group level when a session is closed early', async () => {
    localStorage.setItem('sisu-english:practice-progress:v1', JSON.stringify({
      reviewWords: [],
      groups: {
        'colors-2': { groupId: 'colors-2', level: 4, accuracy: 75, completedAt: '2026-09-11T10:00:00.000Z' },
      },
    }))
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Know' }))
    await userEvent.click(screen.getByRole('button', { name: /close practice/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to word groups/i }))

    expect(screen.getByLabelText('Level 4 of 5, latest score 75 percent')).toBeVisible()
  })
  it('randomizes every practice mode again whenever a group is opened', async () => {
    vi.mocked(Math.random).mockReturnValue(0)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    expect(screen.getByTestId('flashcard-face')).toHaveTextContent('and')
    await userEvent.click(screen.getByRole('button', { name: /close practice/i }))
    vi.mocked(Math.random).mockReturnValue(0.999)
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    expect(screen.getByTestId('flashcard-face')).toHaveTextContent('Hi!')
  })
  it('speaks multiple-choice prompts and gives correct and incorrect audio feedback', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /multiple choice/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await waitFor(() => expect(speak).toHaveBeenCalledWith('Hi!'))
    speak.mockClear()
    await userEvent.click(screen.getByRole('button', { name: /listen to hi/i }))
    expect(speak).toHaveBeenCalledWith('Hi!', expect.any(Function), expect.any(Function))
    await userEvent.click(screen.getByRole('button', { name: 'หวัดดี!' }))
    expect(speak).toHaveBeenCalledWith('correct')
  })
  it('builds multiple-choice alternatives only from answers in the selected group', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /multiple choice/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    const choices = screen.getAllByTestId('multiple-choice-option')
    expect(choices).toHaveLength(2)
    expect(choices.map((choice) => choice.textContent).sort()).toEqual(['สีน้ำตาล', 'สีฟ้าอมเขียว'])
  })
  it('repeats missed multiple-choice words until every word is answered correctly', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /multiple choice/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await userEvent.click(screen.getByRole('button', { name: 'และ' }))
    expect(JSON.parse(localStorage.getItem('sisu-english:practice-progress:v1') || '{}').reviewWords).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    for (const answer of ['และ', 'ยินดีต้อนรับ!', 'ขอโทษ!', 'คือ/เป็น', 'ที่นี่', 'คอร์สภาษาอังกฤษ', 'ใช่', 'เป็น/อยู่/คือ', 'นี่']) {
      await userEvent.click(screen.getByRole('button', { name: answer }))
      await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    }
    expect(screen.getByRole('heading', { name: 'Hi!' })).toBeInTheDocument()
    expect(screen.getByText('9 of 10')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'หวัดดี!' }))
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByRole('heading', { name: /Great job!/i })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('sisu-english:practice-progress:v1') || '{}').reviewWords).toHaveLength(1)
  })
  it('matches one pair at a time, speaks English, and fades completed pairs', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /^matching$/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    const englishCards = screen.getAllByTestId('match-en')
    const thaiCards = screen.getAllByTestId('match-th')
    englishCards.forEach((card, row) => {
      expect(card.dataset.matchId).not.toBe(thaiCards[row].dataset.matchId)
    })
    await userEvent.click(screen.getByRole('button', { name: 'Hi!' }))
    expect(speak).toHaveBeenCalledWith('Hi!')
    await userEvent.click(screen.getByRole('button', { name: 'หวัดดี!' }))
    expect(screen.getByRole('button', { name: 'Hi!' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'หวัดดี!' })).toBeDisabled()
  })
  it('adds both mismatched words to review and removes each correct matching pair', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Colors \(2\).*2 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /^matching$/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await userEvent.click(screen.getByRole('button', { name: 'brown' }))
    await userEvent.click(screen.getByRole('button', { name: 'สีฟ้าอมเขียว' }))
    expect(JSON.parse(localStorage.getItem('sisu-english:practice-progress:v1') || '{}').reviewWords).toHaveLength(2)

    await userEvent.click(screen.getByRole('button', { name: 'brown' }))
    await userEvent.click(screen.getByRole('button', { name: 'สีน้ำตาล' }))
    expect(JSON.parse(localStorage.getItem('sisu-english:practice-progress:v1') || '{}').reviewWords).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'turquoise' }))
    await userEvent.click(screen.getByRole('button', { name: 'สีฟ้าอมเขียว' }))
    expect(JSON.parse(localStorage.getItem('sisu-english:practice-progress:v1') || '{}').reviewWords).toHaveLength(2)
  })
  it('shows selected letters inside the fill-in-the-blank prompt', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /fill in the blank/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    expect(screen.getByRole('heading', { name: 'หวัดดี!' })).toHaveClass('blank-question')
    expect(screen.queryByText(/Hint:/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /listen to hi/i })).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/type the missing/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('live-blank')).toHaveTextContent('_ _ !')
    await chooseLetters('Hi')
    expect(screen.getByTestId('live-blank')).toHaveTextContent('h i !')
    await userEvent.click(screen.getByRole('button', { name: /check answer/i }))
    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /check answer/i })).not.toBeInTheDocument()
    expect(screen.queryByTestId('blank-answer-reveal')).not.toBeInTheDocument()
    expect(screen.getByTestId('blank-answer-row')).toHaveTextContent('H i !')
    expect(screen.getByTestId('blank-answer-row')).toContainElement(
      screen.getByRole('button', { name: /listen to hi/i }),
    )
  })
  it('builds a fill-in answer from fading letter tiles and restores the last tile on delete', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /fill in the blank/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))

    expect(screen.queryByPlaceholderText(/type the missing/i)).not.toBeInTheDocument()
    const h = screen.getByRole('button', { name: /choose letter h/i })
    await userEvent.click(h)
    expect(screen.getByTestId('live-blank')).toHaveTextContent('h _ !')
    expect(h).toHaveClass('used')
    await userEvent.click(screen.getByRole('button', { name: 'Delete last letter' }))
    expect(screen.getByTestId('live-blank')).toHaveTextContent('_ _ !')
    expect(h).not.toHaveClass('used')
  })
  it('checks fill-in answers from letters only without requiring punctuation', async () => {
    const speak = vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /fill in the blank/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await chooseLetters('Hi')
    expect(screen.getByTestId('live-blank')).toHaveTextContent('h i !')
    await userEvent.click(screen.getByRole('button', { name: /check answer/i }))
    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(speak).toHaveBeenCalledWith('Hi!')
    speak.mockClear()
    await userEvent.click(screen.getByRole('button', { name: /listen to hi/i }))
    expect(speak).toHaveBeenCalledWith('Hi!', expect.any(Function), expect.any(Function))
  })
  it('preserves a visibly wider gap between words in fill-in prompts', async () => {
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /fill in the blank/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    for (const answer of ['Hi', 'and', 'Welcome', 'Sorry', 'is', 'here']) {
      await chooseLetters(answer)
      await userEvent.click(screen.getByRole('button', { name: /check answer/i }))
      await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    }
    const prompt = screen.getByTestId('live-blank')
    expect(prompt.textContent).toContain('_   _')
    expect(getComputedStyle(prompt).whiteSpace).toBe('pre-wrap')
  })
  it('repeats missed fill-in words until every word is answered correctly', async () => {
    vi.spyOn(ttsService, 'speak').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getAllByRole('button', { name: /practice/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /Vocab — Page 12 \(1\).*10 items/i }))
    await userEvent.click(screen.getByRole('button', { name: /fill in the blank/i }))
    await userEvent.click(screen.getByRole('button', { name: /start practice/i }))
    await chooseLetters('iH')
    await userEvent.click(screen.getByRole('button', { name: /check answer/i }))
    expect(JSON.parse(localStorage.getItem('sisu-english:practice-progress:v1') || '{}').reviewWords).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    for (const answer of ['and', 'Welcome', 'Sorry', 'is', 'here', 'English course', 'yes', 'to be', 'this']) {
      await chooseLetters(answer)
      await userEvent.click(screen.getByRole('button', { name: /check answer/i }))
      await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    }
    expect(screen.getByTestId('live-blank')).toHaveTextContent('_ _ !')
    expect(screen.getByText('9 of 10')).toBeInTheDocument()
    await chooseLetters('Hi')
    await userEvent.click(screen.getByRole('button', { name: /check answer/i }))
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByRole('heading', { name: /Great job!/i })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('sisu-english:practice-progress:v1') || '{}').reviewWords).toHaveLength(1)
  })
})