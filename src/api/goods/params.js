import myAxios from '../api'
export function getCateList() {
    return myAxios({
        url: 'categories',
        method: 'get'
    })
}