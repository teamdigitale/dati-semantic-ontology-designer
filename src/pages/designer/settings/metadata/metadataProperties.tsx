import { DatePicker, Form, Input, Select } from "antd"
import React from "react"
import { dataTypes } from "src/utils/utils"
import KeyClassSelector from "./KeyClassSelector"
import MetadataIndividualSelector from "./MetadataIndividualSelector"
import { Namespace } from "grapholscape"

export type MetadataProperty = {
  iri: string,
  label: string,
  component: React.ReactElement,
  singleComponent?: React.ReactElement,
  lang?: boolean,
  dataType?: string,
  isIri?: boolean,
  multiple?: boolean,
  optional?: boolean,
}

const accrualPeriodicities = [
  'http://publications.europa.eu/resource/authority/frequency/ANNUAL',
  'http://publications.europa.eu/resource/authority/frequency/ANNUAL_2',
  'http://publications.europa.eu/resource/authority/frequency/ANNUAL_3',
  'http://publications.europa.eu/resource/authority/frequency/BIENNIAL',
  'http://publications.europa.eu/resource/authority/frequency/BIMONTHLY',
  'http://publications.europa.eu/resource/authority/frequency/BIWEEKLY',
  'http://publications.europa.eu/resource/authority/frequency/CONT',
  'http://publications.europa.eu/resource/authority/frequency/DAILY',
  'http://publications.europa.eu/resource/authority/frequency/DAILY_2',
  'http://publications.europa.eu/resource/authority/frequency/IRREG',
  'http://publications.europa.eu/resource/authority/frequency/MONTHLY',
  'http://publications.europa.eu/resource/authority/frequency/MONTHLY_2',
  'http://publications.europa.eu/resource/authority/frequency/MONTHLY_3',
  'http://publications.europa.eu/resource/authority/frequency/NEVER',
  'http://publications.europa.eu/resource/authority/frequency/OP_DATPRO',
  'http://publications.europa.eu/resource/authority/frequency/QUARTERLY',
  'http://publications.europa.eu/resource/authority/frequency/TRIENNIAL',
  'http://publications.europa.eu/resource/authority/frequency/UNKNOWN',
  'http://publications.europa.eu/resource/authority/frequency/UPDATE_CONT',
  'http://publications.europa.eu/resource/authority/frequency/WEEKLY_2',
  'http://publications.europa.eu/resource/authority/frequency/WEEKLY_3',
  'http://publications.europa.eu/resource/authority/frequency/QUINQUENNIAL',
  'http://publications.europa.eu/resource/authority/frequency/DECENNIAL',
  'http://publications.europa.eu/resource/authority/frequency/HOURLY',
  'http://publications.europa.eu/resource/authority/frequency/QUADRENNIAL',
  'http://publications.europa.eu/resource/authority/frequency/BIHOURLY',
  'http://publications.europa.eu/resource/authority/frequency/TRIHOURLY',
  'http://publications.europa.eu/resource/authority/frequency/BIDECENNIAL',
  'http://publications.europa.eu/resource/authority/frequency/TRIDECENNIAL',
]

const getLanguageFomrItem = (iri: string, textArea?: boolean) => {
  return <div>
    <div style={{ display: 'flex', gap: 4, width: '100%', }}>
      <Form.Item
        style={{ flexGrow: 1, margin: '0px 0px 12px 0px' }}
        name={[iri, 'en']}>
        {textArea ? <Input.TextArea /> : <Input />}
      </Form.Item>
      <span style={{ width: 40 }}>@en</span>
    </div>
    <div style={{ display: 'flex', gap: 4, width: '100%', }}>
      <Form.Item
        style={{ flexGrow: 1, margin: '0px 0px 12px 0px' }}
        name={[iri, 'it']}>
        {textArea ? <Input.TextArea /> : <Input />}
      </Form.Item>
      <span style={{ width: 40 }}>@it</span>
    </div>
  </div>
}

const agent: MetadataProperty[] = [
  {
    iri: 'iri',
    label: 'IRI',
    component: <Input />
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/name',
    label: 'Name',
    component: getLanguageFomrItem('http://xmlns.com/foaf/0.1/name'),
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://purl.org/dc/terms/identifier',
    label: 'Identifier',
    component: <Input />,
    dataType: dataTypes.plainLiteral
  },
]

const contact: MetadataProperty[] = [
  {
    iri: 'iri',
    label: 'IRI',
    component: <Input />
  },
  {
    iri: 'http://www.w3.org/2006/vcard/ns#fn',
    label: 'Name',
    component: getLanguageFomrItem('http://www.w3.org/2006/vcard/ns#fn'),
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://www.w3.org/2006/vcard/ns#hasEmail',
    label: 'Email',
    component: <Input />,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://www.w3.org/2006/vcard/ns#hasTelephone',
    label: 'Telephone',
    component: <Input />,
    dataType: dataTypes.plainLiteral
  },
]

const project: MetadataProperty[] = [
  {
    iri: 'iri',
    label: 'IRI',
    component: <Input />
  },
  {
    iri: 'https://w3id.org/italia/onto/l0/name',
    label: 'Name',
    component: getLanguageFomrItem('https://w3id.org/italia/onto/l0/name'),
    lang: true,
    dataType: dataTypes.plainLiteral
  },
]

const group: MetadataProperty[] = [
  {
    iri: 'iri',
    label: 'IRI',
    component: <Input />
  },
  {
    iri: 'http://xmlns.com/foaf/0.1/name',
    label: 'Name',
    component: getLanguageFomrItem('http://xmlns.com/foaf/0.1/name'),
    lang: true,
    dataType: dataTypes.plainLiteral
  }
]

const distribution: MetadataProperty[] = [
  {
    iri: 'iri',
    label: 'IRI',
    component: <Input />
  }, {
    iri: 'http://purl.org/dc/terms/title',
    label: 'Title',
    component: getLanguageFomrItem('http://purl.org/dc/terms/title'),
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://purl.org/dc/terms/description',
    label: 'Description',
    component: getLanguageFomrItem('http://purl.org/dc/terms/description', true),
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://purl.org/dc/terms/format',
    label: 'Format',
    component: <Input />,
    dataType: dataTypes.anyURI
  },
  {
    iri: 'http://purl.org/dc/terms/license',
    label: 'License',
    component: <Input />,
    dataType: dataTypes.anyURI
  },
  {
    iri: 'http://www.w3.org/ns/dcat#accessURL',
    label: 'Access URL',
    component: <Input />,
    dataType: dataTypes.anyURI
  },
  {
    iri: 'http://www.w3.org/ns/dcat#downloadURL',
    label: 'Download URL',
    component: <Input />,
    dataType: dataTypes.anyURI
  },
]

export const ndc: MetadataProperty[] = [
  {
    iri: 'http://purl.org/dc/terms/identifier',
    label: 'Identifier',
    component: <Input />,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#label',
    label: 'Label',
    component: getLanguageFomrItem('http://www.w3.org/2000/01/rdf-schema#label'),
    singleComponent: <Input />,
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://purl.org/dc/terms/title',
    label: 'Title',
    component: getLanguageFomrItem('http://purl.org/dc/terms/title'),
    singleComponent: <Input />,
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://www.w3.org/2000/01/rdf-schema#comment',
    label: 'Comment',
    component: getLanguageFomrItem('http://www.w3.org/2000/01/rdf-schema#comment', true),
    singleComponent: <Input.TextArea />,
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'https://w3id.org/italia/onto/ADMS/officialURI',
    label: 'Official URI',
    component: <Input />,
    dataType: dataTypes.anyURI
  },
  {
    iri: 'http://purl.org/dc/terms/rightsHolder',
    label: 'Rights Holder',
    component: <MetadataIndividualSelector
      title='Agent'
      iri='http://xmlns.com/foaf/0.1/Agent'
      property='http://purl.org/dc/terms/rightsHolder'
      metadataProperty={agent}
    />,
    multiple: true,
    isIri: true
  },
  {
    iri: 'http://purl.org/dc/terms/issued',
    label: 'Creation Date',
    component: <DatePicker />,
    dataType: dataTypes.dateTime
  },
  {
    iri: 'http://purl.org/dc/terms/modified',
    label: 'Last Modified Date',
    component: <DatePicker />,
    dataType: dataTypes.dateTime
  },
  {
    iri: 'http://www.w3.org/2002/07/owl#versionInfo',
    label: 'Version Info',
    component: getLanguageFomrItem('http://www.w3.org/2002/07/owl#versionInfo'),
    singleComponent: <Input.TextArea />,
    lang: true,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'http://purl.org/dc/terms/accrualPeriodicity',
    label: 'Accrual Periodicity ',
    component: <Form.Item name='http://purl.org/dc/terms/accrualPeriodicity' style={{ margin: 0 }}>
      <Select options={accrualPeriodicities.map(i => ({ value: i }))} />
    </Form.Item>,
    isIri: true
  },
  {
    iri: 'http://www.w3.org/ns/dcat#contactPoint',
    label: 'Contacts',
    component: <MetadataIndividualSelector
      title='Contact'
      iri='http://www.w3.org/2006/vcard/ns#Kind'
      metadataProperty={contact}
      property='http://www.w3.org/ns/dcat#contactPoint' />,
    multiple: true,
    isIri: true
  },
  {
    iri: 'http://purl.org/dc/terms/publisher',
    label: 'Publisher',
    component: <MetadataIndividualSelector
      title='Agent'
      iri='http://xmlns.com/foaf/0.1/Agent'
      metadataProperty={agent}
      property='http://purl.org/dc/terms/publisher' />,
    multiple: true,
    isIri: true
  },
  {
    iri: 'http://purl.org/dc/terms/creator',
    label: 'Creator',
    component: <MetadataIndividualSelector
      title='Agent'
      iri='http://xmlns.com/foaf/0.1/Agent'
      metadataProperty={agent}
      property='http://purl.org/dc/terms/creator' />,
    isIri: true,
    multiple: true
  },
  {
    iri: 'http://purl.org/dc/terms/language',
    label: 'Languages',
    component: <Select mode="multiple" options={
      [
        { value: 'http://publications.europa.eu/resource/authority/language/ITA' },
        { value: 'http://publications.europa.eu/resource/authority/language/ENG' }
      ]
    } />,
    isIri: true,
    multiple: true
  },
  {
    iri: 'https://w3id.org/italia/onto/ADMS/hasKeyClass',
    label: 'Main Classes',
    component: <KeyClassSelector property='https://w3id.org/italia/onto/ADMS/hasKeyClass' />,
    isIri: true,
    multiple: true
  },
  {
    iri: 'https://w3id.org/italia/onto/ADMS/prefix',
    label: 'Prefix',
    component: <Input />,
    dataType: dataTypes.plainLiteral
  },
  {
    iri: 'https://w3id.org/italia/onto/ADMS/semanticAssetInUse',
    label: 'Projects',
    component: <MetadataIndividualSelector
      title='Project'
      iri='https://w3id.org/italia/onto/ADMS/Project'
      metadataProperty={project}
      property='https://w3id.org/italia/onto/ADMS/semanticAssetInUse' />,
    isIri: true,
    multiple: true
  },
  {
    iri: 'https://w3id.org/mod#group',
    label: 'Groups',
    component: <MetadataIndividualSelector
      title='Group'
      iri='https://w3id.org/mod#Group'
      metadataProperty={group}
      property='https://w3id.org/mod#group' />,
    multiple: true,
    isIri: true
  },
  {
    iri: 'https://w3id.org/italia/onto/ADMS/hasSemanticAssetDistribution',
    label: 'Distributions',
    component: <MetadataIndividualSelector
      title='Distribution'
      iri='https://w3id.org/italia/onto/ADMS/SemanticAssetDistribution'
      metadataProperty={distribution}
      property='https://w3id.org/italia/onto/ADMS/hasSemanticAssetDistribution' />,
    isIri: true,
    multiple: true
  }
]

export const ndcPrefixes: Namespace[] = [
  new Namespace(['adms'], 'https://w3id.org/italia/onto/ADMS/'),
  new Namespace(['mod'], 'https://w3id.org/mod#'),
  new Namespace(['dcat'], 'http://www.w3.org/ns/dcat#'),
  new Namespace(['dc'], 'http://purl.org/dc/terms/'),
  new Namespace(['foaf'], 'http://xmlns.com/foaf/0.1/'),
]