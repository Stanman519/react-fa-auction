import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
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
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
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
  const steps = ["Pick Team", "Choose Assets", "Eat Salary Cap"];

  const [mySelectedAssets, setMySelectedAssets] = useState<TradeOfferAsset[]>(
    [],
  );
  const [otherSelectedAssets, setOtherSelectedAssets] = useState<
    TradeOfferAsset[]
  >([]);
  console.log("myassets", mySelectedAssets);
  // Function to handle asset selection for "My Assets"
  const handleMyAssetChange = (assetId: string, isChecked: boolean) => {
    if (isChecked && currentLeague?.mflfranchiseid) {
      const assets = franchises.find(
        (f) => f.id === `${currentLeague?.mflfranchiseid}`.padStart(4, "0"),
      )?.assets;
      const now = new Date();
      const year = now.getFullYear();
      console.log("assets", franchises);
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
        setFranchises(data.franchises);
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
          {activeStep === steps.length - 1 ? "Submit" : "Next"}
        </Button>
      </Box>
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
                        control={
                          <Checkbox
                            checked={Boolean(
                              mySelectedAssets.find(
                                (a) => a.mflId === mp.mflId.toString(),
                              ),
                            )}
                            onChange={(e) => {
                              console.log("e", e);
                              handleMyAssetChange(
                                mp.mflId.toString(),
                                e.target.checked,
                              );
                            }}
                          />
                        }
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
                    .map((mp) => {
                      console.log("mp", mp);
                      return (
                        <FormControlLabel
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
                      );
                    })}
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
                style={{
                  padding: 4,
                  margin: 10,
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
                  if (
                    my.mflId.startsWith("DP_") ||
                    my.mflId.startsWith("FP_")
                  ) {
                    return null;
                  }
                  return (
                    <Accordion elevation={3} key={my.mflId}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <TradeListItemHeader
                          mflId={my.mflId}
                          playerDetails={my.playerDetails}
                        />
                      </AccordionSummary>
                      {my.capEats.length > 0 && (
                        <Typography>
                          Salary Retained By {currentLeague?.teamName}
                        </Typography>
                      )}
                      {my.capEats.map((ce, capEatIndex) => {
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
                style={{
                  padding: 4,
                  margin: 10,
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Typography style={{ width: "100%", textAlign: "center" }}>
                  {franchises.find((f) => f.id == tradeTeamId)?.name} sends:
                </Typography>
                {otherSelectedAssets.map((my, assetIndex) => {
                  // Handle filtering inside the map while preserving the index
                  if (
                    my.mflId.startsWith("DP_") ||
                    my.mflId.startsWith("FP_")
                  ) {
                    return null;
                  }
                  return (
                    <Accordion elevation={3} key={my.mflId}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <TradeListItemHeader
                          mflId={my.mflId}
                          playerDetails={my.playerDetails}
                        />
                      </AccordionSummary>
                      {my.capEats.length > 0 && (
                        <Typography>
                          Salary Retained By{" "}
                          {franchises.find((f) => f.id == tradeTeamId)?.name}
                        </Typography>
                      )}
                      {my.capEats.map((ce, capEatIndex) => {
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
        </React.Fragment>
      )}
    </Box>
  );
};

export default AdvancedContractTrades;
