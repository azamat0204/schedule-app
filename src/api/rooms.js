import axios from './index'

export const getRooms = () =>
    axios.get('/rooms').then((response) => response.data)
