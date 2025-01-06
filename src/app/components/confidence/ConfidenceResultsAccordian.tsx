import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Avatar,
  Tooltip,
  Divider,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import ClearIcon from "@mui/icons-material/Clear";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getRankStringSuffix } from "../../services/Common";
import { getConfidenceResults } from "../../redux/actions/ConfidenceActions";
import Icon from "@mdi/react";
import { mdiCashRemove } from "@mdi/js";

export function ConfidenceResultsAccordian({ isDemo }: { isDemo: boolean }) {
  const { owner } = useSelector((state: RootState) => state.profile);
  const { results } = useSelector((state: RootState) => state.confidence);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const { multiLoader } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const [closedWeeks, setClosedWeeks] = React.useState<string[]>([]);
  useEffect(() => {
    if (
      results.length === 0 ||
      (isDemo &&
        results
          .filter((r) => r.ownerId !== -1)
          .every((p) => p.totalPoints === 0))
    ) {
      dispatch(getConfidenceResults(isDemo ? -1 : new Date().getFullYear()));
    }
  }, []);
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  const handleNestChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      if (closedWeeks.includes(panel)) {
        const newClosed = closedWeeks.filter((w) => w !== panel);
        setClosedWeeks(newClosed);
      } else {
        const newClosed = [...closedWeeks, panel];
        setClosedWeeks(newClosed);
      }
    };
  return (
    <div className="flex flex-col max-w-6xl w-full">
      {multiLoader?.includes("con-results") ? (
        <div style={{ flex: 1 }}>
          <Skeleton variant="rectangular" style={{ flex: 1, margin: 10 }} />
          <Skeleton variant="rectangular" style={{ flex: 1, margin: 10 }} />
          <Skeleton variant="rectangular" style={{ flex: 1, margin: 10 }} />
          <Skeleton variant="rectangular" style={{ flex: 1, margin: 10 }} />
          <Skeleton variant="rectangular" style={{ flex: 1, margin: 10 }} />
          <Skeleton variant="rectangular" style={{ flex: 1, margin: 10 }} />
        </div>
      ) : (
        results.length > 0 && (
          //530
          <>
            {!isDemo && (
              <div className="flex flex-row justify-between">
                {/* <Divider orientation="vertical" variant="middle" flexItem />
                <div className="flex flex-col content-center">
                  <div style={{ textAlign: "center" }}>1st</div>
                  <div>$350</div>
                </div>
                <Divider orientation="vertical" variant="middle" flexItem />
                <div className="flex flex-col content-center">
                  <div style={{ textAlign: "center" }}>2nd</div>
                  <div>$100</div>
                </div>
                <Divider orientation="vertical" variant="middle" flexItem />
                <div className="flex flex-col content-center">
                  <div style={{ textAlign: "center" }}>3rd</div>
                  <div>$50</div>
                </div>
                <Divider orientation="vertical" variant="middle" flexItem />
                <div className="flex flex-col content-center">
                  <div style={{ textAlign: "center" }}>4th</div>
                  <div>$20</div>
                </div>
                <Divider orientation="vertical" variant="middle" flexItem />
                <div className="flex flex-col content-center">
                  <div style={{ textAlign: "center" }}>5th</div>
                  <div>$10</div>
                </div>
                <Divider orientation="vertical" variant="middle" flexItem /> */}
              </div>
            )}
            {results.map((r) => (
              <Accordion
                key={r.ownerId}
                expanded={expanded === `panel${r.ownerId}`}
                onChange={handleChange(`panel${r.ownerId}`)}
              >
                <AccordionSummary
                  sx={{
                    backgroundColor:
                      r.displayName === "YOU" || r.ownerId === owner.ownerId
                        ? "lightyellow"
                        : "white",
                  }}
                  expandIcon={
                    r.weeklyResults.length > 0 ? <ExpandMoreIcon /> : <> </>
                  }
                  aria-controls="panel1bh-content"
                  id="panel1bh-header"
                >
                  <div className="flex flex-row items-center h-full w-full">
                    <div
                      style={{ minWidth: "16.666666%" }}
                      className="text-2xl mr-2 w-1/6"
                    >
                      {getRankStringSuffix(r.rank)}
                    </div>
                    <img
                      src={r?.avatar}
                      referrerPolicy="no-referrer"
                      style={{ height: 0, width: 0 }}
                    />
                    <Avatar
                      alt={r.displayName}
                      src={r.avatar}
                      variant="rounded"
                    />
                    <div className="flex flex-col justify-start mx-2">
                      <div className="flex text-sm sm:text-lg grow leading-tight items-center">
                        {r.displayName}
                        {!r.isPaid && (
                          <Tooltip
                            title="This player has not paid and will be disqualified once the games start"
                            placement="top"
                          >
                            <Icon path={mdiCashRemove} size={1} color="red" />
                          </Tooltip>
                        )}
                      </div>

                      {r.pickSubmitted && (
                        <div
                          style={{ lineHeight: 1 }}
                          className="italic text-xs sm:text-sm text-red-900"
                        >
                          Picks submitted
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 24 }} />
                    <div className="leading-tight mr-2 text-xl whitespace-nowrap">
                      {r.totalPoints}
                    </div>
                  </div>
                </AccordionSummary>
                {r.weeklyResults.map((w) => (
                  <AccordionDetails
                    style={{
                      paddingLeft: 4,
                      paddingRight: 4,
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}
                    key={w.week}
                  >
                    <Accordion
                      sx={{ margin: 0 }}
                      expanded={!closedWeeks.includes(`${r.ownerId}-${w}`)}
                      onChange={handleNestChange(`${r.ownerId}-${w}`)}
                    >
                      <AccordionSummary
                        sx={{ paddingBottom: 0 }}
                        expandIcon={<ExpandMoreIcon />}
                      >
                        <div className="flex justify-between w-full">
                          <div className="text-lg">Week {w.week} </div>
                          <div>{w.totalPoints} pts</div>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        <>
                          {w.results.map((gm) => (
                            <div className="flex row" key={gm.id}>
                              <div></div>
                              <div className="px-1.5">
                                {gm.correct ? (
                                  <ThumbUpAltIcon color="primary" />
                                ) : gm.correct === null || undefined ? (
                                  <></>
                                ) : (
                                  <ClearIcon color="error" />
                                )}
                              </div>
                              <div>
                                {gm.points} - {gm.pickTeam?.name ?? ""}
                              </div>
                              {!gm.pickTeam?.name && (
                                <div
                                  style={{
                                    color: "darkgray",
                                    fontStyle: "italic",
                                    marginLeft: 4,
                                  }}
                                >
                                  hidden
                                </div>
                              )}
                              <div></div>
                            </div>
                          ))}
                        </>
                      </AccordionDetails>
                    </Accordion>
                  </AccordionDetails>
                ))}
                <AccordionDetails>
                  <div className="flex w-full justify-end">
                    <div>Tiebreaker Points: {r.extraPoints}</div>
                  </div>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )
      )}
    </div>
  );
}
