import { List, ListItem, Typography } from "@mui/material";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { CapEat } from "../../models/MflModels";

export const TradeListPlayerCapEats = ({ capEats }: { capEats: CapEat[] }) => {
  return (
    <List>
      {capEats.map((c) => (
        <ListItem>
          <div>
            <Typography>{c.year}</Typography>
            <Typography>${c.amount}</Typography>
          </div>
        </ListItem>
      ))}
    </List>
  );
};
