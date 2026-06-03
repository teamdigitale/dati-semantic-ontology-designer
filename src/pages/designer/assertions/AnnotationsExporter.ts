import { Annotation, DefaultAnnotationProperties, GrapholEntity, Ontology, RendererStatesEnum, TypesEnum } from "grapholscape";
const ExcelJS = require('exceljs')

export default class AnnotationsExporter {

  constructor(public ontology: Ontology, public selectedDiagrams: string[] = [], public selectedEntityTypes: TypesEnum[] = [], public includeAllEntities: boolean) {
  }

  public generateAnnotationsDataCsv = () => {
    const annotationData = this.getAnnotationData()
    const csvData = this.csvmaker(annotationData)
    this.downloadFile(csvData, 'csv')
  }

  public generateTemplateDataCsv = () => {
    const annotationData = this.getTemplateData()
    const csvData = this.csvmaker(annotationData)
    this.downloadFile(csvData, 'csv')
  }

  public generateAnnotationsDataXlsx = () => {
    const annotationData = this.getAnnotationData()
    const excelData = this.xlsxmaker(annotationData)
    this.downloadFile(excelData, 'xlsx')
  }

  public generateTemplateDataXlsx = () => {
    const annotationData = this.getTemplateData()
    const excelData = this.xlsxmaker(annotationData)
    this.downloadFile(excelData, 'xlsx')

  }

  private getAnnotationData = () => {
    let annotationData: { iri: string, simple_name: string, ann_property: string, datatype: string, lang: string, value: string }[] = []
    let processedEntities: Set<GrapholEntity> = new Set()
    this.ontology.entities.forEach((e) => {
      let entity: GrapholEntity = e
      let diagramCheck = false
      this.ontology.diagrams.forEach(d => {
        if (this.selectedDiagrams.includes(d.id.toString()) && d.containsEntity(entity, RendererStatesEnum.FLOATY)) {
          diagramCheck = true
        }
      })
      let typeCheck = false
      this.selectedEntityTypes.forEach(t =>
        typeCheck = entity.getOccurrenceByType(t, RendererStatesEnum.FLOATY) !== undefined || typeCheck
      )
      if (diagramCheck && typeCheck) {
        e.getAnnotations().forEach(a => {
          let ann: Annotation = a

          let iri = entity.fullIri
          let simple_name = entity.iri.remainder
          let ann_property = ann.property || ''
          let datatype = ann.datatype || ''
          let lang = ann.language || ''
          let value = '"' + ann.value + '"'
          annotationData.push({ iri, simple_name, ann_property, datatype, lang, value })
          processedEntities.add(entity)

        })
      }
    })
    if (this.includeAllEntities) {
      this.ontology.entities.forEach(e => {
        let entity: GrapholEntity = e
        let diagramCheck = false
        this.ontology.diagrams.forEach(d => {
          if (this.selectedDiagrams.includes(d.id.toString()) && d.containsEntity(entity, RendererStatesEnum.FLOATY)) {
            diagramCheck = true
          }
        })
        let typeCheck = false
        this.selectedEntityTypes.forEach(t =>
          typeCheck = entity.getOccurrenceByType(t, RendererStatesEnum.FLOATY) !== undefined || typeCheck
        )
        if (diagramCheck && typeCheck && !processedEntities.has(entity)) {

          let iri = entity.fullIri
          let simple_name = entity.iri.remainder
          let ann_property = DefaultAnnotationProperties.label.fullIri
          let datatype = ''
          let lang = ''
          let value = ''
          annotationData.push({ iri, simple_name, ann_property, datatype, lang, value })

        }
      })
    }
    annotationData.sort((a, b) => {
      const iriA = a.iri.toUpperCase()
      const iriB = b.iri.toUpperCase()
      if (iriA < iriB) {
        return -1
      }
      if (iriA > iriB) {
        return 1
      }
      return 0
    })
    return annotationData
  }

  private getTemplateData = () => {
    let annotationData: { iri: string, simple_name: string, ann_property: string, datatype: string, lang: string, value: string }[] = []
    this.ontology.entities.forEach(e => {
      let entity: GrapholEntity = e
      let diagramCheck = false
      this.ontology.diagrams.forEach(d => {
        if (this.selectedDiagrams.includes(d.id.toString()) && d.containsEntity(entity, RendererStatesEnum.FLOATY)) {
          diagramCheck = true
        }
      })
      let typeCheck = false
      this.selectedEntityTypes.forEach(t =>
        typeCheck = entity.getOccurrenceByType(t, RendererStatesEnum.FLOATY) !== undefined || typeCheck
      )
      if (diagramCheck && typeCheck) {

        let iri = entity.fullIri
        let simple_name = entity.iri.remainder
        let ann_property = DefaultAnnotationProperties.label.fullIri
        let datatype = ''
        let lang = ''
        let value = ''
        annotationData.push({ iri, simple_name, ann_property, datatype, lang, value })

      }
    })
    annotationData.sort((a, b) => {
      const iriA = a.iri.toUpperCase()
      const iriB = b.iri.toUpperCase()
      if (iriA < iriB) {
        return -1
      }
      if (iriA > iriB) {
        return 1
      }
      return 0
    })
    return annotationData
  }

  private csvmaker = (data) => {
    let csvRows: string[] = []
    const headers = data.length > 0 ? Object.keys(data[0]) : ['IRI', 'SIMPLE_NAME', 'ANN_PROPERTY', 'DATATYPE', 'LANG', 'VALUE']
    csvRows.push(headers.join(',').toUpperCase())
    if (data.length > 0) {
      data.forEach(annOb => {
        let v = Object.values(annOb).join(',')
        csvRows.push(v)
      }
      )
    }
    return csvRows.join('\r\n')
  }

  private xlsxmaker = (data) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(this.ontologyName);
    sheet.columns = [
      { header: 'IRI', key: 'iri', width: 20 },
      { header: 'SIMPLE_NAME', key: 'simple_name', width: 12 },
      { header: 'ANN_PROPERTY', key: 'ann_property', width: 20, },
      { header: 'DATATYPE', key: 'datatype', width: 20, },
      { header: 'LANG', key: 'lang', width: 10, },
      { header: 'VALUE', key: 'value', width: 20, }
    ];
    sheet.addRows(data)
    return workbook
  }

  private downloadFile = (data, format) => {
    if (format === 'csv') {
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', this.ontologyName + '.csv');
      a.click()
    } else {
      data.xlsx.writeBuffer().then((d) => {
        const blob = new Blob([d], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
        const url = window.URL.createObjectURL(blob)
        let a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", this.ontologyName + ".xlsx");
        a.click()
      })
    }
  }


  private get ontologyName() {
    return this.ontology.name || 'ontology'
  }
}