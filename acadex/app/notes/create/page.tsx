import NoteForm from '@/components/NoteForm'
import React from 'react'

export default function NoteCreate() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="flex h-screen overflow-hidden">
        {/* left sidebar - clean and modern */}
        <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-neutral-200/60 p-6 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight">Acadex</div>
          </div>
          <nav className="flex-1 space-y-1.5 text-sm font-medium">
            <a href="/dashboard" className="flex items-center gap-3 p-3 text-neutral-600 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200">
              <span className="text-lg">🏠</span>
              <span>Dashboard</span>
            </a>
            <a href="/notes/create" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50 border border-indigo-100/50 transition-all duration-200">
              <span className="text-lg drop-shadow-sm">✨</span>
              <span>New Note</span>
            </a>
            <a href="/notes" className="flex items-center gap-3 p-3 text-neutral-600 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200">
              <span className="text-lg">📚</span>
              <span>All Notes</span>
            </a>
            <a href="/groups" className="flex items-center gap-3 p-3 text-neutral-600 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200">
              <span className="text-lg">👥</span>
              <span>Groups</span>
            </a>
          </nav>
          <div className="mt-auto pt-6 border-t border-neutral-100 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-200 to-indigo-100 shrink-0 border border-indigo-50"></div>
              <div className="text-xs truncate">
                <p className="font-bold text-neutral-900">Personal Workspace</p>
                <p className="text-neutral-500 font-medium">Free Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* main editor area */}
        <main className="flex-1 overflow-y-auto relative w-full main-scrollbar">
          {/* Subtle background effects */}
          <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 via-purple-50/20 to-transparent pointer-events-none"></div>

          <div className="max-w-[1100px] mx-auto p-6 md:p-10 lg:p-12 relative z-10 w-full">
            <div className="mb-10 px-2 lg:px-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200 shadow-sm mb-6 text-xs font-bold tracking-wide text-neutral-600 uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Note Editor
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                Capture your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">brilliance</span>.
              </h1>
              <p className="text-neutral-500 mt-3 text-lg font-medium max-w-2xl text-balance">
                Craft, manage, and share your academic notes with powerful built-in tools.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-white p-6 md:p-8 lg:p-10 mb-20 transition-all duration-300 ring-1 ring-neutral-900/5">
              <NoteForm />
            </div>
          </div>
        </main>

        {/* right sidebar */}
        <aside className="hidden 2xl:flex flex-col w-[320px] bg-white/40 backdrop-blur-2xl border-l border-neutral-200/60 p-6 z-10">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Workspace Assets
            </h3>
            <ul className="space-y-2.5">
              <li className="group flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-neutral-50 transition-colors border border-neutral-100 hover:border-neutral-200 shadow-sm shadow-neutral-100/50 cursor-pointer">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">📄</div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-neutral-800 truncate group-hover:text-indigo-600 transition-colors">Lecture_01.pdf</p>
                    <p className="text-xs font-medium text-neutral-400">Added just now</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg">112k</span>
              </li>
              <li className="group flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-neutral-50 transition-colors border border-neutral-100 hover:border-neutral-200 shadow-sm shadow-neutral-100/50 cursor-pointer">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">🖼️</div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-neutral-800 truncate group-hover:text-indigo-600 transition-colors">Board_photo.png</p>
                    <p className="text-xs font-medium text-neutral-400">2 hours ago</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg">1.2m</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 focus-within:ring hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/10 border border-indigo-400/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700 pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> Quick Tips
              </h3>
              <ul className="text-sm space-y-4 font-medium text-indigo-50/90 leading-relaxed">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white/50 shrink-0"></div>
                  <p>Organize better by adding course codes to titles.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white/50 shrink-0"></div>
                  <p>Upload handwritten notes; Acadex auto-scans them!</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white/50 shrink-0"></div>
                  <p>Use voice dictation for faster note-taking.</p>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}