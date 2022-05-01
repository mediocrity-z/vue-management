import myAxios from "../api";
export function userLogin(loginForm) {
    return myAxios({
        url: 'login',
        method: 'post',
        data: loginForm
    })
}