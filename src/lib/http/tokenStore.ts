let accessToken:string|null
export const tokenStore={
    get:()=>accessToken,
    set:(t:string|null)=>{accessToken=t}
}