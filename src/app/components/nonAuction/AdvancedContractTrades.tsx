import { useDispatch, useSelector } from "react-redux";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Card,
  Button,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { axiosInstance } from "../../services/axiosInstance";
import {
  DashboardTradeLeagueDTO,
  MflFranchise,
  PendingTradeResponse,
  TradeOfferAsset,
  TradeRequest,
} from "../../models/MflModels";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import React from "react";
import { URL } from "../../services/AuctionApiSvc";
import { TradeListItemHeader } from "./TradeListItemHeader";
import { submitTradeRequest } from "../../redux/actions/TransactionActions";
import { updateUI } from "../../redux/actions/UiActions";
import { RootState } from "../../redux/reducers/RootReducer";
const AdvancedContractTrades = () => {
  const dispatch = useDispatch();
  const { modal, errorText } = useSelector((state: RootState) => state.ui);

  const [mflLeagueRoot, setMflLeagueRoot] = useState<
    DashboardTradeLeagueDTO | undefined
  >(undefined);
  const [franchises, setFranchises] = useState<MflFranchise[]>([]);
  const [pendingTrades, setPendingTrades] = useState<TradeRequest[]>([]);
  const [tradeTeamId, setTradeTeamId] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const steps = ["Pick Team", "Choose Assets", "Eat Salary Cap"];
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [mySelectedAssets, setMySelectedAssets] = useState<TradeOfferAsset[]>(
    [],
  );
  const [otherSelectedAssets, setOtherSelectedAssets] = useState<
    TradeOfferAsset[]
  >([]);

  // Function to handle asset selection for "My Assets"
  const handleMyAssetChange = (assetId: string, isChecked: boolean) => {
    if (isChecked && currentLeague?.mflfranchiseid) {
      const assets = franchises.find(
        (f) => f.id === `${currentLeague?.mflfranchiseid}`.padStart(4, "0"),
      )?.assets;
      const now = new Date();
      const year = now.getFullYear();

      if (assetId.startsWith("DP_") || assetId.startsWith("FP_")) {
        const np = assets?.currentYearDraftPicks
          .concat(assets.futureYearDraftPicks)
          .find((p) => p.pick === assetId);
        const newPick = {
          mflId: np?.pick,
          playerDetails: { fullName: np?.description },
        } as TradeOfferAsset;
        setMySelectedAssets((prev) => [...prev, newPick]);
      } else {
        const np = assets?.players.find((p) => p.mflId === +assetId);
        const years = Array.from(
          { length: np?.length ?? 0 },
          (_, i) => year + i,
        );
        const npAsset: TradeOfferAsset = {
          mflId: np?.mflId.toString() ?? "",
          playerDetails: np ?? ({} as PlayerDTO),
          capEats: years.map((y) => {
            return {
              amount: 0,
              eaterId: currentLeague?.mflfranchiseid,
              receiverId: +tradeTeamId,
              year: y,
              mflId: np?.mflId ?? 0,
            };
          }),
        };
        setMySelectedAssets((prev) => [...prev, npAsset]);
      }
    } else {
      setMySelectedAssets((prev) => prev.filter((id) => id.mflId !== assetId));
    }
  };

  // Function to handle asset selection for "Other Team Assets"
  const handleOtherAssetChange = (assetId: string, isChecked: boolean) => {
    if (isChecked && tradeTeamId) {
      const assets = franchises.find(
        (f) => f.id === `${tradeTeamId}`.padStart(4, "0"),
      )?.assets;
      const now = new Date();
      const year = now.getFullYear();

      if (assetId.startsWith("DP_") || assetId.startsWith("FP_")) {
        const np = assets?.currentYearDraftPicks
          .concat(assets.futureYearDraftPicks)
          .find((p) => p.pick === assetId);
        const newPick = {
          mflId: np?.pick,
          playerDetails: { fullName: np?.description },
        } as TradeOfferAsset;
        setOtherSelectedAssets((prev) => [...prev, newPick]);
      } else {
        const np = assets?.players.find((p) => p.mflId === +assetId);
        const years = Array.from(
          { length: np?.length ?? 0 },
          (_, i) => year + i,
        );
        const npAsset: TradeOfferAsset = {
          mflId: np?.mflId.toString() ?? "",
          playerDetails: np ?? ({} as PlayerDTO),
          capEats: years.map((y) => {
            return {
              amount: 0,
              receiverId: currentLeague?.mflfranchiseid ?? 0,
              eaterId: +tradeTeamId,
              year: y,
              mflId: np?.mflId ?? 0,
            };
          }),
        };
        setOtherSelectedAssets((prev) => [...prev, npAsset]);
      }
    } else {
      setOtherSelectedAssets((prev) =>
        prev.filter((id) => id.mflId !== assetId),
      );
    }
  };
  const handleMySliderChange = (
    assetIndex: number,
    capEatIndex: number,
    newAmount: number,
  ) => {
    setMySelectedAssets((prevAssets) => {
      const updatedAssets = [...prevAssets];
      const updatedCapEats = [...updatedAssets[assetIndex].capEats];
      updatedCapEats[capEatIndex] = {
        ...updatedCapEats[capEatIndex],
        amount: newAmount,
      };
      updatedAssets[assetIndex] = {
        ...updatedAssets[assetIndex],
        capEats: updatedCapEats,
      };
      return updatedAssets;
    });
  };
  const handleOtherSliderChange = (
    assetIndex: number,
    capEatIndex: number,
    newAmount: number,
  ) => {
    setOtherSelectedAssets((prevAssets) => {
      const updatedAssets = [...prevAssets];
      const updatedCapEats = [...updatedAssets[assetIndex].capEats];
      updatedCapEats[capEatIndex] = {
        ...updatedCapEats[capEatIndex],
        amount: newAmount,
      };
      updatedAssets[assetIndex] = {
        ...updatedAssets[assetIndex],
        capEats: updatedCapEats,
      };
      return updatedAssets;
    });
  };

  useEffect(() => {
    const fetchPendingTrades = () =>
      axios
        .get(
          `${URL}/dashboard/league/${currentLeague?.league.leagueId}/owners/${currentLeague?.leagueownerid}/mfl/${currentLeague?.mflfranchiseid}/pending-trades`,
          { headers: { contentType: "application/json" } },
        )
        .then((res) => {
          const data = res.data as PendingTradeResponse;
          setPendingTrades(data.tradeRequests);
        })
        .catch((err) => {
          console.log("error", err);
        });

    const fetchData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const res = await axiosInstance.get<DashboardTradeLeagueDTO>(
          `${URL}/dashboard/leagues/${currentLeague?.league.leagueId}/years/${year}/franchises/${currentLeague?.mflfranchiseid}/full-mfl-league`,
        );
        setMflLeagueRoot(res.data);
        setFranchises(res.data.franchises);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    Promise.all([fetchPendingTrades(), fetchData()]).finally(() =>
      setIsLoading(false),
    );
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
      const playerIds = newTeam.assets.players.map((p) => p.mflId).join(",");
      const now = new Date();
      const year = now.getFullYear();
      const response = axiosInstance
        .get<PlayerDTO[]>(
          `${URL}/dashboard/leagues/${currentLeague?.league.leagueId}/years/${year}/playerIds/${playerIds}`,
        )
        .then((res) => {
          const data = res.data;
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
    if (activeStep == 2) {
      dispatch(
        submitTradeRequest({
          leagueId: currentLeague?.league.leagueId ?? -1,
          receiverId: Number(tradeTeamId) ?? -1,
          senderId: currentLeague?.mflfranchiseid ?? -1,
          sendingAssets: mySelectedAssets,
          receivingAssets: otherSelectedAssets,
          senderTeamName: currentLeague?.teamName ?? "",
          receiverTeamName:
            franchises.find((f) => f.id == tradeTeamId)?.name ?? "",
          expires: 0,
          tradeId: "",
        }),
      );
      setActiveStep(0);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 2, pb: 1 }}>
        Propose a contract trade with cap retention. Both teams can optionally retain a portion of traded players' salaries, which counts against the retaining team's cap.
      </Typography>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
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
              <InputLabel id="trade-partner-label">Trading Partner</InputLabel>
              <Select
                labelId="trade-partner-label"
                label="Trading Partner"
                onChange={(e) => setTradeTeamId(e.target.value)}
                value={tradeTeamId}
              >
                {franchises
                  .filter((f) => +f.id !== currentLeague?.mflfranchiseid)
                  .map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          {activeStep === 1 && (
            <div className="flex flex-col md:flex-row gap-4 p-2">
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
                        key={mp.mflId}
                        control={
                          <Checkbox
                            checked={Boolean(
                              mySelectedAssets.find(
                                (a) => a.mflId === mp.mflId.toString(),
                              ),
                            )}
                            onChange={(e) => {
                              handleMyAssetChange(
                                mp.mflId.toString(),
                                e.target.checked,
                              );
                            }}
                          />
                        }
                        label={`${mp.fullName} (${mp.position} - ${mp.team}) $${mp.salary}/${mp.length}yr`}
                      />
                    ))}
                  {mflLeagueRoot?.franchises
                    .find((f) => +f.id === currentLeague?.mflfranchiseid)
                    ?.assets.currentYearDraftPicks.concat(
                      mflLeagueRoot?.franchises.find(
                        (f) => +f.id === currentLeague?.mflfranchiseid,
                      )?.assets.futureYearDraftPicks ?? [],
                    )
                    .map((mp) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              !!mySelectedAssets.find(
                                (a) => a.mflId === mp.pick,
                              )
                            }
                            onChange={(e) =>
                              handleMyAssetChange(mp.pick, e.target.checked)
                            }
                          />
                        }
                        label={mp.description}
                      />
                    ))}
                </FormControl>
              </Card>

              <Card sx={{ borderWidth: 1, borderColor: "black", padding: 1 }}>
                <Typography>
                  {franchises.find((f) => +f.id === +tradeTeamId)?.name} Assets
                </Typography>
                <FormControl>
                  {franchises
                    .find((f) => +f.id === +tradeTeamId)
                    ?.assets.players.sort((a, b) => {
                      const positionA = a.position ?? "";
                      const positionB = b?.position ?? "";
                      return positionA.localeCompare(positionB);
                    })
                    .map((mp) => (
                      <FormControlLabel
                        key={mp.mflId}
                        control={
                          <Checkbox
                            checked={
                              !!otherSelectedAssets.find(
                                (a) => a.mflId === mp.mflId.toString(),
                              )
                            }
                            onChange={(e) =>
                              handleOtherAssetChange(
                                mp.mflId.toString(),
                                e.target.checked,
                              )
                            }
                          />
                        }
                        label={`${mp.fullName} (${mp.position} - ${mp.team}) $${mp.salary}/${mp.length}yr`}
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
                        control={
                          <Checkbox
                            checked={
                              !!otherSelectedAssets.find(
                                (a) => a.mflId === mp.pick,
                              )
                            }
                            onChange={(e) =>
                              handleOtherAssetChange(mp.pick, e.target.checked)
                            }
                          />
                        }
                        label={mp.description}
                      />
                    ))}
                </FormControl>
              </Card>
            </div>
          )}
          {activeStep === 2 && (
            <div className="flex flex-col md:flex-row p-1 md:justify-around">
              <Card
                sx={{
                  p: 2,
                  m: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Typography style={{ width: "100%", textAlign: "center" }}>
                  {currentLeague?.teamName} sends:
                </Typography>
                {mySelectedAssets.map((my, assetIndex) => {
                  // Handle filtering inside the map while preserving the index
                  // if (
                  //   my.mflId.startsWith("DP_") ||
                  //   my.mflId.startsWith("FP_")
                  // ) {
                  //   return null;

                  return (
                    <Accordion elevation={3} key={my.mflId}>
                      <AccordionSummary
                        expandIcon={
                          my.mflId.startsWith("DP_") ||
                          my.mflId.startsWith("FP_") ? (
                            <></>
                          ) : (
                            <ExpandMoreIcon />
                          )
                        }
                      >
                        <TradeListItemHeader
                          mflId={my.mflId}
                          playerDetails={my.playerDetails}
                        />
                      </AccordionSummary>
                      {!my.mflId.startsWith("DP_") &&
                        !my.mflId.startsWith("FP_") &&
                        my.capEats.length > 0 && (
                          <Typography>
                            Salary Retained By {currentLeague?.teamName}
                          </Typography>
                        )}
                      {!my.mflId.startsWith("DP_") &&
                        !my.mflId.startsWith("FP_") &&
                        my.capEats.map((ce, capEatIndex) => {
                          const marks = [
                            { value: 0, label: "$0" },
                            {
                              value: my.playerDetails.salary ?? 0,
                              label: `$${my.playerDetails.salary ?? 0}`,
                            },
                          ];
                          return (
                            <AccordionDetails
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <Typography style={{ marginRight: 16 }}>
                                {ce.year}
                              </Typography>
                              <Slider
                                valueLabelDisplay="on"
                                marks={marks}
                                value={ce.amount}
                                valueLabelFormat={(v) => `$${v}`}
                                max={my.playerDetails.salary}
                                onChange={(_, newValue) =>
                                  handleMySliderChange(
                                    assetIndex,
                                    capEatIndex,
                                    newValue as number,
                                  )
                                }
                              />
                            </AccordionDetails>
                          );
                        })}
                    </Accordion>
                  );
                })}
              </Card>
              <Card
                sx={{
                  p: 2,
                  m: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Typography style={{ width: "100%", textAlign: "center" }}>
                  {franchises.find((f) => f.id == tradeTeamId)?.name} sends:
                </Typography>
                {otherSelectedAssets.map((my, assetIndex) => {
                  // // Handle filtering inside the map while preserving the index
                  // if (
                  //   my.mflId.startsWith("DP_") ||
                  //   my.mflId.startsWith("FP_")
                  // ) {
                  //   return null;
                  // }
                  return (
                    <Accordion elevation={3} key={my.mflId}>
                      <AccordionSummary
                        expandIcon={
                          my.mflId.startsWith("DP_") ||
                          my.mflId.startsWith("FP_") ? (
                            <></>
                          ) : (
                            <ExpandMoreIcon />
                          )
                        }
                      >
                        <TradeListItemHeader
                          mflId={my.mflId}
                          playerDetails={my.playerDetails}
                        />
                      </AccordionSummary>
                      {!my.mflId.startsWith("DP_") &&
                        !my.mflId.startsWith("FP_") &&
                        my.capEats.length > 0 && (
                          <Typography>
                            Salary Retained By{" "}
                            {franchises.find((f) => f.id == tradeTeamId)?.name}
                          </Typography>
                        )}
                      {!my.mflId.startsWith("DP_") &&
                        !my.mflId.startsWith("FP_") &&
                        my.capEats.map((ce, capEatIndex) => {
                          const marks = [
                            { value: 0, label: "$0" },
                            {
                              value: my.playerDetails.salary ?? 0,
                              label: `$${my.playerDetails.salary ?? 0}`,
                            },
                          ];
                          return (
                            <AccordionDetails
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <Typography style={{ marginRight: 16 }}>
                                {ce.year}
                              </Typography>
                              <Slider
                                valueLabelDisplay="on"
                                marks={marks}
                                value={ce.amount}
                                valueLabelFormat={(v) => `$${v}`}
                                max={my.playerDetails.salary}
                                onChange={(_, newValue) =>
                                  handleOtherSliderChange(
                                    assetIndex,
                                    capEatIndex,
                                    newValue as number,
                                  )
                                }
                              />
                            </AccordionDetails>
                          );
                        })}
                    </Accordion>
                  );
                })}
              </Card>
            </div>
          )}
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
            <Button
              onClick={handleNext}
              disabled={
                (activeStep == 0 && !tradeTeamId) ||
                (activeStep == 1 &&
                  mySelectedAssets.length === 0 &&
                  otherSelectedAssets.length === 0)
              }
            >
              {activeStep === steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}

      <Snackbar
        open={modal === "trade-submit-success" || modal === "error"}
        autoHideDuration={8000}
        onClose={() => dispatch(updateUI({ modal: undefined }))}
      >
        <Alert
          severity={modal === "trade-submit-success" ? "success" : "error"}
          onClose={() => dispatch(updateUI({ modal: undefined }))}
        >
          {modal === "trade-submit-success"
            ? "Submission Complete!"
            : errorText || "An error occurred."}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvancedContractTrades;
