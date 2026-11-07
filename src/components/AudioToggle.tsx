"use client";

type AudioToggleProps = {
  isMuted: boolean;
  onToggle: () => void;
  /** Fades in once the visitor has entered. */
  visible: boolean;
};

function SpeakerOn() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <path d="M16 9a5 5 0 0 1 0 6" />
      <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

export function AudioToggle({ isMuted, onToggle, visible }: AudioToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isMuted ? "Unmute music" : "Mute music"}
      className={`group fixed bottom-5 right-5 z-40 rounded-full border border-foreground/30 p-[3px] bg-background/70 backdrop-blur-sm transition-all duration-500 hover:border-foreground/60 ${
        visible ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-75"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/85 border border-foreground/15">
        {isMuted ? <SpeakerOff /> : <SpeakerOn />}
      </span>
    </button>
  );
}
