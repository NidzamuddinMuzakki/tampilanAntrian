import React, { useEffect, useState } from 'react';
import axios from "axios";
// import useSWR from "swr";
let socket2 = new WebSocket("wss://antrian-online.onrender.com/antrian/v1/loket/user-id")
const OperatorList = ()=>{
    const [data,setData] = useState([])
    const [fetchLagi, setFetchLagi] = useState(false)
    const [onPanggil, setOnPanggil] = useState(false)
    const [token,setToken] = useState("")
    const [loketId,setLoketId] = useState(0)
    useEffect(()=>{
        setData([])
        if(localStorage.getItem("loket_id")){
            setToken(localStorage.getItem("token"))
            // setTimeout(()=>{
            //     setFetchLagi((y)=>!y)
            // },1000) 

            setLoketId(parseInt(localStorage.getItem("loket_id")))
        }
        
        if(!localStorage.getItem("token")){
          
               
            window.location = "https://antrian-online.netlify.app/login";
                
            
        }

    },[])
    useEffect(()=>{
        if(token && loketId){
           
        
        socket2 = new WebSocket(`wss://antrian-online.onrender.com/antrian/v1/loket/user-id?loket_id=${loketId}&token=${token}`);

        socket2.onopen = () => {
                console.log('WebSocket connection established');
                setTimeout(()=>{
                    
                    socket2.send(JSON.stringify({"type":"register","tipe_pasien_id":loketId}))
                },1000)
        };
        socket2.onclose = () => {
            console.log('WebSocket connection closed');
        };
        socket2.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Real-time update:', data);
            if(data.type==="selesai" || data.type==="panggil"  || data.type==="insert-antrian" || data.id==2){
               
                setFetchLagi((y)=>!y)
            }
        };
    }
    },[token,loketId])
    

    useEffect(()=>{
        
        setData([])
        if(token){
            axios.get('https://antrian-online.onrender.com/antrian/v1/antrian/list',{headers:{"Authorization":"Bearer "+token}}).then(res=>{
            if(res?.data?.data){
                console.log(res?.data?.data)
                setData(()=>res?.data?.data)
            }
        }).catch(err=>{
            console.log(err)
        })
        }
    },[fetchLagi, token, loketId])
   
    useEffect(()=>{
        if(data.length && loketId && token){
            let lll = 0
            data?.map((aav,ak)=>{
                if(aav.status==='call' && aav.loket_id===loketId){
                    lll++    
                    setOnPanggil(true) 
                } 
               
            })
           if(!lll){
                setOnPanggil(false)

            }
           
        }
    },[JSON.stringify(data), fetchLagi,loketId, token])
   

    return(
    <>
        <header className="App-header">
            <button onClick={()=>{localStorage.removeItem("token"); window.location = "https://antrian-online.netlify.app/login";}}>Logout</button>
          
            <h4 style={{ marginTop:"0px",marginBottom:"40px" }}>Pilih Panggil Loket {loketId}</h4>
            <div className="Karcis-container">
                {data?.length && data?.map((antrians, index)=>(
                    
                <div  className="Karcis-wrapper" key={antrians.id}>
                    <div className="Karcis-tittle">{antrians.tipe_pasien_name}</div>
                    <div className="Karcis-tittle">{antrians.number}</div>
                    <div className="Karcis-tittle">Sisa : {antrians.count}</div>

                    <button disabled={(antrians.loket_id===loketId && onPanggil) || (antrians.loket_id!==loketId && onPanggil) } onClick={()=>{
                        socket2.send(JSON.stringify({
                            "type":"call",
                            "body":{
                                "tipe_pasien_id":antrians.tipe_pasien_id,
                                "id":antrians.id,
                                "loket_id":loketId, 
                            }
                        }))
                    }}>Panggil</button>
                    <button disabled={ (antrians.loket_id!==loketId && onPanggil) || !onPanggil }  onClick={()=>{
                        socket2.send(JSON.stringify({
                            "type":"selesai",
                            "body":{
                                "tipe_pasien_id":antrians.tipe_pasien_id,
                                "id":antrians.id,
                                "loket_id":loketId, 
                            }
                        }))
                    }}>Selesai</button>

                </div>

                ))}
                
            </div>
        </header>
    </>
    )
}

export default OperatorList