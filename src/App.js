import React, {useState, createContext, useEffect} from 'react';
import Tabs from './components/Tabs';
import TabletView from './components/TabletView';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './App.scss';
import { getStorage, saveStorage } from './utils/Storage';
import BottomSheet from "./components/BottomSheet";
import {getTorrents} from "./utils/TorrClient";
import {AlertDialog,Button} from "react-onsenui"

const StoredUser = getStorage("user")
let templateObject = StoredUser;

if(StoredUser === null){
    templateObject = {
        loggedin:false,
        username:null,
        password:null
    }
    saveStorage("user",templateObject)
}

const screenWidth = window.innerWidth;
const breakpoint = 768;

export const Context = createContext(null);

const App = () => {
    const [settings,setSettings] = useState(templateObject);
    const [bigScreen] = useState(screenWidth > breakpoint)
    const [installed] = useState(window.matchMedia('(display-mode: standalone)').matches)
    const [torrentList,setTorrentList] = useState({needsRefresh:true,list:[]});

    const updateSettings = (settings) => {
        setSettings(settings);
    }

    const [modal,setModal] = useState({
        open:false,
        content:null
    })

    const updateModal = (update = {open:true,content:<span/>}) => {
        setModal(update)
    }

    const updateTorrentList = () => {
        setTorrentList({needsRefresh: true, list: torrentList.list})
    }

    useEffect(()=>{

        if(settings.loggedin){
            getTorrents().then(resp => {
                setTorrentList({needsRefresh:false,list:resp.data})
            });
        }

        if(torrentList.needsRefresh){
            getTorrents().then(resp => {
                setTorrentList({needsRefresh:false,list:resp.data})
            });
        }
    },[settings.loggedin,torrentList.needsRefresh])

    const [alert,setAlert] = useState({
        open:false,
        title:null,
        message:null
    })

    const updateAlert = (title,message) => {
        setAlert({open:true,title,message})
    }

    const Alert = (props) =>{
        return(
            <AlertDialog isOpen={props.open} onCancel={()=>setAlert({open: false,title:alert.title,message:alert.message})} cancelable>
                <div className="alert-dialog-title">{props.title}</div>
                <div className="alert-dialog-content">
                    {props.message}
                </div>
                <div className="alert-dialog-footer">
                    <Button onClick={()=>setAlert({open: false,title:alert.title,message:alert.message})} className="alert-dialog-button">
                        Ok
                    </Button>
                </div>
            </AlertDialog>
        )
    }

    return (
        <Context.Provider value={{
            settings,
            updateSettings,
            bigScreen,
            modal,
            updateModal,
            installed,
            torrentList,
            updateTorrentList,
            updateAlert
        }}
        >
            <div className={(settings.loggedin ? "loggedin ":"") + (installed ? "installed" : "")}>
                {bigScreen ? <TabletView/> : <Tabs/>}
                <BottomSheet open={modal.open} onDismiss={()=>setModal({open: false})} top={modal.top?modal.top:bigScreen?25:85} children={modal.content}/>
                <Alert open={alert.open} title={alert.title} message={alert.message} />
            </div>
        </Context.Provider>
        );
}

export default App;
