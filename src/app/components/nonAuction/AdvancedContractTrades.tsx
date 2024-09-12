import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Card,
  Button,
  CircularProgress,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Box,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { updateUI } from "../../redux/actions/UiActions";
import { ConfirmModal } from "../ConfirmModal";
import { submitTaxiCut } from "../../redux/actions/TransactionActions";
import axios from "axios";
import {
  DashboardTradeLeagueDTO,
  MflFranchise,
  PendingTradeResponse,
  TradeRequest,
} from "../../models/MflModels";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import React from "react";
import { URL } from "../../services/AuctionApiSvc";
const AdvancedContractTrades = () => {
  const dispatch = useDispatch();
  const modal = useSelector(
    (state: RootState) => state.ui.modal === "taxi-confirm",
  );
  const [mflLeagueRoot, setMflLeagueRoot] = useState<
    DashboardTradeLeagueDTO | undefined
  >(undefined);
  const [franchises, setFranchises] = useState<MflFranchise[]>([]);
  const [pendingTrades, setPendingTrades] = useState<TradeRequest[]>([]);
  const [tradeTeamId, setTradeTeamId] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);
  const { currentLeague } = useSelector((state: RootState) => state.profile);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<
    number | undefined
  >(undefined);
  const steps = ["Pick Team", "Choose Assets", "Eat Salary Cap"];
  const taxiPlayers = currentLeague?.taxiPlayers ?? [];

  useEffect(() => {
    const fetchPendingTrades = async () => {
      const response = axios
        .get(
          `${URL}/dashboard/league/${currentLeague?.league.leagueId}/owners/${currentLeague?.leagueownerid}/mfl/${currentLeague?.mflfranchiseid}/pending-trades`,
          {
            headers: {
              contentType: "application/json",
            },
          },
        )
        .then((res) => {
          console.log("other", res.data);

          const data = res.data as PendingTradeResponse;
          setPendingTrades(data.tradeRequests);
          // newTeam.assets.players.forEach((a) => {
          //   const foundPlayer = data.find((d) => d.mflId == a.mflId);
          //   if (foundPlayer) {
          //     a.fullName = foundPlayer.fullName;
          //     a.age = foundPlayer.age;
          //     a.position = foundPlayer.position;
          //     a.team = foundPlayer.team;
          //   }
          // });
          // const foundIndex = mflLeagueRoot?.franchises.findIndex(
          //   (t) => t.id === tradeTeamId,
          // );
          // if (foundIndex !== undefined && foundIndex >= 0)
          //   newLeague.franchises[foundIndex] = newTeam;
          // setMflLeagueRoot(newLeague);
        })
        .catch((err) => {
          console.log("error", err);
        });
    };
    const fetchData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const response = await fetch(
          `${URL}/dashboard/leagues/${currentLeague?.league.leagueId}/years/${year}/franchises/${currentLeague?.mflfranchiseid}/full-mfl-league`,
          {
            headers: {
              contentType: "application/json",
            },
          },
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as DashboardTradeLeagueDTO;
        console.log("data", data); // You can replace this with your state update logic
        setMflLeagueRoot(data);
        console.log(currentLeague?.mflfranchiseid ?? 0);
        setFranchises(
          data.franchises.filter(
            (f) =>
              f.id !== `${currentLeague?.mflfranchiseid ?? 0}`.padStart(4, "0"),
          ),
        );
      } catch (error) {
        //@ts-ignore
        console.error("Error fetching data:", error);
      }
    };
    fetchPendingTrades();
    fetchData();
  }, []);

  useEffect(() => {
    if (!mflLeagueRoot) return;
    const newTeam = mflLeagueRoot.franchises.find((t) => t.id === tradeTeamId);
    const newLeague = { ...mflLeagueRoot };
    if (
      newTeam &&
      (!newTeam?.assets.players ||
        newTeam.assets.players.some((p) => !p.fullName))
    ) {
      console.log("runnin");
      const playerIds = newTeam.assets.players.map((p) => p.mflId).join(",");
      const now = new Date();
      const year = now.getFullYear();
      const response = axios
        .get(
          `${URL}/dashboard/leagues/${currentLeague?.league.leagueId}/years/${year}/playerIds/${playerIds}`,
          {
            headers: {
              contentType: "application/json",
            },
          },
        )
        .then((res) => {
          console.log("player result, ", res.data);
          const data = res.data as PlayerDTO[];
          newTeam.assets.players.forEach((a) => {
            const foundPlayer = data.find((d) => d.mflId == a.mflId);
            if (foundPlayer) {
              a.fullName = foundPlayer.fullName;
              a.age = foundPlayer.age;
              a.position = foundPlayer.position;
              a.team = foundPlayer.team;
            }
          });
          const foundIndex = mflLeagueRoot?.franchises.findIndex(
            (t) => t.id === tradeTeamId,
          );
          if (foundIndex !== undefined && foundIndex >= 0)
            newLeague.franchises[foundIndex] = newTeam;
          setMflLeagueRoot(newLeague);
        })
        .catch((err) => {
          console.log("error", err);
        });
    }
    // if this teamId doesnt have player infos in it, look them up with a long string of comma separated ids
    // then set that team to the selected trade partner and show assets
  }, [tradeTeamId]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {activeStep === 0 && (
            <FormControl fullWidth>
              <InputLabel>Trading Partner</InputLabel>
              <Select
                onChange={(e) => setTradeTeamId(e.target.value)}
                value={tradeTeamId}
              >
                {franchises.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {activeStep === 1 && (
            <div className="flex md:flex-row">
              <Card sx={{ borderWidth: 1, borderColor: "black", padding: 1 }}>
                <Typography>My Assets</Typography>
                <FormControl>
                  {mflLeagueRoot?.franchises
                    .find((f) => +f.id === currentLeague?.mflfranchiseid)
                    ?.assets.players.sort((a, b) => {
                      const positionA = a.position ?? "";
                      const positionB = b?.position ?? "";
                      return positionA.localeCompare(positionB);
                    })
                    .map((mp) => (
                      <FormControlLabel
                        control={<Checkbox />}
                        label={
                          <Box sx={{ flexDirection: "row", display: "flex" }}>
                            <Typography sx={{ marginRight: 1 }}>
                              {mp.fullName}{" "}
                            </Typography>
                            <Typography>({mp.position}</Typography>
                            <span> &nbsp;-&nbsp; </span>
                            <Typography>{mp.team}) </Typography>
                            <Typography>&nbsp;${mp.salary}/</Typography>
                            <Typography>{mp.length} yr</Typography>
                          </Box>
                        }
                      />
                    ))}
                  {mflLeagueRoot?.franchises
                    .find((f) => +f.id === currentLeague?.mflfranchiseid)
                    ?.assets.currentYearDraftPicks.concat(
                      mflLeagueRoot?.franchises.find(
                        (f) => f.id === tradeTeamId,
                      )?.assets.futureYearDraftPicks ?? [],
                    )
                    .map((mp) => (
                      <FormControlLabel
                        control={<Checkbox />}
                        label={mp.description}
                      />
                    ))}
                </FormControl>
              </Card>

              <Card sx={{ borderWidth: 1, borderColor: "black", padding: 1 }}>
                <Typography>
                  {
                    mflLeagueRoot?.franchises.find((f) => f.id === tradeTeamId)
                      ?.name
                  }{" "}
                  Assets
                </Typography>
                <FormControl>
                  {mflLeagueRoot?.franchises
                    .find((f) => f.id === tradeTeamId)
                    ?.assets.players.sort((a, b) => {
                      const positionA = a.position ?? "";
                      const positionB = b?.position ?? "";
                      return positionA.localeCompare(positionB);
                    })
                    .map((mp) => (
                      <FormControlLabel
                        control={<Checkbox />}
                        label={
                          <Box sx={{ flexDirection: "row", display: "flex" }}>
                            <Typography sx={{ marginRight: 1 }}>
                              {mp.fullName}{" "}
                            </Typography>
                            <Typography>({mp.position}</Typography>
                            <span> &nbsp;-&nbsp; </span>
                            <Typography>{mp.team}) </Typography>
                            <Typography>&nbsp;${mp.salary}/</Typography>
                            <Typography>{mp.length} yr</Typography>
                          </Box>
                        }
                      />
                    ))}
                  {mflLeagueRoot?.franchises
                    .find((f) => f.id === tradeTeamId)
                    ?.assets.currentYearDraftPicks.concat(
                      mflLeagueRoot?.franchises.find(
                        (f) => f.id === tradeTeamId,
                      )?.assets.futureYearDraftPicks ?? [],
                    )
                    .map((mp) => (
                      <FormControlLabel
                        control={<Checkbox />}
                        label={mp.description}
                      />
                    ))}
                </FormControl>
              </Card>
            </div>
          )}
          {activeStep === 2 && <div>cap pickin stuff</div>}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};

export default AdvancedContractTrades;
