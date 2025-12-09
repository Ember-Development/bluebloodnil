import { colors, containerStyle, fonts, useScrollReveal } from "./shared";

const columns = [
  {
    title: "High school",
    accent: colors.carolina,
    subtitle: "Athletes 17+",
    points: [
      "Sign NIL contracts (funds at enrollment)",
      "Education-first window",
      "Relationship building",
    ],
  },
  {
    title: "Bombers role",
    accent: colors.white,
    subtitle: "The bridge",
    points: [
      "Education + guardians aligned",
      "Brand + media kits ready",
      "Confidence entering collectives",
    ],
  },
  {
    title: "College",
    accent: colors.red,
    subtitle: "Revenue sharing era",
    points: [
      "Full NIL compensation",
      "Direct sharing in 2025",
      "Prepared athletes win",
    ],
  },
];

export function LandscapeSection() {
  return (
    <section
      id="landscape"
      className="section-padding"
      style={{ background: "#05070d", color: colors.white, padding: "96px 0" }}
    >
      <div style={containerStyle}>
        <Heading title="The Landscape" subtitle="Understanding the game" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
            gap: 24,
          }}
        >
          {columns.map((col) => (
            <LandscapeCard key={col.title} {...col} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Heading = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        marginBottom: "3.5rem",
        textAlign: "center",
        transition: "transform 900ms ease, opacity 900ms ease",
        transform: visible ? "translateY(0)" : "translateY(40px)",
        opacity: visible ? 1 : 0,
      }}
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
        {subtitle}
      </p>
      <h2
        style={{
          margin: 0,
          color: colors.white,
          fontSize: "clamp(36px, 5vw, 64px)",
          fontFamily: fonts.display,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          fontStyle: "italic",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          height: 4,
          width: 96,
          background: colors.carolina,
          margin: "16px auto 0",
        }}
      />
    </div>
  );
};

const LandscapeCard = ({
  title,
  accent,
  subtitle,
  points,
}: {
  title: string;
  accent: string;
  subtitle: string;
  points: string[];
}) => (
  <div
    style={{
      background: "rgba(11,16,32,0.95)",
      borderRadius: 18,
      borderTop: `4px solid ${accent}`,
      padding: 28,
      minHeight: 260,
    }}
  >
    <h3
      style={{
        margin: "0 0 8px",
        color: accent,
        fontFamily: fonts.display,
        textTransform: "uppercase",
      }}
    >
      {title}
    </h3>
    <p style={{ color: colors.slate400, margin: "0 0 18px" }}>{subtitle}</p>
    <ul
      style={{
        padding: 0,
        margin: 0,
        listStyle: "none",
        color: colors.slate300,
        display: "grid",
        gap: 12,
      }}
    >
      {points.map((point) => (
        <li
          key={point}
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: accent,
            }}
          />
          {point}
        </li>
      ))}
    </ul>
  </div>
);
