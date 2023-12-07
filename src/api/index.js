import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'https://schedule-backend.up.railway.app',
})

export default axiosInstance
