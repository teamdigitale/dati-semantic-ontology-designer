import { Ontology } from "grapholscape";
const ExcelJS = require('exceljs')


export default class OntologyTemplateExporter {

    constructor(public ontology: Ontology) {
    }

    public generateXlsxTemplate = () => {
        const workbook = new ExcelJS.Workbook();
        const classes = workbook.addWorksheet('CLASSES')
        const dataproperties = workbook.addWorksheet('DATAPROPERTIES')
        const objectproperties = workbook.addWorksheet('OBJECTPROPERTIES')
        const individuals = workbook.addWorksheet('INDIVIDUALS')
        classes.columns = [
            {header: 'SIMPLE_NAME', key: 'simple_name', width: 20, font: {bold: true}}, 
            {header: 'PARENT', key: 'parent', width: 20, wrapText: true},
        ]
        dataproperties.columns = [
            {header: 'SIMPLE_NAME', key: 'simple_name', width: 20, font: {bold: true}}, 
            {header: 'PARENT', key: 'parent', width: 20, wrapText: true},
            {header: 'DATATYPE', key: 'datatype', width: 20, wrapText: true},
            {header: 'DOMAIN', key: 'domain', width: 20, wrapText: true},
            {header: 'Functional', key: 'range',  width: 20, wrapText: true},
        ]
        objectproperties.columns = [
            {header: 'SIMPLE_NAME', key: 'simple_name', width: 20, font: {bold: true}}, 
            {header: 'DOMAIN', key: 'domain', width: 20, wrapText: true},
            {header: 'RANGE', key: 'range',  width: 20, wrapText: true},
            {header: 'DOMAIN: Typed/Mandatory/Both', key: 'domain-typed', width: 40, wrapText: true},
            {header: 'RANGE: Typed/Mandatory/Both', key: 'range-typed', width: 40, wrapText: true},
            {header: 'Functional/InverseFunctional', key: 'range',  width: 40, wrapText: true},
        ]
        individuals.columns = [
            {header: 'SIMPLE_NAME', key: 'simple_name', width: 20, font: {bold: true}}, 
            {header: 'PARENT', key: 'parent', width: 20, wrapText: true},
        ]
        workbook.eachSheet(function(sheet, sheetId) {
            let header = sheet.getRow(1)
            header.eachCell(cell => {
                cell.style = {font:{bold: true}}
                cell.alignment = 
                { horizontal: 'center', vertical :'middle' ,wrapText: true};
            })
          })
        this.downloadFile(workbook)
        return;
    }

    public downloadFile(data) {
        data.xlsx.writeBuffer().then((d) => {
            const blob = new Blob([d], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
            const url = window.URL.createObjectURL(blob)
            let a = document.createElement("a");
            a.setAttribute("href", url);
            a.setAttribute("download", this.ontology.name+".xlsx");
            a.click()
        })
    }
}