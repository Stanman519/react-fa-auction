import { Card, CardContent, Typography } from "@mui/material";

export const NoActiveAuctions = (): JSX.Element => {
    return (
            <Card>
                <CardContent>
                    <Typography variant="h5">
                        There are no players up for auction right now. Nominate someone to get things rolling.
                    </Typography>
                </CardContent>
            </Card>
    );
  }