import React, { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { PoolUser } from "../../../redux/reducers/OwnerReducer";
import { RootState } from "../../../redux/reducers/RootReducer";
import { useAuth0 } from "@auth0/auth0-react";
import { AdminPanel } from "./AdminPanel";

export const OverUnderPaymentManagement = (): JSX.Element | null => {
  const [poolUsers, setPoolUsers] = useState<PoolUser[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const { user } = useAuth0();
  const poolId = useSelector((state: RootState) => state.overUnders.currentPool?.id);

  useEffect(() => {
    if (poolId === undefined) return;
    const onLoad = async () => {
      const unpaid = await GeneralApiSvc.getUnpaidPoolUsers(poolId);
      setPoolUsers(unpaid ?? []);
    };
    onLoad();
  }, [poolId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setChecked([...checked, Number(event.target.value)]);
    } else {
      setChecked(checked.filter((c) => c !== Number(event.target.value)));
    }
  };

  if (poolId === undefined) return null;

  return (
    <AdminPanel title="Over/Under Pool — Mark Owners Paid">
      {poolUsers.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Everyone in this pool is paid up.
        </Typography>
      ) : (
        <FormControl>
          {poolUsers.map((p) => (
            <FormControlLabel
              key={p.id}
              control={<Checkbox onChange={handleChange} />}
              value={p.id}
              label={`${p.owner.ownername} - ${p.owner.ownerId} - ${p.owner.displayName}`}
            />
          ))}
        </FormControl>
      )}
      <Button
        variant="contained"
        disabled={checked.length === 0}
        onClick={async () => {
          if (!user?.sub) {
            alert("Please log in to mark owners as paid");
            return;
          }
          await GeneralApiSvc.setPoolUsersToPaid(poolId, checked, user.sub);
          setPoolUsers(poolUsers.filter((p) => !checked.includes(p.id)));
          setChecked([]);
        }}
      >
        SAVE
      </Button>
    </AdminPanel>
  );
};
