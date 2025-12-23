"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";


export default function Page() {
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }

      if (final) {
        setFinalTranscript((prev) =>
          prev ? prev + " " + final.trim() : final.trim()
        );
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
      }
    };

    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);

    recognitionRef.current = recog;

    return () => {
      try {
        recog.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    const recog = recognitionRef.current;

    if (!recog) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (listening) {
      recog.stop();
      setListening(false);
    } else {
      setInterimTranscript("");
      try {
        recog.start();
        setListening(true);
      } catch (e: any) {
        alert("Could not start speech recognition.");
      }
    }
  };

  const clearTranscript = () => {
    setFinalTranscript("");
    setInterimTranscript("");
  };

  const router = useRouter();

const saveToNote = () => {
  if (!finalTranscript.trim()) {
    alert("No transcription to save.");
    return;
  }

  localStorage.setItem("voice_transcript", finalTranscript);
  router.push("/notes/create"); // your NoteForm page
};


  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🎙️ Voice to Text
          </h1>
          <p className="text-gray-500 mt-1">
            Convert your speech into written text in real time
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={toggleListening}
              className={`px-5 py-2 rounded-lg font-semibold text-white transition
                ${
                  listening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {listening ? "Stop Recording" : "Start Recording"}
            </button>

            <button
              onClick={clearTranscript}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Clear
            </button>

            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full w-fit
                ${
                  listening
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }
              `}
            >
              {listening ? "Listening…" : "Idle"}
            </span>
          </div>

          {/* Transcript */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Transcript
            </h2>

            <div className="min-h-[150px] border rounded-lg p-4 bg-gray-50 text-gray-800 whitespace-pre-wrap">
              {finalTranscript || interimTranscript ? (
                <>
                  {finalTranscript}
                  {interimTranscript && (
                    <em className="text-gray-500"> {interimTranscript}</em>
                  )}
                </>
              ) : (
                <span className="text-gray-400">
                  Your transcribed text will appear here…
                </span>
              )}

            </div>
            <button
  onClick={saveToNote}
  className="bg-green-600 mt-2 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
>
  ➕ Insert into Note
</button>
          </div>
        </div>
      </div>
    </div>
  );
}
