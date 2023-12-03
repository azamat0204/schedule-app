import moment from 'moment/moment'

export const combineDateTime = (startDate, time) => {
    return moment(
        `${moment(startDate).format('YYYY-MM-DD')} ${moment(time).format(
            'HH:mm',
        )}`,
    ).format('YYYY-MM-DD HH:mm')
}
