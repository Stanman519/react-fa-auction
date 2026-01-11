import React, { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import Owner from "../../../redux/reducers/OwnerReducer";
import { useAuth0 } from "@auth0/auth0-react";

export const OwnerPaymentManagement = (): JSX.Element => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const { user } = useAuth0();

  useEffect(() => {
    const onLoad = async () => {
      const unpaid = await GeneralApiSvc.getUnpaidOwners();
      setOwners(unpaid);
    };
    onLoad();
  }, []);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setChecked([...checked, Number(event.target.value)]);
    } else {
      setChecked(checked.filter((c) => c !== Number(event.target.value)));
    }
  };
  return (
    <div className="border rounded border-black flex flex-col">
      <FormControl>
        {owners.map((o) => (
          <FormControlLabel
            key={o.ownerId}
            control={<Checkbox onChange={handleChange} />}
            value={o.ownerId}
            label={`${o.ownername} - ${o.ownerId} - ${o.displayName}`}
          />
        ))}
      </FormControl>
      <Button
        onClick={async () => {
          if (!user?.sub) {
            alert("Please log in to mark owners as paid");
            return;
          }
          await GeneralApiSvc.setOwnersToPaid(checked, user.sub);
          setOwners(owners.filter((o) => !checked.includes(o.ownerId)));
          setChecked([]);
        }}
      >
        SAVE
      </Button>
    </div>
  );
};
