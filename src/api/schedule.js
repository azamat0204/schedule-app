import axios from './index.js'

export const createSchedule = (payload) =>
    axios.post('/schedule', payload).then((response) => response.data)

export const deleteSchedule = (id) =>
    axios.delete(`/schedule/${id}`).then((response) => response.data)
