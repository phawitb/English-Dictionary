let speaking = false
let activeRequest = 0
export const ttsService = {
  supported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  speak(text: string, onEnd?: () => void, onError?: () => void) {
    if (!this.supported()) return false
    if (speaking) { speechSynthesis.cancel(); speaking = false }
    const requestId = ++activeRequest
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'; utterance.rate = .86
    const voices = speechSynthesis.getVoices?.() || []
    const englishVoice = voices.find(voice => voice.lang.toLowerCase() === 'en-us') || voices.find(voice => voice.lang.toLowerCase().startsWith('en'))
    if (englishVoice) utterance.voice = englishVoice
    utterance.onend = () => {
      if (requestId !== activeRequest) return
      speaking = false; onEnd?.()
    }
    utterance.onerror = () => {
      if (requestId !== activeRequest) return
      speaking = false; onError?.()
    }
    speaking = true; speechSynthesis.speak(utterance); return true
  },
  stop() {
    activeRequest += 1
    if (this.supported()) speechSynthesis.cancel()
    speaking = false
  }
}
