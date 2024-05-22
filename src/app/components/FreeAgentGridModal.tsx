import { LoadingButton } from "@mui/lab";
import { Backdrop, Button, Dialog, DialogActions, DialogContent, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUI } from "../redux/actions/UiActions";
import { RootState } from "../store";
import { Table, TableColumnsType, TableProps } from "antd";
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer";



export const FreeAgentGridModal = ({isOpen = false}: {isOpen: boolean}): JSX.Element => {
    const { isLoading } = useSelector((state: RootState) => state.ui)
    const dispatch = useDispatch();
    const { freeAgents } = useSelector((state: RootState) => state)
    const Transition = forwardRef(function Transition(
        props: TransitionProps & {
            children: React.ReactElement<any, any>;
        },
        ref: React.Ref<unknown>,
    ) {
        return <Slide direction="up" ref={ref} {...props} />;
    });
    const onChange: TableProps<PlayerDTO>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
      };
    console.log(freeAgents)
    const columns: TableColumnsType<PlayerDTO> = [
        {
          title: 'Name',
          dataIndex: 'fullName',
        },
        {
            title: 'Pos',
            dataIndex: 'position',
            showSorterTooltip: { target: 'full-header' },   

            filters: [
                {
                  text: 'QB',
                  value: 'QB'
                },
                {
                  text: 'RB',
                  value: 'RB'
                },
                {
                    text: 'WR',
                    value: 'WR'
                  },
                  {
                    text: 'TE',
                    value: 'TE'
                  }
                
              ],
            onFilter: (value, record) => record.position.indexOf(value as string) === 0,
            sortDirections: ['descend'],

            sorter: (a, b) => a.position > b.position ? 1 : -1,
        },        {
            title: 'Team',
            dataIndex: 'team',
            sorter: (a, b) => a.team > b.team ? 1 : -1,

    },
        {
            title: 'Age',
            dataIndex: 'age',
            defaultSortOrder: 'ascend',
            sorter: (a, b) => (a.age ?? 0) > (b.age ?? 0) ? -1 : 1,
        }
    ]


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
                <Table
                        
                        columns={columns}
                        dataSource={freeAgents}
                        pagination={false}
                        onChange={onChange}
                        showSorterTooltip={{ target: 'sorter-icon' }}
                    />

                {/* </DialogContent>
            </Dialog> */}
        </div>
    );
}