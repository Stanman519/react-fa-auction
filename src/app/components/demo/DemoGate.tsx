import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks";
import { setDemoMode, setDemoNotifier } from "../../services/demoMode";
import { bootstrapDemoSession } from "../../redux/actions/LoginActions";
import { updateUI } from "../../redux/actions/UiActions";
import { LoadingScreen } from "../LoadingScreen";

export const DemoGate: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { authSynchronized } = useAppSelector((s) => s.profile);
  const started = useRef(false);

  useEffect(() => {
    setDemoMode(true);
    setDemoNotifier((message) =>
      dispatch(updateUI({ error: "snackbar", errorText: message })),
    );

    if (!started.current) {
      started.current = true;
      dispatch(bootstrapDemoSession() as any);
    }

    return () => {
      setDemoMode(false);
      setDemoNotifier(null);
    };
  }, [dispatch]);

  if (!authSynchronized) return <LoadingScreen />;
  return children;
};
