
import UserContext from "./usercontext"
import { useContext } from "react"

export const useUserContext = ()=>{
    const ctx=useContext(UserContext)
    if(!ctx){
    throw new Error("context must be provided")
    }
    return ctx
}