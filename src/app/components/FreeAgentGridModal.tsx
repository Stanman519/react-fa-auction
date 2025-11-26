import { LoadingButton } from "@mui/lab";
import {
  Backdrop,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUI } from "../redux/actions/UiActions";
import { RootState } from "../store";
import { Table, TableColumnsType, TableProps } from "antd";
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer";
import { useIsMobile } from "../hooks";

export const FreeAgentGridModal = ({
  isOpen = false,
}: {
  isOpen: boolean;
}): JSX.Element => {
  const { isLoading } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const { freeAgents } = useSelector((state: RootState) => state);
  const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  const onChange: TableProps<PlayerDTO>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const isMobile = useIsMobile(600);

  const columns: TableColumnsType<PlayerDTO> = [
    {
      title: "Name",
      dataIndex: "fullName",
    },
    {
      title: "Pos",
      dataIndex: "position",
      showSorterTooltip: { target: "full-header" },
      filters: [
        { text: "QB", value: "QB" },
        { text: "RB", value: "RB" },
        { text: "WR", value: "WR" },
        { text: "TE", value: "TE" },
      ],
      onFilter: (value, record) =>
        record.position.indexOf(value as string) === 0,
      sortDirections: ["descend"],
      sorter: (a, b) => (a.position > b.position ? 1 : -1),
    },
    {
      title: "Team",
      dataIndex: "team",
      filters: [
        { text: "No Free Agents", value: true },
        { text: "All Players", value: false },
      ],
      onFilter: (value, record) =>
        (record.team == "FA" && value === false) || record.team !== "FA",
      sorter: (a, b) => (a.team > b.team ? 1 : -1),
    },
    ...(!isMobile
      ? [
          {
            title: "Age",
            dataIndex: "age",
            defaultSortOrder: "ascend" as "ascend",
            sorter: (a: PlayerDTO, b: PlayerDTO) =>
              (a.age ?? 0) > (b.age ?? 0) ? -1 : 1,
          },
        ]
      : []),
    {
      title: "ADP",
      dataIndex: "adp",
      defaultSortOrder: "ascend",
      sorter: (a, b) => ((+(a.adp ?? 0) || 0) > (+(b.adp ?? 0) || 0) ? -1 : 1),
    },
  ];

  return (
    <div>
      {/* <Backdrop
                sx={{ color: '#fff', backdropFilter: 'blur(3px)', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isOpen}

            />
            <Dialog
                onClose={() => dispatch(updateUI({modal: undefined}))}
                open={isOpen}
                TransitionComponent={Transition}
                keepMounted
            >
                <DialogContent style={{ paddingTop: 10 }}> */}
      <style>{`
    .fa-grid-modal .ant-table-filter-dropdown-btns .ant-btn.ant-btn-primary {
      background: #1890ff !important;
      color: #fff !important;
      border-color: #1890ff !important;
    }
    .fa-grid-modal .ant-table-filter-dropdown-btns .ant-btn.ant-btn-primary:hover {
      background: #40a9ff !important;
      border-color: #40a9ff !important;
    }
      `}</style>
      <Table
        className="fa-grid-modal"
        rowKey={(p) => p.mflId}
        columns={columns.flat()}
        dataSource={freeAgents}
        pagination={false}
        onChange={onChange}
        showSorterTooltip={{ target: "sorter-icon" }}
        getPopupContainer={(triggerNode) => triggerNode.parentElement!}
        size={isMobile ? "small" : "middle"}
      />

      {/* </DialogContent>
            </Dialog> */}
    </div>
  );
};
