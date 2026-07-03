window.SomaImport={
  async fromFile(file,settings){const buffer=await file.arrayBuffer(); const isCsv=/\.csv$/i.test(file.name); const wb=isCsv?XLSX.read(new TextDecoder('utf-8').decode(buffer),{type:'string'}):XLSX.read(buffer,{type:'array',cellDates:true}); const sheet=SomaParser.chooseSheet(wb); const vehicles=SomaParser.parseRows(sheet.rows,sheet.map,settings); const validation=SomaValidator.validate(vehicles,sheet.map); return {fileName:file.name,sheetName:sheet.name,rows:sheet.rows.length-1,map:sheet.map,vehicles,validation,importedAt:new Date().toISOString()};}
};
