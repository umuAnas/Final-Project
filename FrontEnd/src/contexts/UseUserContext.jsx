
import UserContext from "./UserContext"
import { useContext } from "react"

export const useUserContext = ()=>{
    const ctx=useContext(UserContext)
    if(!ctx){
    throw new Error("context must be provided")
    }
    return ctx
}