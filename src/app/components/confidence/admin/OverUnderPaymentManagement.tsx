import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, FormControl, FormControlLabel, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { PoolUser } from "../../../redux/reducers/OwnerReducer";
import { RootState } from "../../../redux/reducers/RootReducer";
import { useAuth0 } from "@auth0/auth0-react";
import { AdminPanel } from "./AdminPanel";

// The admin can belong to more than one Over/Under pool at once — one per
// league. Redux's overUnders.currentPool only tracks a single "active" pool
// for the picking UI (arbitrarily the latest-year one), so relying on it here
// silently hid every other league's pool. This reads every OU pool the admin
// is a member of straight off the login payload (owner.pools) instead, and
// renders an independent, self-contained section per pool.
const OverUnderPoolSection = ({
  poolId,
  label,
}: {
  poolId: number;
  label: string;
}) => {
  const [poolUsers, setPoolUsers] = useState<PoolUser[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const { user } = useAuth0();

  useEffect(() => {
    if (!user?.sub) return;
    const onLoad = async () => {
      const unpaid = await GeneralApiSvc.getUnpaidPoolUsers(poolId, user.sub!);
      setPoolUsers(unpaid ?? []);
    };
    onLoad();
  }, [poolId, user?.sub]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setChecked([...checked, Number(event.target.value)]);
    } else {
      setChecked(checked.filter((c) => c !== Number(event.target.value)));
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
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
      <Box>
        <Button
          variant="contained"
          size="small"
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
      </Box>
    </Box>
  );
};

export const OverUnderPaymentManagement = (): JSX.Element | null => {
  const pools = useSelector((state: RootState) => state.profile.owner.pools ?? []);
  const ouPools = pools.filter((p) => p.type === "over-under-wins");

  if (ouPools.length === 0) return null;

  return (
    <AdminPanel title="Over/Under Pool — Mark Owners Paid">
      {ouPools.map((pool) => (
        <OverUnderPoolSection
          key={pool.id}
          poolId={pool.id}
          label={`League ${pool.league} — ${pool.year}`}
        />
      ))}
    </AdminPanel>
  );
};
