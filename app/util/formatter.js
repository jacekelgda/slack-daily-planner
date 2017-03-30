const processMessage = (message) => {
  const itemsString = message.text;
  const items = itemsString.split(";").map((item) => {
    return item.trim();
  });

  return items;
}

const generateList = (taskList) => {
  let list = [];
  taskList.forEach((item, index) => {
    list[index] = '[' + (item.achieved ? 'x' : ' ') +'] ' + item.name + '\n';
  })
  return list;
}

const formatListToSlackText = (list) => {
  let listAsText = '';
  list.forEach((item, index) => {
    listAsText += item;
  });

  return listAsText;
}

const processCalendarEvents = (calendarEvents) => {
  let events = []
  calendarEvents.forEach((event, index) => {
    events.push(event.summary) 
  })

  return events
}

export {
  processMessage,
  generateList,
  formatListToSlackText,
  processCalendarEvents
}
