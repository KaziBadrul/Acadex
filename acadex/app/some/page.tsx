"use client"

import React, { useEffect, useRef, useState } from 'react'

const Page = () => {
  const [listening, setListening] = useState(false)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any | null>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      recognitionRef.current = null
      return
    }

    const recog = new SpeechRecognition()
    recog.lang = 'en-US'
    recog.interimResults = true
    recog.maxAlternatives = 1

    recog.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) final += res[0].transcript
        else interim += res[0].transcript
      }

      if (final) {
        setFinalTranscript(prev => (prev ? prev + ' ' : '') + final.trim())
        setInterimTranscript('')
      } else {
        setInterimTranscript(interim)
      }
    }

    recog.onend = () => {
      setListening(false)
    }

    recog.onerror = (e: any) => {
      console.error('Speech recognition error', e)
      setListening(false)
    }

    recognitionRef.current = recog

    return () => {
      try {
        recog.stop()
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null
    }
  }, [])

  const toggleListening = () => {
    const recog = recognitionRef.current
    if (!recog) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (listening) {
      try {
        recog.stop()
      } catch (e) {}
      setListening(false)
    } else {
      setInterimTranscript('')
      // do not clear finalTranscript so user can append across sessions
      try {
        recog.start()
        setListening(true)
      } catch (e: any) {
        // Some browsers throw if start() is called twice quickly
        console.error(e)
        alert('Could not start speech recognition: ' + e?.message)
      }
    }
  }

  const clearTranscript = () => {
    setFinalTranscript('')
    setInterimTranscript('')
  }

  return (
    <div>
      <h2>Voice → Text</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={toggleListening}>{listening ? 'Stop Recording' : 'Start Recording'}</button>
        <button onClick={clearTranscript}>Clear</button>
        <span style={{ color: listening ? 'green' : 'gray' }}>{listening ? 'Listening…' : 'Idle'}</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Transcript</strong>
        <div style={{ whiteSpace: 'pre-wrap', marginTop: 8, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
          {finalTranscript} {interimTranscript && (<em style={{ color: '#666' }}>{interimTranscript}</em>)}
        </div>
      </div>
    </div>
  )
}

export default Page