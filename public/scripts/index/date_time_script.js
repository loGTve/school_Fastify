/*
* Update Time
* root.ts -> #serverTime
* */
setInterval(() => {
    const dateTime = new Date();

    // Date
    const yearText = dateTime.getFullYear() + '년';
    const monthText = (dateTime.getMonth() + 1) + '월';
    const dayText = dateTime.getDate() + '일';
    
    // Time
    const hoursText = dateTime.getHours() + '시';
    const minutesText = dateTime.getMinutes() + '분';
    const secondsText = dateTime.getSeconds() + '초';
    
    const nowDateTimeText = `${yearText} ${monthText} ${dayText} - ${hoursText} ${minutesText} ${secondsText}`;

    document.getElementById('serverTime').innerText = nowDateTimeText;
}, 10);