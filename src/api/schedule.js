import axios from "./index"

export const createSchedule = (payload) =>
    axios.post('/schedule', payload).then(response => response.data)