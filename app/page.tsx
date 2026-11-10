"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  feedbackDataSource,
  type FeedbackRecord,
  type FeedbackSentiment,
} from "@/lib/feedback-data-source";

const sentimentOptions: {
  value: FeedbackSentiment;
  label: string;
  icon: string;
}[] = [
  { value: "positive", label: "Positive", icon: "☺" },
  { value: "neutral", label: "Neutral", icon: "◉" },
  { value: "negative", label: "Needs care", icon: "☹" },
];

const starterIdeas = [
  "A ride to a medical appointment",
  "A warm meal for a neighbor",
  "A few hours of helping hands",
];

export default function Home() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [product, setProduct] = useState("");
  const [message, setMessage] = useState("");
  const [sentiment, setSentiment] = useState<FeedbackSentiment>("positive");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecords(feedbackDataSource.listFeedback());
    setReady(true);
  }, []);

  const summary = useMemo(() => {
    const count = records.length;
    const positive = records.filter((record) => record.sentiment === "positive").length;
    const people = new Set(records.map((record) => record.product.toLowerCase())).size;
    return { count, positive, people };
  }, [records]);

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      feedbackDataSource.addFeedback(product, sentiment, message);
      setRecords(feedbackDataSource.listFeedback());
      setProduct("");
      setMessage("");
      setSentiment("positive");
      setNotice("Thank you for sharing a little good with us.");
      window.setTimeout(() => setNotice(""), 4500);
    } catch {
      setNotice("Please add a name and a note before sharing.");
    }
  }

  function useIdea(idea: string) {
    setMessage(idea);
    document.getElementById("share-note")?.focus();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9f6] text-[#24352d]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
        <a href="#home" className="flex items-center gap-3" aria-label="Rose Foundation home">
          <span className="brand-mark" aria-hidden="true">r</span>
          <span className="text-[15px] font-semibold tracking-[-0.03em]">rose foundation</span>
        </a>
        <nav className="hidden items-center gap-9 text-sm text-[#69776e] sm:flex">
          <a className="nav-link" href="#about">Our purpose</a>
          <a className="nav-link" href="#stories">Community notes</a>
          <a className="nav-link" href="#share">Share a note</a>
        </nav>
        <a href="#share" className="rounded-full bg-[#294338] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#3a5a49]">Be part of it <span aria-hidden="true">↗</span></a>
      </header>

      <section id="home" className="hero-shell relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-10 sm:px-10 md:grid-cols-[1.05fr_.95fr] md:pb-28 md:pt-16 lg:px-14">
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow"><span className="eyebrow-dot" /> A little care goes a long way</p>
          <h1 className="hero-title mt-7">Good grows<br />when we <span>give.</span></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-[#69776e] sm:text-lg sm:leading-8">Small acts of kindness make a stronger community. Share what you’ve seen, what you need, or one good thing you can offer.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#share" className="button-primary">Share a little good <span aria-hidden="true">↗</span></a>
            <a href="#stories" className="button-quiet">Explore community notes <span aria-hidden="true">↓</span></a>
          </div>
          <div className="mt-12 flex items-center gap-4 border-t border-[#e8e7df] pt-6">
            <div className="avatar-stack" aria-hidden="true"><span>M</span><span>A</span><span>J</span><span>+</span></div>
            <p className="text-xs leading-5 text-[#69776e]"><strong className="text-[#294338]">A community, not a crowd.</strong><br />Every note is a seed for something good.</p>
          </div>
        </div>

        <div className="hero-art" aria-label="Illustration of a garden with flowers and a caring community">
          <div className="sun-glow" />
          <div className="art-note note-top"><span>✳</span> kindness is contagious</div>
          <div className="garden-card">
            <div className="garden-sky"><div className="cloud cloud-one"/><div className="cloud cloud-two"/><div className="sun"/><div className="hill hill-back"/><div className="hill hill-front"/></div>
            <div className="flower flower-one"><i/><b/><span/></div>
            <div className="flower flower-two"><i/><b/><span/></div>
            <div className="flower flower-three"><i/><b/><span/></div>
            <div className="flower flower-four"><i/><b/><span/></div>
            <div className="garden-caption"><span className="caption-icon">✿</span><span><strong>Good things take root here</strong><small>One note. One neighbor. One new beginning.</small></span><span className="caption-arrow">↗</span></div>
          </div>
          <div className="art-note note-bottom"><span className="tiny-flower">✿</span> rooted in care</div>
          <div className="art-sparkle sparkle-one">✳</div><div className="art-sparkle sparkle-two">✧</div>
        </div>
      </section>

      <section id="about" className="community-strip">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-9 sm:px-10 md:grid-cols-[1fr_auto] md:items-center lg:px-14">
          <div><p className="eyebrow eyebrow-small">The ripple effect</p><h2 className="mt-2 text-xl font-medium tracking-[-0.04em] sm:text-2xl">A kinder day starts with <span className="serif-italic">one small thing.</span></h2></div>
          <div className="stats-row"><div><strong>{ready ? summary.count : "—"}</strong><span>notes shared</span></div><i/><div><strong>{ready ? summary.positive : "—"}</strong><span>good moments</span></div><i/><div><strong>{ready ? summary.people : "—"}</strong><span>neighbors</span></div></div>
        </div>
      </section>

      <section id="stories" className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 md:grid-cols-[.8fr_1.2fr] md:py-28 lg:px-14">
        <div className="max-w-sm"><p className="eyebrow"><span className="eyebrow-dot"/> From our community</p><h2 className="section-title mt-5">A small note can <span className="serif-italic">mean so much.</span></h2><p className="mt-5 text-sm leading-7 text-[#69776e]">Every message here is a reminder that care is already happening all around us.</p><a href="#share" className="inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#294338]">Add your voice <span>↗</span></a></div>
        <div className="notes-list">
          {records.length === 0 ? (
            <article className="note-card empty-note"><div className="note-quote">“</div><div><p className="note-text">The first kind thing you notice could be the start of a beautiful story.</p><p className="note-byline">Your community is listening <span>✿</span></p></div><span className="note-number">01</span></article>
          ) : records.slice(0, 4).map((record, index) => <article className="note-card" key={record.id}><div className="note-quote">“</div><div><p className="note-text">{record.message}</p><p className="note-byline">{record.product} <span>·</span> {new Date(record.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p></div><span className="note-number">{String(index + 1).padStart(2, "0")}</span></article>)}
        </div>
      </section>

      <section id="share" className="share-section">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-2 md:items-center md:py-24 lg:px-14">
          <div><p className="eyebrow eyebrow-light"><span className="eyebrow-dot"/> Your turn to plant a seed</p><h2 className="section-title mt-5 text-[#fffdf8]">What good can <span className="serif-italic">we grow?</span></h2><p className="mt-5 max-w-sm text-sm leading-7 text-[#c2d0c4]">A need, a thank-you, a helping hand, or a moment that made you smile. There’s room for it here.</p>
            <div className="mt-8 space-y-3">{starterIdeas.map((idea) => <button key={idea} className="idea-pill" onClick={() => useIdea(idea)} type="button"><span>✿</span>{idea}<b>↗</b></button>)}</div>
          </div>
          <form className="feedback-form" onSubmit={submitFeedback}>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#829285]">Community note</p><h3 className="mt-2 text-xl font-medium tracking-[-.04em]">Leave a little good</h3></div><span className="form-flower">✿</span></div>
            <label className="form-label mt-7" htmlFor="product-name">Your name or the good thing</label>
            <input id="product-name" className="form-input" value={product} onChange={(event) => setProduct(event.target.value)} placeholder="e.g. Maya, a meal train…" maxLength={80} required />
            <label className="form-label mt-5" htmlFor="share-note">Your note</label>
            <textarea id="share-note" className="form-input min-h-24 resize-y" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us about a little good…" maxLength={500} required />
            <fieldset className="mt-5"><legend className="form-label">How does it feel?</legend><div className="mt-2 grid grid-cols-3 gap-2">{sentimentOptions.map((option) => <button type="button" key={option.value} onClick={() => setSentiment(option.value)} className={`sentiment-button ${sentiment === option.value ? "sentiment-selected" : ""}`} aria-pressed={sentiment === option.value}><span>{option.icon}</span>{option.label}</button>)}</div></fieldset>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><button className="button-primary button-submit" type="submit">Share your note <span>↗</span></button><span className="text-[11px] text-[#829285]">Saved on this device</span></div>
            <p aria-live="polite" className="mt-3 min-h-5 text-xs text-[#526c5b]">{notice}</p>
          </form>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-xs text-[#879188] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14"><a href="#home" className="flex items-center gap-2 font-semibold text-[#294338]"><span className="brand-mark brand-mark-small">r</span> rose foundation</a><p>Made with care, for the good we grow together. <span className="text-[#b88969]">✿</span></p><a href="#share" className="font-medium text-[#526c5b]">Share a little good ↑</a></footer>
    </main>
  );
}
