import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { colors, containerStyle, fonts, useScrollReveal } from "./shared";

const steps = [
  {
    label: "Foundation",
    title: "Education & brand build",
    desc: "Social strategy, financial literacy, and persona workshops for athletes + families.",
    tags: ["Brand kit", "Financial 101", "Media day"],
  },
  {
    label: "In-season",
    title: "Storytelling in real time",
    desc: "Live moments, film-room clips, and community work powering a year-round content engine.",
    tags: ["Game content", "Community", "Highlights"],
  },
  {
    label: "Off-season",
    title: "Partner & donor runway",
    desc: "Align businesses and donors around clear stories, assets, and guardrails before offers go out.",
    tags: ["Sponsor targets", "Donor briefs", "Guardrails"],
  },
  {
    label: "College handoff",
    title: "Collective-ready day one",
    desc: "Brand assets, compliance record, and partner interest delivered to school collectives.",
    tags: ["Compliance file", "NIL résumé", "Warm intros"],
  },
];

export function PathwaysSection() {
  const [ref, visible] = useScrollReveal();

  return (
    <section
      id="pathways"
      ref={ref}
      className="pathways-section"
      style={{
        background: colors.offWhite,
        padding: "110px 0",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/stardust.png')",
          opacity: 0.2,
        }}
      />
      <div style={{ ...containerStyle, position: "relative", zIndex: 2 }}>
        <div
          className="pathways-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1.8fr)",
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          <div
            className="pathways-sticky"
            style={{ position: "sticky", top: 120 }}
          >
            <p
              style={{
                color: colors.red,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                margin: "0 0 12px",
                fontFamily: fonts.body,
              }}
            >
              The blueprint
            </p>
            <h2
              style={{
                margin: 0,
                color: colors.slate900,
                fontSize: "clamp(36px, 5vw, 64px)",
                fontFamily: fonts.display,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                fontStyle: "italic",
              }}
            >
              How a Bomber becomes NIL-ready
            </h2>
            <div
              style={{
                height: 4,
                width: 96,
                background: colors.carolina,
                margin: "16px 0",
              }}
            />
            <p
              style={{
                borderLeft: `4px solid ${colors.carolina}`,
                paddingLeft: 18,
                color: colors.slate600,
                fontSize: 18,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Instead of random deals, BlueBloods follows a four-stage journey
              from first Bombers reps to a college collective meeting.
            </p>
          </div>

          <div
            className="pathways-content"
            style={{ position: "relative", paddingLeft: 32 }}
          >
            <div
              style={{
                position: "absolute",
                left: 8,
                top: 8,
                bottom: 8,
                width: 2,
                borderRadius: 2,
                background: `linear-gradient(${colors.red}, ${colors.carolina})`,
                opacity: visible ? 1 : 0,
                transition: "opacity 600ms ease",
              }}
            />
            <div style={{ display: "grid", gap: 24 }}>
              {steps.map((step, index) => (
                <PathwayStep key={step.title} step={step} delay={index * 80} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PathwayStep = ({
  step,
  delay,
}: {
  step: { label: string; title: string; desc: string; tags: string[] };
  delay: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useScrollReveal();

  return (
    <article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        paddingLeft: 32,
        position: "relative",
        transition: "transform 240ms ease, opacity 400ms ease",
        transform: visible ? "translateX(0)" : "translateX(20px)",
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -32,
          top: 0,
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: `2px solid ${colors.carolina}`,
          background: colors.white,
          color: colors.slate900,
          fontFamily: fonts.display,
          fontWeight: 700,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
        }}
      >
        {step.label.charAt(0)}
      </div>
      <div
        style={{
          background: colors.white,
          borderLeft: hovered
            ? `4px solid ${colors.carolina}`
            : "4px solid rgba(15,23,42,0.08)",
          borderRadius: "0 18px 18px 0",
          padding: "20px 24px",
          boxShadow: hovered
            ? "0 28px 40px rgba(15,23,42,0.12)"
            : "0 18px 30px rgba(15,23,42,0.08)",
          transition: "border 220ms ease, box-shadow 220ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontSize: 11,
              fontWeight: 700,
              color: colors.carolinaDark,
            }}
          >
            {step.label}
          </span>
          <ChevronRight
            size={18}
            color={hovered ? colors.carolina : colors.slate400}
          />
        </div>
        <h3
          style={{
            margin: "0 0 12px",
            fontFamily: fonts.display,
            color: hovered ? colors.carolina : colors.slate900,
            textTransform: "uppercase",
          }}
        >
          {step.title}
        </h3>
        <p style={{ margin: 0, color: colors.slate600, lineHeight: 1.6 }}>
          {step.desc}
        </p>
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}
        >
          {step.tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: hovered
                  ? colors.slate900
                  : "rgba(148,163,184,0.15)",
                color: hovered ? colors.white : colors.slate700,
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "background 200ms ease, color 200ms ease",
              }}
            >
              <CheckCircle2 size={14} color={colors.carolina} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
