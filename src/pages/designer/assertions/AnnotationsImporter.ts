import { Annotation, Iri, Ontology} from "grapholscape";
const ExcelJS = require('exceljs')

export default class AnnotationsImporter{

    constructor(public ontology: Ontology, public updateFunc: ()=> void) {
    }

    public importAnnotationsDataCsv = (file: File) => { 
        let reader = new FileReader();
        let addAnnotations = (data) => this.addAnnotationsFromCsv(data)
        reader.readAsText(file, "UTF-8");
        reader.onload = function (e) {
            let fileContent = e.target?.result
            addAnnotations(fileContent)
        }
        reader.onerror = function (e) {
            console.log("error reading file")
        }
    }

    public importAnnotationsDataXlsx = async (file: File) => {
        let workbook = new ExcelJS.Workbook(); 
        file.arrayBuffer().then(
            (buffer) => {
                workbook.xlsx.load(buffer).then(
                    () => {
                        let rows: Array<string>[] = []
                        let worksheet = workbook.getWorksheet(1);
                        worksheet.eachRow({ includeEmpty: false }, function(row) {
                                                rows.push(row.values.slice(1))
                                            })
                        const header = ['IRI', 'SIMPLE_NAME', 'ANN_PROPERTY', 'DATATYPE', 'LANG', 'VALUE']
                        if(rows[0].length === header.length && rows[0].every((element, index) => element === header[index])){
                            rows.shift()
                            rows = rows.filter(r => r.length > 1)
                            this.addAnnotations(rows)
                        }
                        
                    }
                ) 
            })
    }

    addAnnotationsFromCsv(fileContent) {
        const new_line = '\r\n'
        const delimiter = ','
        let rows = fileContent.split(new_line)
        rows = rows.map(r => { return r.split(delimiter) })
        const header = ['IRI', 'SIMPLE_NAME', 'ANN_PROPERTY', 'DATATYPE', 'LANG', 'VALUE']
        if(rows[0].length === header.length && rows[0].every((element, index) => element === header[index])){
            rows.shift()
            rows = rows.filter(r => r.length > 1)
            this.addAnnotations(rows)
        }
    }

    addAnnotations(rows) {
        rows.forEach(annoArray => {
            let property = new Iri(annoArray[2], this.ontology.namespaces)
            let lexicalForm = annoArray[5].startsWith('"') ? annoArray[5].slice(1) : annoArray[5]
            lexicalForm = lexicalForm.endsWith('"') ? lexicalForm.slice(-1) : lexicalForm
            let lang = annoArray[4]
            let datatype = annoArray[3]
            if(lexicalForm && lexicalForm.length > 0){
                let annotation = new Annotation(property, lexicalForm, lang, datatype )
                let entity = this.ontology.getEntity(annoArray[0])
                if(entity){
                    entity.addAnnotation(annotation)
                }  
            }
        })
        this.updateFunc()
    }
}