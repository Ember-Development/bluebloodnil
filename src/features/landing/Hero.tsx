import { Award, ChevronRight } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import { badgeStyle, colors, containerStyle, fonts } from "./shared";

export function Hero() {
  return (
    <section
      className="hero-section"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: colors.navy,
        display: "flex",
        alignItems: "center",
        paddingTop: 120,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(98,183,255,0.25), rgba(5,7,13,0.9) 50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
          opacity: 0.12,
          mixBlendMode: "overlay",
        }}
      />

      <div
        className="hero-grid"
        style={{
          ...containerStyle,
          position: "relative",
          zIndex: 2,
          display: "grid",
          gap: 48,
          gridTemplateColumns: "minmax(280px, 1fr) minmax(260px, 0.85fr)",
          alignItems: "center",
        }}
      >
        <div className="hero-content">
          <div style={{ marginBottom: 18 }}>
            <span style={badgeStyle}>The Bombers Collective Presents</span>
          </div>
          <h1
            style={{
              margin: "12px 0",
              fontFamily: fonts.display,
              fontSize: "clamp(48px, 10vw, 104px)",
              color: colors.white,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              fontStyle: "italic",
              lineHeight: 0.92,
              paddingRight: 16,
            }}
          >
            BLUE{" "}
            <span
              style={{
                background: `linear-gradient(120deg, ${colors.carolina}, ${colors.carolinaDark})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                paddingRight: 20,
              }}
            >
              BLOODS
            </span>
          </h1>
          <p
            className="hero-description"
            style={{
              borderLeft: `4px solid ${colors.red}`,
              paddingLeft: 20,
              color: colors.slate300,
              fontSize: 20,
              lineHeight: 1.7,
              margin: "16px 0 32px",
            }}
          >
            A player-first NIL program setting a new standard in fastpitch
            softball.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <PrimaryButton
              label="Explore Pathways"
              icon={<ChevronRight size={16} />}
            />
            <SecondaryButton label="Program Goals" />
          </div>
        </div>

        <div
          className="hero-image-wrapper"
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              border: "2px solid rgba(255,255,255,0.2)",
              padding: 12,
              transform: "skewX(-8deg)",
              background:
                "linear-gradient(145deg, rgba(22,28,44,0.95), rgba(10,13,23,0.85))",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              width: "100%",
              maxWidth: 420,
            }}
          >
            <div
              style={{
                background: "rgba(98,183,255,0.18)",
                height: 400,
                width: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius: 18,
              }}
            >
              <Award
                size={180}
                style={{
                  position: "absolute",
                  inset: "50% auto auto 50%",
                  transform: "translate(-50%, -50%)",
                  color: "rgba(255,255,255,0.2)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "auto 0 0 0",
                  padding: 24,
                  background:
                    "linear-gradient(180deg, transparent, rgba(5,7,13,0.9))",
                  fontFamily: fonts.display,
                  color: colors.white,
                }}
              >
                <p
                  style={{
                    textTransform: "uppercase",
                    margin: 0,
                    fontSize: 22,
                  }}
                >
                  Ready for
                </p>
                <p
                  style={{
                    textTransform: "uppercase",
                    margin: 0,
                    fontSize: 42,
                    color: colors.red,
                  }}
                >
                  What’s next
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
