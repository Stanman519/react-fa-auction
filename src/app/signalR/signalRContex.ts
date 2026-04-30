import {
    JsonHubProtocol,
    HubConnectionState,
    HubConnectionBuilder,  
    HubConnection,
    HttpTransportType,
    LogLevel} from '@microsoft/signalr';
import { useDispatch } from 'react-redux';
import { setConnection } from '../redux/actions/SignalRActions';
import { RootState } from '../store';
import { freshenUpTheLotsAfterAbsence } from '../redux/actions/LotActions';
  
  //const isDev = process.env.NODE_ENV === 'development';
  
  const startSignalRConnection = async (connection :HubConnection) => {
    try {
      await connection.start();
      console.assert(connection.state === HubConnectionState.Connected);
    } catch (err) {
      console.assert(connection.state === HubConnectionState.Disconnected);
      console.error('SignalR Connection Error: ', err);
      setTimeout(() => startSignalRConnection(connection), 5000);
    }
  };
  
  // Set up a SignalR connection to the specified hub URL, and actionEventMap.
  // actionEventMap should be an object mapping event names, to eventHandlers that will
  // be dispatched with the message body.
  export const setupSignalRConnection = (connectionHub: any, actionEventMap: any = {}, getAccessToken: any = "") => 
  (dispatch: Function = useDispatch(), getState: () => RootState) => {
    //  THIS PART SEEMS A LITTLE OVER THE TOP FOR NOW
    // const options = { 
    //   logMessageContent: isDev,
    //   logger: isDev ? LogLevel.Warning : LogLevel.Error,
    //   accessTokenFactory: () => getAccessToken(getState())
    // };
    // create the connection instance
    // withAutomaticReconnect will automatically try to reconnect
    // and generate a new socket connection if needed
    const connection = new HubConnectionBuilder()
      .withUrl(connectionHub) //,options
      .withAutomaticReconnect()
      .withHubProtocol(new JsonHubProtocol())
      //.configureLogging(LogLevel.Information)
      .build();
    const reduxConn = getState().signalR
    // Note: to keep the connection open the serverTimeout should be
    // larger than the KeepAlive value that is set on the server
    // keepAliveIntervalInMilliseconds default is 15000 and we are using default
    // serverTimeoutInMilliseconds default is 30000 and we are using 60000 set below
    connection.serverTimeoutInMilliseconds = 60000;
    // connection.keepAliveIntervalInMilliseconds = 60000;
  
    // re-establish the connection if connection dropped
    connection.onclose(error => {
      console.assert(connection.state === HubConnectionState.Disconnected);
      console.log('Connection closed due to error. Try refreshing this page to restart the connection', error);
    });
  
    connection.onreconnecting(error => {
      console.assert(connection.state === HubConnectionState.Reconnecting);
      dispatch(setConnection({...reduxConn, hasReconnected: false, isConnected: false}))
      console.log('Connection lost due to error. Reconnecting.', error);
    });
  
    connection.onreconnected(connectionId => {
      console.assert(connection.state === HubConnectionState.Connected);
      dispatch(freshenUpTheLotsAfterAbsence())
      dispatch(setConnection({...reduxConn, hasReconnected: true, isConnected: true}))
      console.log('Connection reestablished. Connected with connectionId', connectionId);
    });
  

    connection.on('FreshBid', res => {
      console.log("made contact new bid is: ", res)
      const eventHandler = actionEventMap.FreshBid;
      console.log('dispatching', eventHandler)
      eventHandler && dispatch(eventHandler(res));
    });

    connection.on('NewHeadline', res => {
      const eventHandler = actionEventMap.NewHeadline;
      eventHandler && dispatch(eventHandler(res));
    });

    connection.on('NewQuote', res => {
      const eventHandler = actionEventMap.NewQuote;
      eventHandler && dispatch(eventHandler(res));
    });

    connection.on('QuoteRemoved', res => {
      const eventHandler = actionEventMap.QuoteRemoved;
      eventHandler && dispatch(eventHandler(res));
    });


  
    startSignalRConnection(connection);
    dispatch(setConnection({connection, isConnected: true, hasReconnected: false}))


    return connection;
  };