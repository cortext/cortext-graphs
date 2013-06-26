Handlebars.registerHelper "date",(timestamp)->
  return moment(timestamp).format("DD.MM.YYYY hh:mm:ss")