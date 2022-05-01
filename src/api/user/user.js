import myAxios from "../api";
export function getUserList(queryInfo) {
    return myAxios({
        url: 'users',
        method: 'get',
        params: queryInfo
    })
}
export function stateChanged(userinfo) {
    return myAxios({
        url: `users/${userinfo.id}/state/${userinfo.mg_state}`,
        method: 'put'
    })
}
export function addUser(addForm) {
    return myAxios({
        url: 'users',
        method: 'post',
        data: addForm
    })
}
export function showEditDialog(id) {
    return myAxios({
        url: 'users/' + id,
        method: 'get'
    })
}
export function editUserInfo(editForm) {
    return myAxios({
        url: 'users/' + editForm.id,
        method: 'put',
        data: {
            email: editForm.email,
            mobile: editForm.mobile
        }
    })
}
export function removeUserById(id) {
    return myAxios({
        url: 'users/' + id,
        method: 'delete'
    })
}
export function setRole() {
    return myAxios({
        url: 'roles',
        method: 'get'
    })
}