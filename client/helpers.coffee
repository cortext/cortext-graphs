Handlebars.registerHelper "date",(timestamp)->
  return moment(timestamp).format("DD.MM.YYYY HH:mm:ss")