import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { terminal as T, fontStacks } from "../../../theme";

const TABS = [
  { label: "Auction", path: "/demo/auction", live: true },
  { label: "Team & Cap", path: "/demo/dashboard", live: false },
  { label: "Confidence Pool", path: "/demo/confidence", live: false },
];

/** Banner + menu-bar heights (incl. 1px borders). Consumers stick content below this. */
export const DEMO_BANNER_HEIGHT = 28;
export const DEMO_MENUBAR_HEIGHT = 57;
export const DEMO_HEADER_HEIGHT = DEMO_BANNER_HEIGHT + DEMO_MENUBAR_HEIGHT;

/** FanPools wordmark — same lime "F" tile + mono lettering as the real menu bar. */
function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          display: "inline-flex",
          width: 24,
          height: 24,
          borderRadius: 2,
          background: T.lime,
          alignItems: "center",
          justifyContent: "center",
          color: "#000",
          fontFamily: fontStacks.mono,
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        F
      </span>
      <span
        style={{
          fontFamily: fontStacks.mono,
          fontSize: 13,
          fontWeight: 600,
          color: T.text,
          letterSpacing: "0.05em",
        }}
      >
        FANPOOLS<span style={{ color: T.lime }}>.</span>
      </span>
    </div>
  );
}

/**
 * Demo-only chrome that mirrors the production menu bar (wordmark left, nav center,
 * profile chip right) but without the auth-wired controls (logout / league-switch /
 * chat). A slim banner above makes the read-only nature obvious.
 */
export const DemoLayout: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const owner = useSelector((s: RootState) => s.profile.owner);

  const league = owner?.leagues?.[0];
  const leagueName = league?.league?.name ?? "Demo League";
  const teamName = league?.teamName || owner?.displayName || "Demo GM";
  const handle =
    (owner?.displayName || "demo").toLowerCase().replace(/\s+/g, "") || "demo";
  const avatar = owner?.avatar;

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Read-only banner */}
      <div
        style={{
          height: DEMO_BANNER_HEIGHT - 1, // + 1px border = DEMO_BANNER_HEIGHT
          background: T.limeDim,
          borderBottom: `1px solid ${T.lineBold}`,
          color: T.text,
          fontFamily: fontStacks.mono,
          fontSize: 11,
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          padding: "0 12px",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <span style={{ color: T.lime, fontWeight: 700 }}>◉ READ-ONLY DEMO</span>
        <span style={{ color: T.textDim }}>
          {" "}
          — portfolio project, nothing you do is saved.{" "}
        </span>
        <a
          href="/landing"
          style={{ color: T.lime, textDecoration: "underline", fontWeight: 700 }}
        >
          Visit the real site →
        </a>
      </div>

      {/* Menu bar — matches the production terminal bar. zIndex above MUI Fab
          (1050) so the confidence PICK buttons don't float over it on scroll. */}
      <div style={{ position: "sticky", top: 0, zIndex: 1100 }}>
        <div
          style={{
            height: 56,
            background: T.panel,
            borderBottom: `1px solid ${T.lineBold}`,
            display: "flex",
            alignItems: "stretch",
            fontFamily: fontStacks.sans,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              borderRight: `1px solid ${T.line}`,
            }}
          >
            <Wordmark />
          </div>

          {/* League chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
              borderRight: `1px solid ${T.line}`,
            }}
          >
            <span
              style={{ width: 6, height: 6, background: T.lime, borderRadius: 1 }}
            />
            <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>
              {leagueName}
            </span>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {TABS.map((t) => {
              const active = pathname.startsWith(t.path);
              return (
                <div
                  key={t.path}
                  onClick={() => navigate(t.path)}
                  style={{
                    position: "relative",
                    padding: "0 16px",
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    color: active ? T.text : T.textDim,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fontStacks.sans,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {t.label}
                  </span>
                  {t.live && (
                    <span
                      style={{
                        fontFamily: fontStacks.mono,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: T.red,
                      }}
                    >
                      LIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Profile chip (non-interactive in demo) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 12px 4px 4px",
              margin: "0 8px",
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={teamName}
                referrerPolicy="no-referrer"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  background: T.panel2,
                  border: `1px solid ${T.line}`,
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.lime,
                  fontFamily: fontStacks.mono,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {teamName.charAt(0).toUpperCase()}
              </span>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: T.text,
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {teamName}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: T.textMute,
                  fontFamily: fontStacks.mono,
                  lineHeight: 1.1,
                  marginTop: 1,
                }}
              >
                @{handle}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
};
