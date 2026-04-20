export type SampleScript = {
  title: string;
  text: string;
};

export const sampleScripts: SampleScript[] = [
  {
    title: "Product Demo Pitch",
    text: `Good morning everyone. Today I want to show you something we've been building for the past six months. It started with a simple question: why is it still so hard to speak confidently on camera? We built this tool to solve that. What you're looking at is a teleprompter that listens to you — not the other way around. It scrolls as you speak, holds when you go off script, and jumps ahead when you skip a line. No foot pedals. No remote. Just your voice. Let me show you how it works.`,
  },
  {
    title: "News Broadcast Intro",
    text: `Good evening. I'm your host and this is the nightly report. Tonight's top stories: scientists announce a breakthrough in renewable energy storage that could power an entire city for a week on a single charge. In local news, the city council voted unanimously to expand the public transit network, adding twelve new routes by the end of the year. And in sports, the home team clinched the championship title in a stunning overtime victory. Stay with us as we break down the details on each of these stories.`,
  },
  {
    title: "Wedding Speech",
    text: `For those of you who don't know me, I'm the best man — and I've been trying to write this speech for three months. I gave up last Tuesday and decided to just speak from the heart. I met Jamie on the first day of university. We were both lost, looking for the same lecture hall, and we both gave each other completely wrong directions. That pretty much sums up our friendship. But here's what I know for certain: the two of you are better together than you are apart. To Jamie and Alex — may your life together be full of laughter, adventure, and better navigation skills than Jamie has ever shown me.`,
  },
  {
    title: "Tech Talk Opener",
    text: `Thank you for having me. I want to start with a number: three hundred milliseconds. That's the threshold at which a delay stops feeling like a delay and starts feeling like the system is broken. Everything I'm going to talk about today lives inside that window. We're going to look at how modern speech recognition systems handle latency, why most of them fail at it, and what a different architecture looks like when you design for real-time from day one. By the end of this talk, I want you to walk away with three concrete ideas you can bring back to your own systems.`,
  },
];
