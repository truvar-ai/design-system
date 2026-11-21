// Types for `@truvar-ai/design-system/voice`: stereo call player, transcript, logs, live call widget and workflow builder.
import type * as React from "react";

/* ------------------------------------------------------------------ */
/* Shared shapes                                                       */
/* ------------------------------------------------------------------ */

/** Who is speaking: the AI agent (left channel) or the customer (right channel). */
export type CallSpeaker = "agent" | "customer";
/** Bilingual text; the component shows the entry matching the current locale (`ar` for Arabic locales, otherwise `en`). */
export interface LocalizedText {
  en: string;
  ar: string;
}
/** Plain text, or bilingual text (a plain string is shown as is in every language). */
export type MaybeLocalizedText = string | LocalizedText;
/** Kinds of call events. `tool` and `end` get their own icon/colour in the transcript; `interrupt` is highlighted on the waveform. */
export type CallEventKind = "tool" | "interrupt" | "end";
/** Severity levels of a log line. */
export type CallLogLevel = "checkpoint" | "log" | "tool" | "warning" | "error";
/** CSS length (px number or any string such as `"60vh"`) used for `maxHeight` / `height` props. */
export type CssLength = number | string;

/** A stereo recording: agent on the left channel, customer on the right. */
export interface CallRecording {
  /** Agent channel samples, -1 to 1. */
  left: Float32Array;
  /** Customer channel samples, -1 to 1. */
  right: Float32Array;
  /** Samples per second. */
  sampleRate: number;
  /** Length in seconds. */
  duration: number;
}
/** A stretch of silence, in seconds from the start. */
export interface Silence {
  start: number;
  end: number;
}

/** A call event marker on the waveform, shown as a diamond that seeks when pressed. */
export interface WaveformEvent {
  /** Time in seconds. */
  t: number;
  kind: CallEventKind;
  /** Localised label (a plain string). */
  label: string;
}
/** A call event listed in the transcript between turns. */
export interface TranscriptEvent {
  /** Time in seconds. */
  t: number;
  kind: CallEventKind;
  label: MaybeLocalizedText;
}
/** One spoken turn of the call. */
export interface TranscriptTurn {
  /** Unique id (used for scroll-follow). */
  id: string;
  speaker: CallSpeaker;
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
  text: MaybeLocalizedText;
  /** Agent response latency in ms; omit or `null` to hide. */
  latency?: number | null;
}
/** One line of the call log. */
export interface CallLogEntry {
  /** Time in seconds from the start of the recording (used to seek). */
  t: number;
  level: CallLogLevel;
  /** Message text (searchable). */
  msg: string;
  /** Pre-formatted clock text shown at the start of the line, e.g. `"15:53:19:404"`. */
  clock: string;
}
/** One cost line in `CostBreakdown`. */
export interface CostItem {
  label: MaybeLocalizedText;
  /** Cost in `currency` for the whole call. */
  cost: number;
  /** Secondary text under the label. */
  detail?: MaybeLocalizedText;
}
/** A tab of `CodeBlock`. */
export interface CodeTab {
  id: string;
  /** Tab title. */
  label: string;
  /** Source text; lines are numbered. */
  code: string;
  /** Syntax set for light highlighting (`"bash"` highlights flags; other names such as `"js"`, `"py"` are accepted). */
  lang?: string;
}
/** One line of the scripted demo in `LiveCall`. */
export interface LiveCallLine {
  speaker: CallSpeaker;
  /** Duration of the line in seconds. */
  dur: number;
  /** Response latency in ms shown for agent lines. */
  latency?: number | null;
  /** Bilingual text (both languages are required). */
  text: LocalizedText;
}
/** A variable offered by the workflow's prompt editor. */
export interface WorkflowVariable {
  /** Id stored in the text token's `value`. */
  id: string;
  label: MaybeLocalizedText;
  /** Sample value shown in the insert menu. */
  example?: MaybeLocalizedText;
}

/* ------------------------------------------------------------------ */
/* Call session and player                                             */
/* ------------------------------------------------------------------ */

/** The shared playback session exposed by `useCall()`. */
export interface CallSession {
  /** The underlying audio element (null during server rendering). */
  audio: HTMLAudioElement | null;
  /** Object URL of the generated WAV. */
  url: string;
  /** Waveform peaks per channel: `[agent, customer]`. */
  peaks: readonly [Float32Array, Float32Array];
  /** Detected silences (both channels quiet for 1.2 s or more). */
  silences: readonly Silence[];
  /** Length in seconds. */
  duration: number;
  /** Current position in seconds. */
  time: number;
  playing: boolean;
  /** Playback rate (0.75, 1, 1.25, 1.5 or 2). */
  rate: number;
  /** Whether "skip silence" is on. */
  skip: boolean;
  /** Muted state per channel. */
  mute: Readonly<Record<CallSpeaker, boolean>>;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void | Promise<void>;
  /** Jump to a time in seconds (clamped to the recording). */
  seek: (seconds: number) => void;
  setRate: (rate: number) => void;
  setSkip: React.Dispatch<React.SetStateAction<boolean>>;
  /** Mute or unmute one channel. */
  setMute: (channel: CallSpeaker, muted: boolean) => void;
  /** Listen to only one channel. */
  solo: (channel: CallSpeaker) => void;
  /** Download the recording as a stereo or mono WAV named `<filename>-<kind>.wav` (default filename `"call"`). */
  download: (kind: "stereo" | "mono", filename?: string) => void;
}

export interface CallSessionProviderProps {
  recording: CallRecording;
  children?: React.ReactNode;
}
/** Owns one audio session (playback, per-channel mute, skip-silence) shared by the players, transcript and logs inside it. */
export declare function CallSessionProvider(props: CallSessionProviderProps): React.JSX.Element;

/** The current call session, or `null` outside a `CallSessionProvider`. */
export declare function useCall(): CallSession | null;

export interface StereoWaveformProps<E extends WaveformEvent = WaveformEvent> {
  /** Waveform height per channel in px. Default 52. */
  height?: number;
  events?: readonly E[];
  /** Called after the player seeks to a pressed event. */
  onEvent?: (event: E) => void;
}
/** A split-channel waveform (wavesurfer.js) with mute/solo lanes and event markers; must be inside a `CallSessionProvider`. */
export declare function StereoWaveform<E extends WaveformEvent = WaveformEvent>(props: StereoWaveformProps<E>): React.JSX.Element;

/** Compact player: play button, scrubber and clock; must be inside a `CallSessionProvider`. */
export declare function MiniPlayer(): React.JSX.Element;

export interface CallPlayerProps<E extends WaveformEvent = WaveformEvent> {
  events?: readonly E[];
  /** Base name for downloaded WAV files. Default `"call"`. */
  filename?: string;
  /** Show the button that opens the large player dialog. Default true. */
  expandable?: boolean;
  /** Content shown beside the waveform in the expanded dialog, usually a `Transcript`. */
  side?: React.ReactNode;
  /** Called after the player seeks to a pressed event. */
  onEvent?: (event: E) => void;
}
/** The stereo call player with waveform, transport, speed, skip-silence, download and an expandable dialog; must be inside a `CallSessionProvider`. */
export declare function CallPlayer<E extends WaveformEvent = WaveformEvent>(props: CallPlayerProps<E>): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Call details                                                        */
/* ------------------------------------------------------------------ */

export interface TranscriptProps {
  turns: readonly TranscriptTurn[];
  /** Events shown inline between turns, ordered by time. */
  events?: readonly TranscriptEvent[];
  /** Maximum height of the scrolling list. Default 420. */
  maxHeight?: CssLength;
}
/** A transcript that follows the audio, seeks on click and collects thumbs feedback on agent turns (uses the session when inside a `CallSessionProvider`). */
export declare function Transcript(props: TranscriptProps): React.JSX.Element;

export interface CallLogsProps {
  logs: readonly CallLogEntry[];
  /** Maximum height of the list. Default 380. */
  maxHeight?: CssLength;
}
/** Filterable, searchable call log whose lines seek the recording when pressed. */
export declare function CallLogs(props: CallLogsProps): React.JSX.Element;

export interface CostBreakdownProps {
  items: readonly CostItem[];
  /** Call length in minutes, for the per-minute figures. */
  minutes: number;
  /** ISO 4217 currency code. Default `"USD"`. */
  currency?: string;
}
/** A stacked cost bar and a list of cost lines with per-minute rates and a total. */
export declare function CostBreakdown(props: CostBreakdownProps): React.JSX.Element;

export interface JsonViewProps {
  /** Any JSON-serialisable value. */
  value: unknown;
  /** Header title. Default `"JSON"`. */
  title?: string;
  /** Maximum height of the body. Default 360. */
  maxHeight?: CssLength;
}
/** A collapsible, colour-coded JSON viewer with a copy button. */
export declare function JsonView(props: JsonViewProps): React.JSX.Element;

export interface CodeBlockProps {
  /** At least one tab. */
  tabs: readonly CodeTab[];
  /** Maximum height of the code area. Default 360. */
  maxHeight?: CssLength;
}
/** Tabbed code samples with line numbers, light syntax colouring and a copy button. */
export declare function CodeBlock(props: CodeBlockProps): React.JSX.Element;

export interface CopyButtonProps {
  /** Text copied to the clipboard. */
  text: string;
  /** Accessible name and tooltip. Default "Copy" / "نسخ". */
  label?: string;
  /** Called with whether the copy succeeded. */
  onCopied?: (ok: boolean) => void;
  size?: "sm";
}
/** An icon button that copies text and briefly shows a check mark. */
export declare function CopyButton(props: CopyButtonProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Live call                                                           */
/* ------------------------------------------------------------------ */

export interface LiveCallProps {
  /** Name shown under the avatar and in captions. */
  agentName: string;
  /** Scripted demo conversation played after the call starts. */
  script: readonly LiveCallLine[];
  /** Called when the user starts a call (connect your calling client here). */
  onStart?: () => void;
  /** Called when the call ends (by the user or when the script finishes). */
  onEnd?: () => void;
}
/** A test-call widget with connecting/live/ended states, timer, speaker indicator, mic level, latency and running captions. */
export declare function LiveCall(props: LiveCallProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Workflow builder                                                    */
/* ------------------------------------------------------------------ */

export interface WorkflowBuilderProps {
  /** Variables available in "Say" nodes' prompt editor. */
  vars: readonly WorkflowVariable[];
  /** Height of the builder. Default 680. */
  height?: CssLength;
}
/** A visual call-flow editor (React Flow) with node inspector, JSON export and publish flow, preloaded with a sample appointment flow. */
export declare function WorkflowBuilder(props: WorkflowBuilderProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Audio helpers                                                       */
/* ------------------------------------------------------------------ */

/** A speaking turn to synthesise. */
export interface SynthTurn {
  speaker: CallSpeaker;
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
}
/** Build a believable synthetic stereo recording (agent left, customer right, 16 kHz) from turns, so demos need no audio files. */
export declare function synthCall(turns: readonly SynthTurn[], duration: number): CallRecording;

/** Encode channels (one for mono, two for stereo) as a 16-bit PCM WAV `Blob`. `sampleRate` defaults to 16000. */
export declare function encodeWav(channels: readonly Float32Array[], sampleRate?: number): Blob;

/** Average two channels into one. */
export declare function mixToMono(left: Float32Array, right: Float32Array): Float32Array;

export interface FindSilencesOptions {
  /** Minimum silence length in seconds. Default 1.2. */
  minSec?: number;
  /** Peak amplitude below which a 50 ms window counts as quiet. Default 0.012. */
  threshold?: number;
}
/** Stretches where both channels stay quiet for at least `minSec`. `sampleRate` defaults to 16000. */
export declare function findSilences(
  left: Float32Array,
  right: Float32Array,
  sampleRate?: number,
  options?: FindSilencesOptions,
): Silence[];

/** Format seconds as `m:ss` with locale digits (default locale `"en-US"`). */
export declare function formatClock(seconds: number, locale?: string): string;
