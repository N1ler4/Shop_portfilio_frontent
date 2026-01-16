import Cookies from "js-cookie"


export const saveAccessToken = (accessToken: string) => {
    Cookies.set("token", accessToken)
}
export const saveRefreshToken = (refreshToken: string) => {
    Cookies.set("refresh_token", refreshToken)
}


export const saveId = (id: any) => {
    Cookies.set("id", id)
}

export const getAccessToken = () => {
    return Cookies.get("token")
}

export const getRefreshToken = () => {
    return Cookies.get("refresh_token")
}

export const getId = () => {
    return Cookies.get("id")
}

export const removeToken = () => {
    Cookies.remove("token")
    Cookies.remove("refresh_token")
}