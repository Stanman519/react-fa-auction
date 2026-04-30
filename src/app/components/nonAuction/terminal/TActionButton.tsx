import { ButtonBase, ButtonBaseProps } from "@mui/material";
import { A, dfs } from "./tokens";

type Variant = "lime" | "red" | "amber" | "ghost";

interface TActionButtonProps extends Omit<ButtonBaseProps, "color"> {
  variant?: Variant;
  fullWidth?: boolean;
  dense?: boolean;
}

const styles: Record<Variant, { bg: string; fg: string; border: string }> = {
  lime: { bg: A.lime, fg: "#000", border: A.lime },
  red: { bg: A.red, fg: "#000", border: A.red },
  amber: { bg: A.amber, fg: "#000", border: A.amber },
  ghost: { bg: "transparent", fg: A.text, border: A.lineBold },
};

export default function TActionButton({
  variant = "lime",
  fullWidth,
  dense,
  sx,
  disabled,
  children,
  ...rest
}: TActionButtonProps) {
  const s = styles[variant];
  return (
    <ButtonBase
      disabled={disabled}
      {...rest}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        borderRadius: "2px",
        padding: dense ? "6px 10px" : "10px 14px",
        fontFamily: A.sans,
        fontSize: dense ? dfs(11) : dfs(13),
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "filter 120ms ease",
        "&:hover": disabled ? {} : { filter: "brightness(1.08)" },
        ...sx,
      }}
    >
      {children}
    </ButtonBase>
  );
}
