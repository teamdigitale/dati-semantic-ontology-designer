import { Grapholscape, TypesEnum } from "grapholscape";
import { computeIRI } from "src/builder/iri-processing";
import OntologyBuilder from "src/builder/ontology-builder";
import { PropertyInfo } from "src/builder/properties-info";
import { FunctionPropertiesEnum } from "src/gen";
const ExcelJS = require('exceljs')

export default class OntologyExcelImporter {

  constructor(public grapholscape: Grapholscape, public updateFunc: (rows) => void) {
  }

  public importOntologyXlsx = async (file: File, diagram: number, namespace: string, lang: string) => {
    let workbook = new ExcelJS.Workbook();
    file.arrayBuffer().then(
      (buffer) => {
        workbook.xlsx.load(buffer).then(
          () => {
            let headers = {}
            headers['CLASS'] = ['SIMPLE_NAME', 'PARENT']
            headers['DATAPROPERTY'] = ['SIMPLE_NAME', 'PARENT', 'DATATYPE', 'DOMAIN', 'Functional']
            headers['OBJECTPROPERTY'] = ['SIMPLE_NAME', 'DOMAIN', 'RANGE', 'Typed/Mandatory/Both', 'Typed/Mandatory/Both', 'Functional/InverseFunctional']
            headers['INDIVIDUAL'] = ['SIMPLE_NAME', 'PARENT']
            let incorrectRows = {}
            workbook.eachSheet((sheet, sheetId) => {
              let rows: Array<string>[] = []
              sheet.eachRow({ includeEmpty: false }, function (row) {
                rows.push(row.values.slice(1))
              })
              let entityType = Object.keys(headers)[sheetId - 1]
              let header = headers[entityType]
              if (rows[0].length === header.length && rows[0].every((element, index) => element.includes(header[index]))) {
                rows.shift()
                rows = rows.filter(r => r.length > 1)
                incorrectRows[entityType] = this.addEntities(entityType, rows, diagram, namespace, lang)
              }
            })
            this.updateFunc(incorrectRows)
            console.log(incorrectRows)
          }
        )
      })
  }

  public addEntities(entityType, rows, diagram, namespace, lang) {
    let ontologyBuilder = new OntologyBuilder(this.grapholscape)
    let ontology = this.grapholscape.ontology
    let incorrectRows: number[] = []
    let i = 1
    rows.forEach(entityArray => {
      i = i + 1
      const simpleName = entityArray[0]
      const iri = computeIRI(namespace, simpleName)
      try {
        switch (entityType) {
          case 'CLASS':
            const cParent = entityArray[1]
            ontologyBuilder.addNodeElement(
              iri,
              TypesEnum.CLASS,
              undefined,
              undefined,
              undefined,
              undefined,
              true,
              true,
              true,
              lang,
              diagram
            )
            if (cParent) {
              const parentIri = computeIRI(namespace, cParent)
              if (!ontology.getEntity(parentIri)) {
                ontologyBuilder.addNodeElement(
                  parentIri,
                  TypesEnum.CLASS,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  true,
                  true,
                  true,
                  lang,
                  diagram
                )
              }
              ontologyBuilder.addEdgeElement(
                null,
                TypesEnum.INCLUSION,
                iri,
                parentIri,
                [TypesEnum.CLASS, TypesEnum.CLASS],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                diagram
              )
            }
            break
          case 'DATAPROPERTY':
            const dpParent = entityArray[1]
            const dpDatatype = entityArray[2]
            const dpDomain = entityArray[3]
            const dpFunctional = entityArray[4]
            let domainIri = computeIRI(namespace, dpDomain)
            let domainEntity = ontology.getEntity(domainIri)
            if (!domainEntity) {
              ontologyBuilder.addNodeElement(
                domainIri,
                TypesEnum.CLASS,
                undefined,
                undefined,
                undefined,
                undefined,
                true,
                true,
                true,
                lang,
                diagram
              )
            }
            let props = dpFunctional && dpFunctional.length > 0 ? dpFunctional.trim() : null
            let properties: PropertyInfo = props && props.includes('Functional') ? { functionProperties: [FunctionPropertiesEnum.FUNCTIONAL], domainMandatory: false, domainTyped: false } : { functionProperties: [], domainMandatory: false, domainTyped: false }
            ontologyBuilder.addNodeElement(
              iri,
              TypesEnum.DATA_PROPERTY,
              domainIri,
              undefined,
              properties,
              dpDatatype,
              true,
              true,
              true,
              lang,
              diagram
            )
            if (dpParent) {
              const parentIri = computeIRI(namespace, dpParent)
              if (!ontology.getEntity(parentIri)) {
                ontologyBuilder.addNodeElement(
                  parentIri,
                  TypesEnum.DATA_PROPERTY,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  true,
                  true,
                  true,
                  lang,
                  diagram
                )
              }
              ontologyBuilder.addEdgeElement(
                null,
                TypesEnum.INCLUSION,
                iri,
                parentIri,
                [TypesEnum.DATA_PROPERTY, TypesEnum.DATA_PROPERTY],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                diagram
              )
            }
            break
          case 'INDIVIDUAL':
            const iParent = entityArray[1]
            let parentIri: string | undefined = undefined
            if (iParent) {
              parentIri = computeIRI(namespace, iParent)
              if (!ontology.getEntity(parentIri)) {
                ontologyBuilder.addNodeElement(
                  parentIri,
                  TypesEnum.CLASS,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  true,
                  true,
                  true,
                  lang,
                  diagram
                )
              }
            }
            ontologyBuilder.addNodeElement(
              iri,
              TypesEnum.INDIVIDUAL,
              parentIri,
              undefined,
              undefined,
              undefined,
              true,
              true,
              true,
              lang,
              diagram
            )
            break
          case 'OBJECTPROPERTY':
            const opDomain = entityArray[1]
            const opRange = entityArray[2]
            let domainTyped = entityArray[3]
            domainTyped = domainTyped && domainTyped.length > 0 ? domainTyped.trim() : domainTyped
            let rangeTyped = entityArray[4]
            rangeTyped = rangeTyped && rangeTyped.length > 0 ? rangeTyped.trim() : rangeTyped
            let functional: string = entityArray[5]
            functional = functional && functional.length > 0 ? functional.trim().replace(/\s/g, '') : functional
            let opDomainIri = computeIRI(namespace, opDomain)
            let opDomainEntity = ontology.getEntity(opDomainIri)
            if (!opDomainEntity) {
              ontologyBuilder.addNodeElement(
                opDomainIri,
                TypesEnum.CLASS,
                undefined,
                undefined,
                undefined,
                undefined,
                true,
                true,
                true,
                lang,
                diagram
              )
            }
            let opRangeIri = computeIRI(namespace, opRange)
            let opRangeEntity = ontology.getEntity(opRangeIri)
            if (!opRangeEntity) {
              ontologyBuilder.addNodeElement(
                opRangeIri,
                TypesEnum.CLASS,
                undefined,
                undefined,
                undefined,
                undefined,
                true,
                true,
                true,
                lang,
                diagram
              )
            }
            let opprops = functional && functional.length > 0 ? functional.split(',') : null
            let opproperties: PropertyInfo = { functionProperties: [], domainMandatory: domainTyped === 'Both' || domainTyped === 'Mandatory', domainTyped: domainTyped === 'Both' || domainTyped === 'Typed', rangeMandatory: rangeTyped === 'Both' || rangeTyped === 'Mandatory', rangeTyped: rangeTyped === 'Both' || rangeTyped === 'Typed' }
            if (opprops) {
              if (opprops.includes('Functional')) {
                opproperties.functionProperties.push(FunctionPropertiesEnum.FUNCTIONAL)
              }
              if (opprops.includes('InverseFunctional')) {
                opproperties.functionProperties.push(FunctionPropertiesEnum.INVERSE_FUNCTIONAL)
              }
            }
            ontologyBuilder.addEdgeElement(
              iri,
              TypesEnum.OBJECT_PROPERTY,
              opDomainIri,
              opRangeIri,
              [TypesEnum.CLASS, TypesEnum.CLASS],
              opproperties,
              true,
              true,
              true,
              lang,
              diagram
            )
        }
      } catch (error) {
        incorrectRows.push(i)
      }
    })
    return incorrectRows
    //this.updateFunc(incorrectRows)
  }

}
